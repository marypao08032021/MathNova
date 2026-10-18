import useMathNumbersEvidence from "../../../hooks/useMathNumbersEvidence";
import PilotEvidenceStatus from "../../../components/PilotEvidenceStatus";
import CierreDeMision from "../../../components/CierreDeMision";
import useMissionExpansion from "../../../hooks/useMissionExpansion";
import EnsayoDeMision from "../../../components/EnsayoDeMision";
import RetosDeMision from "../../../components/RetosDeMision";
import CabeceraCurricular from "../../../components/CabeceraCurricular";
import { activityCurriculum } from "../../../curriculum/activityCurriculum";
import "../../../styles/activityExperience.css";
import "./SimuladorCodigos.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiBarChart2,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiClipboard,
  FiFlag,
  FiGrid,
  FiHelpCircle,
  FiInfo,
  FiLock,
  FiLogOut,
  FiMessageSquare,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSave,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiVolume2,
  FiX,
  FiZap,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import activityScene from "../../../assets/mathnumbers/12-simulador/eferas rtx.webp";
import audioConsejoSumaSimulador from "../../../assets/mathnumbers/12-simulador/consejo8.mp3";
import audioPistaByteSimulador from "../../../assets/mathnumbers/12-simulador/pista_byte_simulador.mp3";
import audioIntroSimulador from "../../../assets/mathnumbers/12-simulador/introact8.mp3";
import videoByteHablandoSimulador from "../../../assets/mathnumbers/12-simulador/byte_hablando_simulador.mp4";
import comandanteSumaHablando from "../../../assets/mathnumbers/12-simulador/comandante_suma_hablando.webp";
import comandanteSumaIdle from "../../../assets/mathnumbers/12-simulador/comandante_suma_idle.png";
import bytePista from "../../../assets/mathnumbers/byte_pista.png";

import { clearAuthSession } from "../../../utils/authSession";
import { guardarProgresoUsuarioActual } from "../../../services/progresoService";

import { activityListRoute } from "../constants";
import { ResultModal } from "../components/ResultModal";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import type { ResultKind } from "../types";

import {
  logo,
  menuHamburguesa,
  zorritoConsejo,
} from "../mathNumbersAssets";

type AudioStatus = "idle" | "playing" | "paused" | "ended";

type BasicRule = "2n" | "n+2" | "3n";
type CombinedRule = "2n+3" | "2+n+3" | "3n+2";

const basicRuleOptions: BasicRule[] = [
  "2n",
  "n+2",
  "3n",
];

const combinedRuleOptions: CombinedRule[] = [
  "2n+3",
  "2+n+3",
  "3n+2",
];

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (
    let index = copy.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [copy[index], copy[randomIndex]] = [
      copy[randomIndex],
      copy[index],
    ];
  }

  return copy;
}

function shuffleAnswers<T>(
  items: T[],
  correctAnswer: T,
) {
  const shuffled = shuffleArray(items);

  if (shuffled[0] === correctAnswer) {
    [shuffled[0], shuffled[1]] = [
      shuffled[1],
      shuffled[0],
    ];
  }

  return shuffled;
}

const activityRoute =
  "/actividades/mathnumbers/simulador-codigos";

const INTRO_AUDIO_SRC = audioIntroSimulador;
const GUIDE_AUDIO_SRC = audioConsejoSumaSimulador;

const INTRO_INITIAL_TEXT =
  "Presiona reproducir para escuchar la introducción del Comandante Suma.";

const INTRO_FULL_TEXT =
  "El simulador de la base conoce los primeros códigos de energía, pero necesita una regla general basada en la variable n para generar cualquier nivel futuro sin tener que calcularlos uno por uno.";

const GUIDE_INITIAL_TEXT =
  "Presiona reproducir para escuchar el consejo del Comandante Suma.";

const GUIDE_FULL_TEXT =
  "Prueba siempre la regla descubierta con todos los valores conocidos de la tabla para asegurarte de que encaja a la perfección en cada una de las filas antes de darla por buena.";

const HINT_AUDIO_SRC = audioPistaByteSimulador;

const BYTE_HINT_FULL_TEXT =
  "Analiza la tabla calculando cuánto aumenta el código de una fila a otra. Eso te indicará si el patrón avanza sumando un término constante o multiplicando de forma proporcional.";

function ByteSimuladorMedia({
  active,
}: {
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    if (active) {
      video.play().catch((error) => {
        console.error(
          "No se pudo reproducir la animación de Byte:",
          error,
        );
      });

      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [active]);

  return (
    <video
      ref={videoRef}
      className="mnx-simulador-byte-panel-video"
      src={videoByteHablandoSimulador}
      muted
      loop
      playsInline
      preload="auto"
      poster={bytePista}
      aria-label="Byte mostrando una pista sobre patrones y reglas generales"
    />
  );
}

function FloatingByteHint({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] =
    useState<AudioStatus>("idle");

  useEffect(() => {
    return () => {
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!open) {
      audio.pause();
      audio.currentTime = 0;
      setStatus("idle");
      return;
    }

    audio.currentTime = 0;

    audio
      .play()
      .then(() => setStatus("playing"))
      .catch((error) => {
        setStatus("paused");
        console.error(
          "No se pudo reproducir automáticamente la pista de Byte:",
          error,
        );
      });
  }, [open]);

  const abrirPista = () => {
    if (open) {
      void repetirPista();
      return;
    }

    onOpen();
  };

  const cerrarPista = () => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setStatus("idle");
    onClose();
  };

  const reproducirPista = async () => {
    const audio = audioRef.current;

    if (!audio || !HINT_AUDIO_SRC) {
      return;
    }

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error(
        "No se pudo reproducir la pista de Byte:",
        error,
      );
    }
  };

  const pausarPista = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setStatus("paused");
  };

  const repetirPista = async () => {
    const audio = audioRef.current;

    if (!audio || !HINT_AUDIO_SRC) {
      return;
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error(
        "No se pudo repetir la pista de Byte:",
        error,
      );
    }
  };

  const statusText =
    status === "playing"
      ? "Byte está hablando"
      : status === "paused"
        ? "Audio en pausa"
        : status === "ended"
          ? "Pista completada"
          : "Pista preparada";

  return (
    <div
      className={`mnx-simulador-byte-float ${
        open ? "is-open" : ""
      }`}
    >
      <audio
        ref={audioRef}
        src={HINT_AUDIO_SRC}
        preload="metadata"
        onPlay={() => setStatus("playing")}
        onPause={() => {
          if (!audioRef.current?.ended) {
            setStatus("paused");
          }
        }}
        onEnded={() => setStatus("ended")}
      />

      {open && (
        <article className="mnx-simulador-byte-panel">
          <button
            type="button"
            className="mnx-simulador-byte-close"
            onClick={cerrarPista}
            aria-label="Cerrar pista de Byte"
          >
            <FiX />
          </button>

          <div className="mnx-simulador-byte-panel-media">
            <ByteSimuladorMedia
              active={status === "playing"}
            />
          </div>

          <div className="mnx-simulador-byte-panel-copy">
            <span className="mnx-simulador-byte-panel-label">
              Pista de Byte
            </span>

            <h3>Detecta cómo crece el patrón</h3>
            <p>{BYTE_HINT_FULL_TEXT}</p>

            <div className="mnx-simulador-byte-controls">
              <button
                type="button"
                onClick={reproducirPista}
                disabled={status === "playing"}
                aria-label="Reproducir pista de Byte"
              >
                <FiPlay />
              </button>

              <button
                type="button"
                onClick={pausarPista}
                disabled={status !== "playing"}
                aria-label="Pausar pista de Byte"
              >
                <FiPause />
              </button>

              <button
                type="button"
                onClick={repetirPista}
                aria-label="Repetir pista de Byte"
              >
                <FiRotateCcw />
              </button>

              <span
                className={`mnx-simulador-byte-status ${
                  status === "playing"
                    ? "is-playing"
                    : ""
                }`}
              >
                <FiVolume2 />
                {statusText}
              </span>
            </div>
          </div>
        </article>
      )}

      <button
        type="button"
        className="mnx-simulador-byte-launcher"
        onClick={abrirPista}
        aria-label="Abrir pista de Byte"
        aria-expanded={open}
      >
        <span>PISTA</span>

        <img
          src={bytePista}
          alt="Byte"
          draggable={false}
        />

        <i aria-hidden="true">?</i>
      </button>
    </div>
  );
}

export function SimuladorCodigos() {
  const mission = useMissionExpansion("mathnumbers-simulador-codigos");
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [helpOpen, setHelpOpen] =
    useState(false);

  const [introAudioStatus, setIntroAudioStatus] =
    useState<AudioStatus>("idle");

  const [guideAudioStatus, setGuideAudioStatus] =
    useState<AudioStatus>("idle");

  const [shuffleKey, setShuffleKey] =
    useState(0);

  const [basicRule, setBasicRule] =
    useState<BasicRule | null>(null);

  const [combinedRule, setCombinedRule] =
    useState<CombinedRule | null>(null);

  const [predictionFive, setPredictionFive] =
    useState("");

  const [predictionTen, setPredictionTen] =
    useState("");

  const [explanation, setExplanation] =
    useState("");

  const [
    activityResolved,
    setActivityResolved,
  ] = useState(false);

  const [
    guardandoProgreso,
    setGuardandoProgreso,
  ] = useState(false);

  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

  const [resultModalKind, setResultModalKind] =
    useState<ResultKind>("completed");

  const introAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const guideAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const inicioActividadRef =
    useRef<number>(Date.now());

  const resultTimerRef =
    useRef<number | null>(null);

  const shuffledBasicRules = useMemo(
    () => shuffleAnswers(basicRuleOptions, "2n"),
    [shuffleKey],
  );

  const shuffledCombinedRules = useMemo(
    () => shuffleAnswers(combinedRuleOptions, "2n+3"),
    [shuffleKey],
  );

  const basicReady = basicRule !== null;
  const combinedReady = combinedRule !== null;

  const predictionsReady =
    predictionFive.trim() !== "" &&
    predictionTen.trim() !== "";

  const progress = useMemo(
    () =>
      Number(basicReady) +
      Number(combinedReady) +
      Number(predictionsReady),
    [
      basicReady,
      combinedReady,
      predictionsReady,
    ],
  );

  const energy = Math.round(
    ((progress + mission.readyCount) / mission.total) * 100,
  );

  const basicCorrect =
    basicRule === "2n";

  const combinedCorrect =
    combinedRule === "2n+3";

  const predictionsCorrect =
    Number(predictionFive.trim()) === 13 &&
    Number(predictionTen.trim()) === 23;

  useEffect(() => {
    if (helpOpen || resultModalOpen) {
      return;
    }

    document.body.style.overflow =
      menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [
    menuOpen,
    helpOpen,
    resultModalOpen,
  ]);

  useEffect(() => {
    return () => {
      if (resultTimerRef.current !== null) {
        window.clearTimeout(resultTimerRef.current);
      }

      const introAudio =
        introAudioRef.current;

      const guideAudio =
        guideAudioRef.current;

      if (introAudio) {
        introAudio.pause();
        introAudio.currentTime = 0;
      }

      if (guideAudio) {
        guideAudio.pause();
        guideAudio.currentTime = 0;
      }
    };
  }, []);

  const reproducirIntroduccion = async () => {
    const audio = introAudioRef.current;
    const guideAudio = guideAudioRef.current;

    if (!audio) {
      return;
    }

    if (guideAudio && !guideAudio.paused) {
      guideAudio.pause();
      setGuideAudioStatus("paused");
    }

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setIntroAudioStatus("playing");
    } catch (error) {
      setIntroAudioStatus("paused");

      console.error(
        "No se pudo reproducir la introducción de El Simulador de Códigos Algebraicos:",
        error,
      );
    }
  };

  const pausarIntroduccion = () => {
    const audio = introAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setIntroAudioStatus("paused");
  };

  const repetirIntroduccion = async () => {
    const audio = introAudioRef.current;
    const guideAudio = guideAudioRef.current;

    if (!audio) {
      return;
    }

    if (guideAudio && !guideAudio.paused) {
      guideAudio.pause();
      setGuideAudioStatus("paused");
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      setIntroAudioStatus("playing");
    } catch (error) {
      setIntroAudioStatus("paused");

      console.error(
        "No se pudo repetir la introducción de El Simulador de Códigos Algebraicos:",
        error,
      );
    }
  };

  const reproducirConsejo = async () => {
    const audio = guideAudioRef.current;
    const introAudio = introAudioRef.current;

    if (!audio) {
      return;
    }

    if (introAudio && !introAudio.paused) {
      introAudio.pause();
      setIntroAudioStatus("paused");
    }

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setGuideAudioStatus("playing");
    } catch (error) {
      setGuideAudioStatus("paused");

      console.error(
        "No se pudo reproducir el Consejo de Suma de El Simulador de Códigos Algebraicos:",
        error,
      );
    }
  };

  const pausarConsejo = () => {
    const audio = guideAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setGuideAudioStatus("paused");
  };

  const repetirConsejo = async () => {
    const audio = guideAudioRef.current;
    const introAudio = introAudioRef.current;

    if (!audio) {
      return;
    }

    if (introAudio && !introAudio.paused) {
      introAudio.pause();
      setIntroAudioStatus("paused");
    }

    audio.currentTime = 0;

    try {
      await audio.play();
      setGuideAudioStatus("playing");
    } catch (error) {
      setGuideAudioStatus("paused");

      console.error(
        "No se pudo repetir el Consejo de Suma de El Simulador de Códigos Algebraicos:",
        error,
      );
    }
  };

  const detenerAudios = () => {
    const introAudio = introAudioRef.current;
    const guideAudio = guideAudioRef.current;

    if (introAudio) {
      introAudio.pause();
      introAudio.currentTime = 0;
    }

    if (guideAudio) {
      guideAudio.pause();
      guideAudio.currentTime = 0;
    }

    setIntroAudioStatus("idle");
    setGuideAudioStatus("idle");
  };

  const introStatusText =
    introAudioStatus === "playing"
      ? "Suma está hablando"
      : introAudioStatus === "paused"
        ? "Audio en pausa"
        : introAudioStatus === "ended"
          ? "Introducción completada"
          : "Listo para escuchar";

  const guideStatusText =
    guideAudioStatus === "playing"
      ? "Suma está hablando"
      : guideAudioStatus === "paused"
        ? "Audio en pausa"
        : guideAudioStatus === "ended"
          ? "Consejo completado"
          : "Listo para escuchar";

  const irARuta = (route: string) => {
    detenerAudios();
    setMenuOpen(false);
    navigate(route);
  };

  const cerrarSesion = () => {
    detenerAudios();
    clearAuthSession();

    navigate("/login", {
      replace: true,
    });
  };

  const guardarExplicacion = () => {
    const explanationText = explanation.trim();

    if (!explanationText) {
      showToast(
        "Escribe una explicación antes de guardarla.",
        true,
      );
      return;
    }

    showToast(
      "Explicación preparada para guardarse con el resultado.",
    );
  };

  const limpiarActividad = () => {
    mission.reset();
    pilotEvidence.resetSession();
    if (resultTimerRef.current !== null) {
      window.clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }

    setShuffleKey((current) => current + 1);
    setBasicRule(null);
    setCombinedRule(null);
    setPredictionFive("");
    setPredictionTen("");
    setExplanation("");
    setActivityResolved(false);
    setGuardandoProgreso(false);

    inicioActividadRef.current = Date.now();
  };

  const repetirActividad = () => {
    detenerAudios();
    limpiarActividad();
    setResultModalOpen(false);
    setResultModalKind("completed");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast(
      "Simulador reiniciado. ¡Descubre las reglas nuevamente!",
    );
  };

  const cerrarResultado = () => {
    setResultModalOpen(false);

    // Conserva las respuestas para revisar y corregir. Reiniciar las limpia.
  };

  const pilotEvidence = useMathNumbersEvidence("mathnumbers-simulador-codigos", mission, () => ({
            regla_basica:
              basicRule,
            regla_combinada:
              combinedRule,
            prediccion_n_5:
              predictionFive.trim(),
            prediccion_n_10:
              predictionTen.trim(),
            explicacion_texto:
              explanation.trim(),
          }));

  const comprobar = async () => {
    if (!mission.ready) {
      showToast("Completa los códigos que faltan en los nuevos retos de la misión.", true);
      document.querySelector(`[data-mission="mathnumbers-simulador-codigos"]`)?.scrollIntoView({behavior:"smooth",block:"center"});
      return;
    }

    if (guardandoProgreso) {
      return;
    }

    if (progress !== 3) {
      showToast(
        "Completa las dos reglas y las predicciones antes de probar.",
        true,
      );
      return;
    }

    const pilotSnapshot = pilotEvidence.reviewForClose();
    const totalCorrect =
      Number(basicCorrect) +
      Number(combinedCorrect) +
      Number(predictionsCorrect) + mission.correctCount;

    const completed =
      totalCorrect === mission.total;

    const tiempoSegundos = Math.max(
      1,
      Math.floor(
        (Date.now() - inicioActividadRef.current) / 1000,
      ),
    );

    setGuardandoProgreso(true);

    try {
      const resultado =
        await guardarProgresoUsuarioActual({
          mundo: "MathNumbers",
          tema:
            "Tema 4: Introducción al álgebra",
          actividad_codigo:
            "mathnumbers-simulador-codigos",
          actividad_titulo:
            "El Simulador de Códigos Algebraicos",
          respuestas: pilotSnapshot,
          aciertos: totalCorrect,
          total_preguntas: mission.total,
          tiempo_segundos: tiempoSegundos,
          xp_base: 60,
          completada: completed,
        });
      mission.recordResult({correct:totalCorrect,seconds:tiempoSegundos,xp:Number(resultado.progreso.xp_obtenido ?? 0)});

      const progresoGuardado =
        resultado.progreso;

      const estrellasGuardadas = Number(
        progresoGuardado
          .estrellas_obtenidas ?? 0,
      );

      const intentosGuardados = Number(
        progresoGuardado.intentos ?? 1,
      );

      console.log(
        "Progreso del Simulador de Códigos guardado:",
        progresoGuardado,
      );

      inicioActividadRef.current = Date.now();

      if (resultTimerRef.current !== null) {
        window.clearTimeout(
          resultTimerRef.current,
        );
      }

      if (completed) {
        setActivityResolved(true);

        showToast(
          intentosGuardados > 1
            ? `¡Simulador completado otra vez! Tu mejor resultado conserva ${estrellasGuardadas} ⭐.`
            : `¡Simulador sincronizado! Ganaste ${estrellasGuardadas} estrellas. ⭐`,
        );

        resultTimerRef.current =
          window.setTimeout(() => {
            setResultModalKind(
              "completed",
            );
            setResultModalOpen(true);
            resultTimerRef.current = null;
          }, 900);

        return;
      }

      setActivityResolved(false);

      showToast(
        totalCorrect === 2
          ? `¡Casi lo logras! Obtuviste ${estrellasGuardadas} estrellas; revisa una regla o predicción.`
          : totalCorrect === 1
            ? `Obtuviste ${estrellasGuardadas} estrella. Revisa las reglas y predicciones.`
            : "El simulador detectó códigos incorrectos. Usa la pista de Byte.",
        true,
      );

      resultTimerRef.current =
        window.setTimeout(() => {
          setResultModalKind(
            totalCorrect === 2
              ? "almost"
              : "retry",
          );
          setResultModalOpen(true);
          resultTimerRef.current = null;
        }, 900);
    } catch (error) {
      console.error(
        "No se pudo guardar el progreso del Simulador de Códigos:",
        error,
      );

      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudo guardar el progreso.";

      showToast(
        `Error de conexión: ${mensaje}`,
        true,
      );
    } finally {
      setGuardandoProgreso(false);
    }
  };

  return (
    <main className="mnx-simulador-page mn-activity mnx-simulador-cofre-layout">
      <button
        type="button"
        className={`mnx-simulador-hamburger ${
          menuOpen
            ? "mnx-simulador-hamburger-open"
            : ""
        }`}
        onClick={() =>
          setMenuOpen(
            (current) => !current,
          )
        }
        aria-label="Abrir menú"
      >
        <img
          src={menuHamburguesa}
          alt="Menú"
        />
      </button>

      {menuOpen && (
        <div
          className="mnx-simulador-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`mnx-simulador-sidebar ${
          menuOpen
            ? "mnx-simulador-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-simulador-sidebar-logo"
        />

        <nav className="mnx-simulador-sidebar-menu">
          <button
            type="button"
            className="mnx-simulador-menu-item"
            onClick={() =>
              irARuta("/dashboard")
            }
          >
            <FiGrid />
            <span>
              Panel de control principal
            </span>
          </button>

          <button
            type="button"
            className="mnx-simulador-menu-item mnx-simulador-menu-active"
            onClick={() =>
              irARuta(
                "/seleccion-mundos",
              )
            }
          >
            <GiRingedPlanet />
            <span>
              Selección de mundos
            </span>
          </button>

          <button
            type="button"
            className="mnx-simulador-menu-item"
            onClick={() =>
              irARuta(
                "/retroalimentacion",
              )
            }
          >
            <FiMessageSquare />
            <span>
              Retroalimentación
            </span>
          </button>

          <button
            type="button"
            className="mnx-simulador-menu-item"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="mnx-simulador-menu-item"
            onClick={() =>
              irARuta("/perfil-alumno")
            }
          >
            <FiUser />
            <span>
              Perfil del alumno
            </span>
          </button>

          <button
            type="button"
            className="mnx-simulador-menu-item"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <article className="mnx-simulador-week-card">
          <div className="mnx-simulador-week-head">
            <strong>
              Progreso semanal
            </strong>
            <span>Nivel 4</span>
          </div>

          <div className="mnx-simulador-week-progress">
            <span>★</span>
            <b><i /></b>
            <strong>60%</strong>
          </div>

          <img
            src={zorritoConsejo}
            alt="Nova acompañando el progreso"
          />
        </article>
      </aside>

      <section className="mnx-simulador-content">
        <div className="mnx-simulador-decoration mnx-simulador-decoration-one" />
        <div className="mnx-simulador-decoration mnx-simulador-decoration-two" />

        <div
          className="mnx-simulador-stars"
          aria-hidden="true"
        >
          <span>✦</span>
          <span>✧</span>
          <span>✦</span>
          <span>✧</span>
        </div>

        <section className="mnx-simulador-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathnumbers-simulador-codigos"]} />

          <div className="mnx-simulador-top-actions">
            <button
              type="button"
              onClick={() =>
                setHelpOpen(true)
              }
            >
              <FiHelpCircle />
              Ayuda
            </button>

            <button
              type="button"
              onClick={() =>
                irARuta(
                  activityListRoute,
                )
              }
            >
              <FiLogOut />
              Salir de la actividad
            </button>
          </div>

          <header className="mnx-simulador-header">
            <div className="mnx-simulador-header-copy">
              <div className="mnx-simulador-breadcrumb">
                <strong>
                  MathNumbers
                </strong>
                <span>/</span>
                <span>
                  Tema 4: Introducción al álgebra
                </span>
              </div>

              <div className="mnx-simulador-title-row">
                <span className="mnx-simulador-title-icon">
                  <FiBookOpen />
                </span>

                <h1>
                  8. El Simulador de Códigos Algebraicos
                </h1>
              </div>

              <p>
                Descubre reglas con n para generar códigos
                y predecir niveles futuros.
              </p>

              <div className="mnx-simulador-pills">
                <span>Patrones</span>
                <span>12–16 min</span>
                <span>{mission.total} retos</span>
                <span>+60 XP</span>
              </div>
            </div>

            <div className="mnx-simulador-welcome">
              <article className="mnx-simulador-speech">
                <span>
                  Comandante Suma explica
                </span>

                <p aria-live="polite">
                  {introAudioStatus === "idle"
                    ? INTRO_INITIAL_TEXT
                    : INTRO_FULL_TEXT}
                </p>

                <div className="mnx-simulador-audio-controls">
                  <audio
                    ref={introAudioRef}
                    src={INTRO_AUDIO_SRC}
                    preload="metadata"
                    onPlay={() =>
                      setIntroAudioStatus("playing")
                    }
                    onPause={() => {
                      if (!introAudioRef.current?.ended) {
                        setIntroAudioStatus("paused");
                      }
                    }}
                    onEnded={() =>
                      setIntroAudioStatus("ended")
                    }
                  />

                  <button
                    type="button"
                    onClick={reproducirIntroduccion}
                    disabled={
                      introAudioStatus === "playing"
                    }
                    aria-label="Reproducir introducción del Comandante Suma"
                  >
                    <FiPlay />
                  </button>

                  <button
                    type="button"
                    onClick={pausarIntroduccion}
                    disabled={
                      introAudioStatus !== "playing"
                    }
                    aria-label="Pausar introducción del Comandante Suma"
                  >
                    <FiPause />
                  </button>

                  <button
                    type="button"
                    onClick={repetirIntroduccion}
                    aria-label="Repetir introducción del Comandante Suma"
                  >
                    <FiRotateCcw />
                  </button>

                  <span
                    className={`mnx-simulador-audio-status ${
                      introAudioStatus === "playing"
                        ? "is-playing"
                        : ""
                    }`}
                  >
                    <FiVolume2 />
                    {introStatusText}
                  </span>
                </div>
              </article>

              <img
                key={
                  introAudioStatus === "playing"
                    ? "simulador-suma-hablando"
                    : "simulador-suma-idle"
                }
                src={
                  introAudioStatus === "playing"
                    ? comandanteSumaHablando
                    : comandanteSumaIdle
                }
                alt={
                  introAudioStatus === "playing"
                    ? "Comandante Suma explicando la misión"
                    : "Comandante Suma listo para explicar"
                }
                className="mnx-simulador-intro-character"
                draggable={false}
                onError={(event) => {
                  event.currentTarget.src =
                    comandanteSumaIdle;
                }}
              />
            </div>
          </header>

          <EnsayoDeMision activityId="mathnumbers-simulador-codigos" />
          <section className="mnx-simulador-activity-grid">
            <div className="mnx-simulador-left-column">
  <article className="mnx-simulador-art">
                <img
                  src={activityScene}
                  alt="El Simulador de Códigos Algebraicos"
                  draggable={false}
                />

                <div className="mnx-simulador-mission">
                  <FiTarget />

                  <div>
                    <strong>
                      Tu misión
                    </strong>

                    <p>
                      Descubre la regla del simulador,
                      valida las reglas, y predice los
                      códigos futuros.
                    </p>

                    <div className="mnx-simulador-energy-track">
                      <b
                        style={{
                          width: `${energy}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>

  <section className="mnx-simulador-reminder-card">
                <img
                  key={
                    guideAudioStatus === "playing"
                      ? "simulador-consejo-hablando"
                      : "simulador-consejo-idle"
                  }
                  src={
                    guideAudioStatus === "playing"
                      ? comandanteSumaHablando
                      : comandanteSumaIdle
                  }
                  alt={
                    guideAudioStatus === "playing"
                      ? "Comandante Suma dando el consejo"
                      : "Comandante Suma listo para dar el consejo"
                  }
                  draggable={false}
                />

                <div className="mnx-simulador-reminder-copy">
                  <span>
                    Consejo de Suma
                  </span>

                  <h3>
                    Comprueba la regla completa
                  </h3>

                  <p aria-live="polite">
                    {guideAudioStatus === "idle"
                      ? GUIDE_INITIAL_TEXT
                      : GUIDE_FULL_TEXT}
                  </p>

                  <div className="mnx-simulador-reminder-audio-controls">
                    <audio
                      ref={guideAudioRef}
                      src={GUIDE_AUDIO_SRC}
                      preload="metadata"
                      onPlay={() =>
                        setGuideAudioStatus("playing")
                      }
                      onPause={() => {
                        if (!guideAudioRef.current?.ended) {
                          setGuideAudioStatus("paused");
                        }
                      }}
                      onEnded={() =>
                        setGuideAudioStatus("ended")
                      }
                    />

                    <button
                      type="button"
                      onClick={reproducirConsejo}
                      disabled={
                        guideAudioStatus === "playing"
                      }
                      aria-label="Reproducir Consejo de Suma"
                    >
                      <FiPlay />
                    </button>

                    <button
                      type="button"
                      onClick={pausarConsejo}
                      disabled={
                        guideAudioStatus !== "playing"
                      }
                      aria-label="Pausar Consejo de Suma"
                    >
                      <FiPause />
                    </button>

                    <button
                      type="button"
                      onClick={repetirConsejo}
                      aria-label="Repetir Consejo de Suma"
                    >
                      <FiRotateCcw />
                    </button>

                    <span
                      className={`mnx-simulador-reminder-audio-status ${
                        guideAudioStatus === "playing"
                          ? "is-playing"
                          : ""
                      }`}
                    >
                      <FiVolume2 />
                      {guideStatusText}
                    </span>
                  </div>
                </div>
              </section>

  <section className="mnx-simulador-quick-notes">
                <header>
                  <FiClipboard />

                  <strong>
                    Notas rápidas
                  </strong>
                </header>

                <ul>
                  <li>
                    n representa el número de nivel.
                  </li>

                  <li>
                    Encuentra una regla que funcione para
                    todos los valores de la tabla.
                  </li>

                  <li>
                    Usa la regla para predecir códigos de
                    niveles futuros.
                  </li>
                </ul>
              </section>

              

              <section className="mnx-simulador-stats mnx-simulador-stats-compact">
                <article>
                  <FiFlag />
                  <div>
                    <span>Segmentos</span>
                    <strong>
                      {progress + mission.readyCount}/{mission.total}
                    </strong>
                  </div>
                </article>

                <article>
                  <FiTarget />
                  <div>
                    <span>Retos</span>
                    <strong>3</strong>
                  </div>
                </article>

                <article>
                  <FiZap />
                  <div>
                    <span>Energía</span>
                    <strong>
                      {energy}%
                    </strong>
                  </div>
                </article>

                <article>
                  <span className="mnx-simulador-xp-star">
                    ★
                  </span>
                  <div>
                    <span>Recompensa</span>
                    <strong>60 XP</strong>
                  </div>
                </article>
              </section>

              <div className="mnx-simulador-left-status">
                {activityResolved && (
                  <article className="mnx-simulador-evidence-card mnx-simulador-evidence-card-left">
                    <div className="mnx-simulador-evidence-title">
                      <FiClipboard />

                      <strong>
                        Evidencia guardada
                      </strong>
                    </div>

                    <p>
                      Tus reglas, predicciones e intentos se
                      registraron correctamente.
                    </p>

                    <div className="mnx-simulador-info-row">
                      <FiInfo />

                      <p>
                        Podrás revisar tus aciertos y errores
                        en Retroalimentación.
                      </p>
                    </div>
                  </article>
                )}

                <article className="mnx-simulador-status-card mnx-simulador-status-card-left">
                  <header>
                    <FiZap />

                    <strong>
                      Estado del simulador
                    </strong>
                  </header>

                  <div>
                    <span className="is-blue">
                      ✦
                    </span>

                    <p>
                      Regla básica
                    </p>

                    {basicCorrect
                      ? <FiCheckCircle />
                      : <FiCircle />}
                  </div>

                  <div>
                    <span className="is-purple">
                      ✦
                    </span>

                    <p>
                      Regla combinada
                    </p>

                    {combinedCorrect
                      ? <FiCheckCircle />
                      : <FiCircle />}
                  </div>

                  <div>
                    <span className="is-green">
                      ✦
                    </span>

                    <p>
                      Predicción futura
                    </p>

                    {predictionsCorrect
                      ? <FiCheckCircle />
                      : <FiCircle />}
                  </div>

                  <small>
                    Resuelve todos los retos para desbloquear
                    los niveles futuros.
                  </small>
                </article>
              </div>
            </div>

            <div className="mnx-simulador-right-column">
  <section className="mnx-simulador-guide-card">
                <div className="mnx-simulador-section-heading">
                  <span>
                    <FiZap />
                  </span>

                  <div>
                    <strong>
                      Guía visual rápida
                    </strong>

                    <p>
                      Observa cómo cambia el código en cada nivel.
                    </p>
                  </div>
                </div>

                <div className="mnx-simulador-guide-steps">
                  <article>
                    <b>1</b>
                    <strong>
                      n representa el nivel
                    </strong>

                    <div className="mnx-simulador-mini-table">
                      <span>n</span>
                      <span>código</span>
                      <b>1</b>
                      <b>3</b>
                      <b>2</b>
                      <b>6</b>
                      <b>3</b>
                      <b>9</b>
                    </div>

                    <em>3n</em>
                  </article>

                  <i>→</i>

                  <article>
                    <b>2</b>
                    <strong>
                      Regla básica
                    </strong>

                    <div className="mnx-simulador-mini-table">
                      <span>n</span>
                      <span>código</span>
                      <b>1</b>
                      <b>2</b>
                      <b>2</b>
                      <b>4</b>
                      <b>3</b>
                      <b>6</b>
                    </div>

                    <em>2n</em>
                  </article>

                  <i>→</i>

                  <article>
                    <b>3</b>
                    <strong>
                      Regla combinada
                    </strong>

                    <div className="mnx-simulador-mini-table">
                      <span>n</span>
                      <span>código</span>
                      <b>1</b>
                      <b>5</b>
                      <b>2</b>
                      <b>7</b>
                      <b>3</b>
                      <b>9</b>
                    </div>

                    <em>2n + 3</em>
                  </article>
                </div>
              </section>

  <section className="mnx-simulador-challenges">
<article className="mnx-simulador-challenge-card">
                  <div className="mnx-simulador-challenge-head">
                    <span>1</span>

                    <div>
                      <h2>
                        Reto 1: Regla proporcional
                      </h2>

                      <p>
                        Observa la tabla y selecciona la regla.
                      </p>
                    </div>
                  </div>

                  <div className="mnx-simulador-code-table">
                    <span>n</span>
                    <b>1</b>
                    <b>2</b>
                    <b>3</b>

                    <span>código</span>
                    <b>2</b>
                    <b>4</b>
                    <b>6</b>
                  </div>

                  <div className="mnx-simulador-rule-options">
                    {shuffledBasicRules.map(
                      (rule) => (
                        <button
                          key={rule}
                          type="button"
                          className={
                            basicRule === rule
                              ? "is-selected"
                              : ""
                          }
                          onClick={() =>
                            setBasicRule(rule)
                          }
                          disabled={guardandoProgreso || (mission.correctOnly && basicCorrect)}
                        >
                          <span>
                            {rule}
                          </span>

                          <i>
                            <FiCheck />
                          </i>
                        </button>
                      ),
                    )}
                  </div>

                  <div className="mnx-simulador-note">
                    <FiInfo />
                    La regla debe funcionar para todas las filas.
                  </div>
                </article>

                <article className="mnx-simulador-challenge-card">
                  <div className="mnx-simulador-challenge-head">
                    <span>2</span>

                    <div>
                      <h2>
                        Reto 2: Regla con parte fija
                      </h2>

                      <p>
                        Encuentra la regla de la segunda tabla.
                      </p>
                    </div>
                  </div>

                  <div className="mnx-simulador-code-table">
                    <span>n</span>
                    <b>1</b>
                    <b>2</b>
                    <b>3</b>

                    <span>código</span>
                    <b>5</b>
                    <b>7</b>
                    <b>9</b>
                  </div>

                  <div className="mnx-simulador-rule-options">
                    {shuffledCombinedRules.map(
                      (rule) => (
                        <button
                          key={rule}
                          type="button"
                          className={
                            combinedRule === rule
                              ? "is-selected"
                              : ""
                          }
                          onClick={() =>
                            setCombinedRule(rule)
                          }
                          disabled={guardandoProgreso || (mission.correctOnly && combinedCorrect)}
                        >
                          <span>
                            {rule}
                          </span>

                          <i>
                            <FiCheck />
                          </i>
                        </button>
                      ),
                    )}
                  </div>

                  <div className="mnx-simulador-formula-clues">
                    <span>
                      <FiTrendingUp />
                      2 por nivel
                    </span>

                    <span>
                      <FiLock />
                      +3 fijo
                    </span>
                  </div>
                </article>

                <article className="mnx-simulador-challenge-card mnx-simulador-predictions">
                  <div className="mnx-simulador-challenge-head">
                    <span>3</span>

                    <div>
                      <h2>
                        Reto 3: Predicciones
                      </h2>

                      <p>
                        Usa la regla 2n + 3.
                      </p>
                    </div>
                  </div>

                  <label>
                    <span>
                      n = 5
                    </span>

                    <i>→</i>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern={"[0-9\\-]*"}
                      value={predictionFive}
                      onChange={(event) =>
                        setPredictionFive(
                          event.target.value,
                        )
                      }
                      disabled={guardandoProgreso || (mission.correctOnly && Number(predictionFive)===13)}
                      placeholder="?"
                    />

                    {predictionFive && (
                      predictionsReady &&
                      Number(predictionFive) === 13
                        ? <FiCheckCircle />
                        : <FiCircle />
                    )}
                  </label>

                  <label>
                    <span>
                      n = 10
                    </span>

                    <i>→</i>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern={"[0-9\\-]*"}
                      value={predictionTen}
                      onChange={(event) =>
                        setPredictionTen(
                          event.target.value,
                        )
                      }
                      disabled={guardandoProgreso || (mission.correctOnly && Number(predictionTen)===23)}
                      placeholder="?"
                    />

                    {predictionTen && (
                      predictionsReady &&
                      Number(predictionTen) === 23
                        ? <FiCheckCircle />
                        : <FiCircle />
                    )}
                  </label>

                  <div className="mnx-simulador-prediction-rule">
                    <span>
                      Estas predicciones usan:
                    </span>

                    <strong>
                      2n + 3
                    </strong>
                  </div>
                </article>
            

                <PilotEvidenceStatus pilot={pilotEvidence} />
            <RetosDeMision expansion={mission} disabled={guardandoProgreso} />
<article className="mnx-simulador-challenge-card mnx-simulador-explanation-card">
                  <div className="mnx-simulador-challenge-head">
                    <span>4</span>

                    <div>
                      <h2>
                        Reto extra: Explica con tus palabras
                      </h2>

                      <p>
                        ¿Qué representa n en este simulador?
                      </p>
                    </div>
                  </div>

                  <label className="mnx-simulador-answer-box">
                    <textarea
                      maxLength={200}
                      value={explanation}
                      onChange={(event) =>
                        setExplanation(
                          event.target.value,
                        )
                      }
                      disabled={guardandoProgreso}
                      placeholder="Escribe tu explicación aquí..."
                    />

                    <span>
                      {explanation.length} / 200
                    </span>
                  </label>

                  <div className="mnx-simulador-explanation-actions">
                    <button
                      type="button"
                      className="mnx-simulador-save-button mnx-simulador-save-explanation"
                      onClick={guardarExplicacion}
                      disabled={guardandoProgreso}
                    >
                      <FiSave />
                      Guardar explicación
                    </button>
                  </div>
                </article>
              </section>

            </div>
          </section>

        <CierreDeMision onFinish={comprobar} busy={guardandoProgreso}/></section>
      </section>

      <button
        className="mnx-simulador-logout"
        type="button"
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
      >
        <FiLogOut />
      </button>

      <FloatingByteHint
        open={helpOpen}
        onOpen={() => setHelpOpen(true)}
        onClose={() => setHelpOpen(false)}
      />

      {resultModalOpen && (
        <ResultModal
          reviewItems={[...([{id:"native-0",title:"Regla básica",answer:String(basicRule??""),correct:basicCorrect,hint:"La secuencia básica aumenta de dos en dos: 2n.",target:".mnx-simulador-rule-options"},{id:"native-1",title:"Regla combinada",answer:String(combinedRule??""),correct:combinedCorrect,hint:"Añade la reserva fija de tres a la regla: 2n + 3.",target:".mnx-simulador-rule-options"},{id:"native-2",title:"Predicciones n=5 y n=10",answer:`${predictionFive}, ${predictionTen}`,correct:predictionsCorrect,hint:"Sustituye en 2n + 3: para 5 da 13 y para 10 da 23.",target:".mnx-simulador-predictions"}]),...mission.items]}
          onCorrect={(item)=>{setResultModalOpen(false);mission.beginCorrection(item);}}
          summary={mission.result ?? undefined}
          kind={resultModalKind}
          nextRoute={activityListRoute}
          retryRoute={activityRoute}
          onClose={cerrarResultado}
          onRetry={repetirActividad}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}