import ConstruccionMatematica from "./ConstruccionMatematica";
import { emptyDrawing } from "../pedagogy/learningEngine";
import type { MissionExpansion } from "../hooks/useMissionExpansion";
import { evaluateQuestion } from "../pedagogy/learningEngine";
import "../styles/missionExperience.css";

export default function RetosDeMision({ expansion, disabled = false }: { expansion: MissionExpansion; disabled?: boolean }) {
  const { mission, index, answers, reviewed } = expansion;
  const q = mission.questions[index];
  const id = `${mission.id}-mission-${q.id}`;
  const value = typeof answers[q.id] === "string" ? answers[q.id] as string : "";
  const correct = evaluateQuestion(q, answers[q.id]);
  const locked = disabled || (expansion.correctOnly && correct === true);
  return <section className="mn-mission" data-mission={mission.id} aria-label={mission.title}>
    <header><div><span className="mn-mission-eyebrow">Continúa la misión</span><h2>{mission.title}</h2></div><strong>{expansion.readyCount}/{mission.questions.length} listos</strong></header>
    <p>{mission.intro}</p>{expansion.correctOnly && <p role="status">Modo de corrección: tus aciertos se conservan. Los códigos correctos quedan protegidos.</p>}
    <nav aria-label="Retos de la misión">{mission.questions.map((item, i) => <button type="button" key={item.id} className={reviewed && evaluateQuestion(item, answers[item.id]) === false ? "mn-mission-nav-error" : ""} disabled={disabled} aria-current={i === index ? "step" : undefined} aria-label={`Reto ${mission.nativeCount + i + 1}`} onClick={() => expansion.setIndex(i)}>{mission.nativeCount + i + 1}{reviewed ? evaluateQuestion(item, answers[item.id]) ? " ✓" : " !" : answers[item.id] !== undefined && String(answers[item.id]).trim() ? " ·" : ""}</button>)}</nav>
    {reviewed && <p role="status">{expansion.correctCount}/{mission.questions.length} códigos nuevos correctos. Revisa los retos marcados con !.</p>}
    <article className="mn-mission-task" key={q.id}>
      <label htmlFor={id}><span>Reto {mission.nativeCount + index + 1} de {mission.totalCount}</span><h3>{q.prompt}</h3></label>
      {q.kind === "construction" ? <fieldset disabled={locked} onClickCapture={event=>{if(locked)event.stopPropagation();}}><ConstruccionMatematica mode={q.construction!} value={typeof answers[q.id] === "object" ? answers[q.id] as ReturnType<typeof emptyDrawing> : emptyDrawing()} onChange={answer=>expansion.setAnswer(q.id,answer)}/></fieldset> : q.kind === "choice" ? <div className="mn-mission-choices">{q.options?.map(option => <button type="button" key={option} disabled={locked} aria-pressed={value === option} onClick={() => expansion.setAnswer(q.id, option)}>{option}</button>)}</div> : <input id={id} maxLength={120} disabled={locked} autoComplete="off" inputMode={q.kind === "algebra" || q.kind === "fraction" ? "text" : "decimal"} value={value} onChange={event => expansion.setAnswer(q.id, event.target.value)} placeholder={q.kind === "fraction" ? "Fracción, por ejemplo 3/8" : q.kind === "algebra" ? `Expresión con ${q.variable || "x"}` : "Escribe el código numérico"} />}
      {reviewed && <p className={correct ? "mn-mission-correct" : "mn-mission-error"} role="status">{correct ? "Código correcto. " : "Revisa este código. "}{q.feedback}</p>}
    </article>
    <footer><button type="button" disabled={disabled || index === 0} onClick={() => expansion.setIndex(index - 1)}>← Reto anterior</button><button type="button" disabled={disabled || index === mission.questions.length - 1} onClick={() => expansion.setIndex(index + 1)}>Siguiente reto →</button></footer>
    {mission.reflection&&<details className="mn-mission-reflection"><summary>Explica tu estrategia al docente</summary><label htmlFor={`${mission.id}-reflection`}>{mission.reflection.prompt}</label><textarea id={`${mission.id}-reflection`} disabled={disabled} value={expansion.explanation} maxLength={3000} rows={3} onChange={e=>expansion.setExplanation(e.target.value)}/><p>Esta explicación se guarda para revisión docente y no se califica automáticamente.</p><small>{mission.reflection.rubric}</small></details>}
    <small>Entrega todos los retos con «Terminar misión» al final de la actividad.</small>
  </section>;
}
