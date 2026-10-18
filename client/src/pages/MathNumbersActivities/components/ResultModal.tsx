import AudioRetroalimentacion from "../../../components/AudioRetroalimentacion";
import DetalleErroresDeMision, {type MissionReviewItem} from "../../../components/DetalleErroresDeMision";
import "../../../styles/activityExperience.css";
import "./ResultModal.css";

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiGrid,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

import { activityListRoute } from "../constants";
import { resultData } from "../data/resultData";
import type { ResultKind } from "../types";
import {
  almostAudio,
  almostHeroAnimated,
  completedAudio,
  completedHeroAnimated,
  retryAudio,
  retryHeroAnimated,
} from "../mathNumbersAssets";

type ResultModalProps = {
  kind: ResultKind;
  nextRoute: string;
  retryRoute: string;
  onClose: () => void;
  onRetry?: () => void;
  reviewItems?: MissionReviewItem[];
  onCorrect?: (item?:MissionReviewItem)=>void;
  summary?: {correct:number;total:number;seconds:number;xp:number};
};

const modalTextByKind: Record<
  ResultKind,
  {
    badge: string;
    sideLabel: string;
    sideTitle: string;
    sideMessage: string;
    primaryAction: "next" | "retry";
  }
> = {
  completed: {
    badge: "Actividad completada",
    sideLabel: "¡Misión completada!",
    sideTitle: "Sigue avanzando por MathNumbers",
    sideMessage:
      "Cada actividad superada fortalece tus habilidades matemáticas.",
    primaryAction: "next",
  },
  almost: {
    badge: "Casi lo logras",
    sideLabel: "¡Estuviste muy cerca!",
    sideTitle: "Revisa y vuelve a intentarlo",
    sideMessage:
      "Observa tus respuestas, identifica el detalle que falta y prueba nuevamente.",
    primaryAction: "retry",
  },
  retry: {
    badge: "Vuelve a intentarlo",
    sideLabel: "¡No te rindas!",
    sideTitle: "Cada intento te ayuda a mejorar",
    sideMessage:
      "Usa la pista, revisa el procedimiento y vuelve a resolver la actividad.",
    primaryAction: "retry",
  },
  hint: {
    badge: "Aquí tienes una pista",
    sideLabel: "¡Pista disponible!",
    sideTitle: "Analiza antes de responder",
    sideMessage:
      "Lee la recomendación con calma y vuelve a la actividad para aplicar la estrategia.",
    primaryAction: "retry",
  },
};

const animatedHeroByKind: Partial<Record<ResultKind, string>> = {
  completed: completedHeroAnimated,
  almost: almostHeroAnimated,
  retry: retryHeroAnimated,
};

const resultAudioByKind: Partial<Record<ResultKind, string>> = {
  completed: completedAudio,
  almost: almostAudio,
  retry: retryAudio,
};

export function ResultModal({
  kind,
  nextRoute,
  retryRoute,
  onClose,
  onRetry,
  summary, reviewItems, onCorrect,
}: ResultModalProps) {
  const navigate = useNavigate();
  const data = resultData[kind];
  const modalText = modalTextByKind[kind];
  const isCompleted = kind === "completed";
  const precision = summary && summary.total > 0 ? Math.round(summary.correct / summary.total * 100) : 0;
  const time = summary ? `${Math.floor(summary.seconds / 60).toString().padStart(2,"0")}:${(summary.seconds % 60).toString().padStart(2,"0")}` : "";
  const stats = summary ? [
    {label:"Aciertos",value:`${summary.correct}/${summary.total}`,note:"Retos de esta misión",icon:data.stats[0].icon},
    {label:"Tiempo",value:time,note:"min:seg",icon:data.stats[1].icon},
    {label:"Precisión",value:`${precision}%`,note:"Este intento",icon:data.stats[2].icon},
    {label:"XP de la misión",value:String(summary.xp),note:"Mejor recompensa registrada",icon:data.stats[3].icon},
    {label:"Estado",value:summary.correct === summary.total ? "Completada" : "Por corregir",note:"",icon:data.stats[4]?.icon || data.stats[0].icon},
  ] : data.stats;

  const resultAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const heroSource =
    animatedHeroByKind[kind] ?? data.hero;

  const audioSource =
    resultAudioByKind[kind];

  useEffect(() => {
    const audio = resultAudioRef.current;

    if (!audio || !audioSource) {
      return;
    }

    audio.currentTime = 0;
    audio.volume = 1;

    let resultPlaybackActive = true;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        if (!resultPlaybackActive || error?.name === "AbortError") return;
        console.warn("El audio del resultado no pudo iniciarse automáticamente:", error);
      });
    }
    return () => {
      resultPlaybackActive = false;
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audioSource]);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [onClose]);

  const goNext = () => {
    navigate(nextRoute);
  };

  const retry = () => {
    if (onRetry) {
      onRetry();
      return;
    }

    navigate(retryRoute);
  };

  const backToActivities = () => {
    navigate(activityListRoute);
  };

  return (
    <div
      className={`result-modal-overlay result-modal-overlay--${kind}`}
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        className={`result-modal result-modal--${kind}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-modal-title"
      >
        {audioSource && (
          <audio
            ref={resultAudioRef}
            src={audioSource}
            preload="auto"
            autoPlay
          />
        )}

        <button
          type="button"
          className="result-modal-close"
          onClick={onClose}
          aria-label="Cerrar resultado"
        >
          <FiX />
        </button>

        <div className="result-modal-decoration result-modal-decoration--one" />
        <div className="result-modal-decoration result-modal-decoration--two" />

        <div className="result-modal-main">
          <header className="result-modal-header">
            <div className="result-modal-status-icon">
              {isCompleted ? (
                <FiCheckCircle />
              ) : (
                <FiRefreshCw />
              )}
            </div>

            <div className="result-modal-header-copy">
              <span className="result-modal-badge">
                {isCompleted ? (
                  <FiCheckCircle />
                ) : (
                  <FiRefreshCw />
                )}

                {modalText.badge}
              </span>

              <h1 id="result-modal-title">
                {data.title}
              </h1>

              <p>{data.subtitle}</p>
            </div>
          </header>

          <AudioRetroalimentacion/>
          <div className="result-modal-content">
            <div className="result-modal-character">
              <img
                key={`${kind}-${heroSource}`}
                src={heroSource}
                alt={data.heroAlt}
                draggable={false}
                onError={(event) => {
                  if (
                    event.currentTarget.src !==
                    data.hero
                  ) {
                    event.currentTarget.src =
                      data.hero;
                  }
                }}
              />
            </div>

            <article className="result-modal-message">
              <span className="result-modal-message-label">
                Resultado de la misión
              </span>

              <h2>{data.messageTitle}</h2>
              <p>{data.message}</p>
            </article>
          </div>

          {!isCompleted && reviewItems && onCorrect && <DetalleErroresDeMision items={reviewItems} onCorrect={onCorrect} onRestart={retry}/>}
          <article className="result-modal-summary">
            <header>
              <FiBarChart2 />
              <h2>Resumen de la actividad</h2>
            </header>

            <div className="result-modal-stats">
              {stats.map((stat) => (
                <article
                  className="result-modal-stat"
                  key={`${stat.label}-${stat.value}`}
                >
                  <div className="result-modal-stat-icon">
                    <img
                      src={stat.icon}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>

                    {stat.note && (
                      <small>{stat.note}</small>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>

        <aside className="result-modal-side">
          <article className="result-modal-side-message">
            <span>{modalText.sideLabel}</span>
            <strong>{modalText.sideTitle}</strong>
            <p>{modalText.sideMessage}</p>
          </article>

          <div className="result-modal-progress">
            <div>
              <span>{summary ? "Precisión de este intento" : "Progreso del tema"}</span>
              <strong>{summary ? `${precision}%` : "60%"}</strong>
            </div>

            <div className="result-modal-progress-bar">
              <span style={{ width: summary ? `${precision}%` : "60%" }} />
            </div>
          </div>

          <div className="result-modal-actions">
            {modalText.primaryAction === "next" ? (
              <button
                type="button"
                className="result-modal-action result-modal-action--primary"
                onClick={goNext}
              >
                <FiArrowRight />
                <span>Siguiente actividad</span>
              </button>
            ) : (
              <button
                type="button"
                className="result-modal-action result-modal-action--primary"
                onClick={() => onCorrect ? onCorrect(reviewItems?.find(item=>item.correct===false)) : onClose()}
              >
                <FiRefreshCw />
                <span>Corregir errores</span>
              </button>
            )}

            {isCompleted && (
              <button
                type="button"
                className="result-modal-action result-modal-action--secondary"
                onClick={retry}
              >
                <FiRefreshCw />
                <span>Repetir actividad</span>
              </button>
            )}

            <button
              type="button"
              className="result-modal-action result-modal-action--secondary"
              onClick={backToActivities}
            >
              <FiGrid />
              <span>Volver a actividades</span>
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}