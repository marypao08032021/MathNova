import { useNavigate } from "react-router-dom";
import type { ActivityCurriculum } from "../curriculum/activityCurriculum";
import "../styles/learningPilot.css";
import "../styles/activityNavigation.css";
import "../styles/compactCurriculum.css";

export default function CabeceraCurricular({ curriculum }: { curriculum: ActivityCurriculum }) {
  const navigate = useNavigate();
  const fallback = curriculum.id.startsWith("mathnumbers") ? "/actividades-math-numbers" : curriculum.id.startsWith("mathgeometry") ? "/actividades/geometria" : "/actividades-math-data";
  const volver = () => {
    if (typeof window.history.state?.idx === "number" && window.history.state.idx > 0) navigate(-1);
    else navigate(fallback);
  };
  return (
    <>
    <button type="button" className="mn-back-activity" onClick={volver} aria-label="Volver a la pantalla anterior">← Volver</button>
    <section className="mn-curriculum mn-curriculum-compact" aria-label="Contenido y proceso de desarrollo de aprendizaje">
      <div className="mn-curriculum-meta"><span>{curriculum.world}</span><span>{curriculum.grade}</span></div>
      <h2>{curriculum.title}</h2>
      <p className="mn-curriculum-content"><strong>Contenido</strong> {curriculum.content}</p>
      <details className="mn-curriculum-details"><summary>Ver PDA y propósito de la actividad</summary>
      <dl>
        
        <div><dt>PDA · Proceso de Desarrollo de Aprendizaje{curriculum.pdaIsSummary ? " · Síntesis" : ""}</dt><dd>{curriculum.pda.map((pda) => <p key={pda}>{pda}</p>)}</dd></div>
        <div className="mn-curriculum-objective"><dt>En esta actividad</dt><dd>{curriculum.objective}</dd></div>
      </dl>
      {curriculum.note && <p className="mn-curriculum-note">{curriculum.note}</p>}
      <span className="mn-curriculum-source">Fuente: {curriculum.source.title} · página {curriculum.source.page}</span>
      </details>
    </section>
    </>
  );
}
