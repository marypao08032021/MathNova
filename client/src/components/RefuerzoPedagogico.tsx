import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { activityCurriculum } from "../curriculum/activityCurriculum";
import { answered, evaluateQuestion, learningActivities, newAttemptId, emptyDrawing, type Answer } from "../pedagogy/learningEngine";
import { guardarProgresoUsuarioActual, obtenerIdUsuarioAutenticado } from "../services/progresoService";
import AvisoActividad from "./AvisoActividad";
import ConstruccionMatematica from "./ConstruccionMatematica";
import ExploracionMatematica, { type ExplorationEvidence } from "./ExploracionMatematica";
import "../styles/pedagogicalReinforcement.css";

type Submission = { attemptId: string; attemptNumber: number; date: string; answers: Record<string, Answer>; evaluated: Record<string, boolean | null>; assisted: boolean; seconds: number; exploration: ExplorationEvidence | null; explanation: string; configurations: string[] };
type Draft = { version: string; answers: Record<string, Answer>; explanation: string; seen: string[]; started: boolean; submissions: Submission[] };
function loadDraft(key: string): Draft | null { try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value?.version === "refuerzo-v1" ? value : null; } catch { return null; } }
export default function RefuerzoPedagogico({ activityId }: { activityId: string }) {
 const curriculum=activityCurriculum[activityId],activity=learningActivities[activityId];
 const userId=obtenerIdUsuarioAutenticado(); const storageKey=`mathnova_refuerzo_v1_${userId ?? "invitado"}_${activityId}`;
 const initial=useMemo(()=>loadDraft(storageKey),[storageKey]);
 const [answers,setAnswers]=useState<Record<string,Answer>>(initial?.answers||{}),[explanation,setExplanation]=useState(initial?.explanation||""),[seen,setSeen]=useState<string[]>(initial?.seen||[]),[started,setStarted]=useState(initial?.started||false),[submissions,setSubmissions]=useState<Submission[]>(initial?.submissions||[]);
 const [observation,setObservation]=useState<ExplorationEvidence|null>(null),[notice,setNotice]=useState<string|null>(null),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false),[storageError,setStorageError]=useState(false),[saveError,setSaveError]=useState<string|null>(null),[reviewVisible,setReviewVisible]=useState(false);
 const clock=useRef<number|null>(null),sending=useRef(false),panel=useRef<HTMLElement>(null),feedback=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(initial?.started)clock.current=Date.now();},[initial?.started]);
 const observe=useCallback((e:ExplorationEvidence)=>{setObservation(e);const key=JSON.stringify([e.model,e.a,e.b,e.replacement]);setSeen(values=>values.includes(key)?values:[...values,key]);},[]);
 useEffect(()=>{let failed=false;try {localStorage.setItem(storageKey,JSON.stringify({version:activity.version,answers,explanation,seen,started,submissions} satisfies Draft));}catch{failed=true;}let disposed=false;queueMicrotask(()=>{if(!disposed)setStorageError(failed);});return()=>{disposed=true;};},[storageKey,activity.version,answers,explanation,seen,started,submissions]);
 useEffect(()=>{if(reviewVisible)feedback.current?.focus();},[reviewVisible]);
 const automatic=activity.questions.filter(q=>q.kind!=="open");
 const last=submissions.at(-1),correct=last?Object.values(last.evaluated).filter(v=>v===true).length:0;
 const goBack=()=>panel.current?.nextElementSibling?.scrollIntoView({behavior:"smooth",block:"start"});
 const start=()=>{if(seen.length<2||explanation.trim().length<15){setNotice("Compara dos configuraciones del ejemplo y escribe qué observaste antes de comenzar.");return;}setStarted(true);clock.current=Date.now();};
 const change=(id:string,value:Answer)=>{setAnswers(old=>({...old,[id]:value}));setSaved(false);setSaveError(null);};
 const buildSubmission=():Submission=>({attemptId:newAttemptId(),attemptNumber:(submissions.at(-1)?.attemptNumber??0)+1,date:new Date().toISOString(),answers:structuredClone(answers),evaluated:Object.fromEntries(activity.questions.map(q=>[q.id,evaluateQuestion(q,answers[q.id])])),assisted:submissions.length>0,seconds:Math.max(0,Math.floor((Date.now()-(clock.current??Date.now()))/1000)),exploration:observation,explanation,configurations:[...seen]});
 const save=async(current:Submission)=>{
   if(sending.current)return; sending.current=true;setSaving(true);setSaveError(null);
   try {if(!userId){setSaveError("Tu evidencia queda en este navegador. Inicia sesión para enviarla al servidor.");return;}
    const raw=submissions.includes(current)?submissions:[...submissions,current];
    const all=raw.length>10?[raw[0],...raw.slice(-9)]:raw;
    const response = await guardarProgresoUsuarioActual({mundo:activityId.startsWith("mathgeometry")?"MathGeometry":activityId.startsWith("mathdata")?"MathData":"MathNumbers",tema:curriculum.content,actividad_codigo:`${activityId}-refuerzo-pda-v1`,actividad_titulo:curriculum.title,respuestas:{schema_version:"refuerzo-v1",native_count:activity.nativeCount,combined_count:activity.totalCount,curriculum_id:activityId,question_count:activity.questions.length,automatic_count:automatic.length,pending_teacher_review:activity.questions.filter(q=>q.kind==="open").map(q=>({id:q.id,prompt:q.prompt,rubric:q.rubric,answer:current.answers[q.id]})),first_attempt:all[0],latest_attempt:current,attempts:all,attempt_count:current.attemptNumber,history_retention:"Primer intento y hasta los nueve últimos",assistance_after_feedback:current.assisted,criterion:"Práctica complementaria; revisión docente pendiente. La misión original registra su avance por separado."},aciertos:Object.values(current.evaluated).filter(v=>v===true).length,total_preguntas:automatic.length,tiempo_segundos:0,xp_base:0,completada:false});if(!response.ok)throw new Error(response.mensaje||"El servidor no confirmó el guardado.");
    const stored = response.progreso?.respuestas as { latest_attempt?: Submission; attempts?: Submission[] } | undefined;
    if(stored?.latest_attempt?.attemptId===current.attemptId && Array.isArray(stored.attempts)) setSubmissions(stored.attempts);
    setSaved(true);
   }catch(error){setSaveError(error instanceof Error?error.message:"No se pudo guardar. Tu borrador local se conserva.");}finally{sending.current=false;setSaving(false);}
 };
 const submit=async()=>{if(sending.current)return;const incomplete=activity.questions.filter(q=>!answered(q,answers[q.id]));if(incomplete.length){setNotice(`Faltan ${incomplete.length} reactivos. Responde también la explicación final; si usas una construcción, modifica al menos un control o coloca un punto.`);return;}
  const attempt=buildSubmission();clock.current=Date.now();setSubmissions(v=>{const all=[...v,attempt];return all.length>10?[all[0],...all.slice(-9)]:all;});setReviewVisible(true);setSaved(false);await save(attempt);
 };
 const download=()=>{const payload={version:activity.version,activityId,title:curriculum.title,nativeCount:activity.nativeCount,totalCount:activity.totalCount,grade:curriculum.grade,content:curriculum.content,pda:curriculum.pda,questions:activity.questions,submissions,draft:answers,exploration:observation};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`${activityId}-evidencia.json`;a.click();URL.revokeObjectURL(url);};
 return <section ref={panel} className="pda-panel" aria-label="Preparación y práctica ampliada"><div className="pda-summary"><h2>Aprende, juega y explica</h2><p><strong>{activity.totalCount} retos en total</strong>: {activity.nativeCount} de la misión original y {activity.questions.length} de aplicación. Conserva tus evidencias para revisarlas con tu docente.</p><p>Primero explora el ejemplo. Puedes abrir la práctica ampliada y después continuar con la misión que aparece debajo.</p></div>
 <ExploracionMatematica key={activityId} model={activity.model} question={activity.explorationQuestion} onObserve={observe}/>
 <section className="pda-card"><label htmlFor={`${activityId}-observation`}><strong>Antes de resolver: ¿qué cambió y qué se conservó?</strong><span>Describe dos casos que probaste. Tu explicación se conserva como evidencia de exploración.</span></label><textarea id={`${activityId}-observation`} maxLength={2000} rows={3} value={explanation} onChange={e=>setExplanation(e.target.value)}/><p>{seen.length} configuraciones observadas. Escribe al menos una oración sobre lo que comparaste.</p>{!started&&<button type="button" className="pda-primary" onClick={start}>Abrir práctica ampliada</button>}</section>
 {started&&<section className="pda-assessment" aria-labelledby={`${activityId}-questions`}><h2 id={`${activityId}-questions`}>2. Aplica y explica</h2><p>Se aceptan decimales con punto o coma y fracciones como 3/4. En expresiones usa la forma ax+b o an+b; puedes reordenar los términos. Cuando se pide una fracción, escribe numerador y denominador enteros separados por /. Escribe las respuestas numéricas sin agregar la unidad; ya aparece en la pregunta.</p>
 {activity.questions.map((q,index)=><article className="pda-card pda-question" key={q.id}><h3><span>{activity.nativeCount+index+1}.</span> {q.prompt}</h3>
 {q.kind==="choice"?<fieldset><legend className="pda-sr">Elige una respuesta al reactivo {index+1}</legend>{q.options!.map(option=><label className="pda-option" key={option}><input type="radio" name={`${activityId}-${q.id}`} checked={answers[q.id]===option} onChange={()=>change(q.id,option)}/>{option}</label>)}</fieldset>:q.kind==="construction"?<ConstruccionMatematica mode={q.construction!} value={typeof answers[q.id]==="object"?answers[q.id] as ReturnType<typeof emptyDrawing>:emptyDrawing()} onChange={a=>change(q.id,a)}/>:q.kind==="open"?<><label htmlFor={`${activityId}-${q.id}`}>Explica tu procedimiento y describe tu evidencia en papel o experimento.</label><textarea id={`${activityId}-${q.id}`} maxLength={3000} rows={4} value={String(answers[q.id]??"")} onChange={e=>change(q.id,e.target.value)}/><details><summary>Qué revisará tu docente</summary><p>{q.rubric}</p></details></>:<><label htmlFor={`${activityId}-${q.id}`}>Tu respuesta</label><input id={`${activityId}-${q.id}`} autoComplete="off" inputMode={q.kind==="number"?"decimal":"text"} maxLength={120} value={String(answers[q.id]??"")} onChange={e=>change(q.id,e.target.value)}/></>}
 </article>)}<button type="button" className="pda-primary" disabled={saving} onClick={()=>void submit()}>{saving?"Guardando evidencia…":"Revisar respuestas y entregar evidencia"}</button>
 </section>}
 {last&&!reviewVisible&&<button type="button" onClick={()=>setReviewVisible(true)}>Ver la revisión del último intento</button>}
 {reviewVisible&&last&&<section className="pda-card pda-review" tabIndex={-1} ref={feedback} aria-labelledby={`${activityId}-review`}><h2 id={`${activityId}-review`}>3. Revisa y mejora</h2><p><strong>{correct} de {automatic.length}</strong> reactivos automáticos correctos. Las explicaciones están pendientes de revisión docente. Este resultado no certifica por sí solo el logro del PDA.</p><p>{last.assisted?"Este intento se realizó después de ver la retroalimentación. Se conserva por separado del primero.":"Se conserva tu primer intento antes de mostrar las respuestas."}</p>
 <ol>{activity.questions.map(q=><li key={q.id}><strong>{last.evaluated[q.id]===null?"Revisión docente":last.evaluated[q.id]?"Correcto":"Por revisar"}:</strong> {q.feedback}{q.kind==="open"&&<p>{q.rubric}</p>}</li>)}</ol>
 <div className="pda-actions"><button type="button" onClick={()=>{setReviewVisible(false);document.getElementById(`${activityId}-questions`)?.scrollIntoView({behavior:"smooth"});}}>Revisar mi procedimiento</button><button type="button" onClick={download}>Descargar evidencia</button><button type="button" onClick={goBack}>Continuar con la misión</button></div>
 {saved&&<p role="status">Evidencia complementaria enviada al servidor.</p>}{saveError&&<div role="status"><p>{saveError}</p>{userId&&<button type="button" disabled={saving} onClick={()=>void save(last)}>Reintentar envío de este intento</button>}</div>}
 </section>}
 {storageError&&<p role="status">No se pudo guardar el borrador en este navegador. Usa «Descargar evidencia» después de revisar tus respuestas.</p>}
 {notice&&<AvisoActividad message={notice} onClose={()=>setNotice(null)}/>}
 </section>;
}
