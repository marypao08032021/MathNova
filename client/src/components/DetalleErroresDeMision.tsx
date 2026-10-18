import AudioRetroalimentacion from "./AudioRetroalimentacion";
import "../styles/missionReview.css";
export type MissionReviewItem = { id: string; title: string; answer: string; correct: boolean | null; hint: string; target?: string };
export default function DetalleErroresDeMision({items,onCorrect,onRestart}:{items:MissionReviewItem[];onCorrect:(item?:MissionReviewItem)=>void;onRestart:()=>void}) {
 const errors=items.filter(item=>item.correct===false),pending=items.filter(item=>item.correct===null),passed=items.filter(item=>item.correct===true);
 return <section className="mn-review" aria-label="Detalle de respuestas"><h2>{errors.length||pending.length?"¿Qué necesitas corregir?":"¡Retos completados!"}</h2><AudioRetroalimentacion text={[...errors,...pending].map(i=>i.title+". "+i.hint).join(". ")||"Todos los retos están correctos. Explica tu estrategia y continúa con la siguiente misión."}/><p>{passed.length} retos correctos se conservan. {errors.length} por corregir{pending.length?`, ${pending.length} pendientes`:""}.</p>
 <div className="mn-review-list">{[...errors,...pending].map(item=><article key={item.id} className="mn-review-error"><strong>{item.title}</strong><p>Tu respuesta: <b>{item.answer||"Sin respuesta"}</b></p><p>{item.hint}</p><button type="button" onClick={()=>onCorrect(item)}>Ir a este reto</button></article>)}</div>
 {passed.length>0&&<details><summary>Ver los {passed.length} retos correctos</summary><ul>{passed.map(item=><li key={item.id}>✓ {item.title}</li>)}</ul></details>}
 <div className="mn-review-actions"><button type="button" onClick={()=>onCorrect(errors[0]||pending[0])}>Corregir errores y conservar aciertos</button><button type="button" onClick={onRestart}>Reiniciar toda la actividad</button></div></section>;
}
