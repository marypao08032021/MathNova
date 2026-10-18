import useMathNumbersEvidence from "../../../hooks/useMathNumbersEvidence";
import PilotEvidenceStatus from "../../../components/PilotEvidenceStatus";
import CierreDeMision from "../../../components/CierreDeMision";
import useMissionExpansion from "../../../hooks/useMissionExpansion";
import EnsayoDeMision from "../../../components/EnsayoDeMision";
import RetosDeMision from "../../../components/RetosDeMision";
import CabeceraCurricular from "../../../components/CabeceraCurricular";
import { activityCurriculum } from "../../../curriculum/activityCurriculum";
import "../../../styles/activityExperience.css";
import "./EnigmaVariables.css";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiBarChart2,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiFlag,
  FiGrid,
  FiHelpCircle,
  FiInfo,
  FiLogOut,
  FiMessageSquare,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSave,
  FiTarget,
  FiUser,
  FiVolume2,
  FiX,
  FiZap,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import activityScene from "../../../assets/mathnumbers/11-enigma/enigma.webp";
import audioConsejoSumaEnigma from "../../../assets/mathnumbers/11-enigma/consejo_suma_enigma.mp3";
import audioPistaByteEnigma from "../../../assets/mathnumbers/11-enigma/pista_byte_enigma.mp3";
import videoByteHablandoEnigma from "../../../assets/mathnumbers/11-enigma/byte_hablando_enigma.mp4";
import audioIntroEnigma from "../../../assets/mathnumbers/11-enigma/intro_enigma.mp3";
import comandanteSumaHablando from "../../../assets/mathnumbers/11-enigma/comandante_suma_hablando.webp";
import comandanteSumaIdle from "../../../assets/mathnumbers/11-enigma/comandante_suma_idle.png";
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

type MeaningOption = "unknown" | "total" | "active";

type ExpressionTokenId =
  | "variable"
  | "plus"
  | "four"
  | "two"
  | "multiply"
  | "minus";

type ExpressionToken = {
  id: ExpressionTokenId;
  value: string;
};

const meaningOptions: {
  id: MeaningOption;
  label: string;
}[] = [
  {
    id: "unknown",
    label:
      "La cantidad desconocida de energía necesaria.",
  },
  {
    id: "total",
    label:
      "La cantidad total de módulos del puente.",
  },
  {
    id: "active",
    label:
      "La cantidad de energía que ya está encendida.",
  },
];

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
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

const expressionTokens: ExpressionToken[] = [
  { id: "variable", value: "x" },
  { id: "plus", value: "+" },
  { id: "four", value: "4" },
  { id: "two", value: "2" },
  { id: "multiply", value: "×" },
  { id: "minus", value: "−" },
];

const correctExpression: ExpressionTokenId[] = [
  "variable",
  "plus",
  "four",
];

const activityRoute =
  "/actividades/mathnumbers/enigma-variables";

const nextActivityRoute =
  "/actividades/mathnumbers/simulador-codigos";

const INTRO_AUDIO_SRC = audioIntroEnigma;
const GUIDE_AUDIO_SRC = audioConsejoSumaEnigma;

const INTRO_INITIAL_TEXT =
  "Presiona reproducir para escuchar la introducción del Comandante Suma.";

const INTRO_FULL_TEXT =
  "El puente láser del sector perdió sus datos de calibración. Debes transformar situaciones visuales y frases breves en expresiones algebraicas sencillas utilizando la letra x para representar cantidades desconocidas.";

const GUIDE_INITIAL_TEXT =
  "Presiona reproducir para escuchar el consejo del Comandante Suma.";

const GUIDE_FULL_TEXT =
  "No intentes resolver ecuaciones complejas todavía. Concéntrate en comprender qué representa la variable y en sustituir el valor conocido para comprobar el resultado numérico.";

const HINT_AUDIO_SRC = audioPistaByteEnigma;

const BYTE_HINT_FULL_TEXT =
  "Identifica primero qué cantidad todavía no se conoce. Recuerda que palabras como «aumentado» indican una suma (+4) y frases como «por cada» se representan mediante una multiplicación (2x).";

function ByteEnigmaMedia({
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
      className="mnx-enigma-byte-panel-video"
      src={videoByteHablandoEnigma}
      muted
      loop
      playsInline
      preload="auto"
      poster={bytePista}
      aria-label="Byte mostrando una pista sobre variables y expresiones algebraicas"
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
      className={`mnx-enigma-byte-float ${
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
        <article className="mnx-enigma-byte-panel">
          <button
            type="button"
            className="mnx-enigma-byte-close"
            onClick={cerrarPista}
            aria-label="Cerrar pista de Byte"
          >
            <FiX />
          </button>

          <div className="mnx-enigma-byte-panel-media">
            <ByteEnigmaMedia
              active={status === "playing"}
            />
          </div>

          <div className="mnx-enigma-byte-panel-copy">
            <span className="mnx-enigma-byte-panel-label">
              Pista de Byte
            </span>

            <h3>Encuentra lo desconocido</h3>
            <p>{BYTE_HINT_FULL_TEXT}</p>

            <div className="mnx-enigma-byte-controls">
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
                className={`mnx-enigma-byte-status ${
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
        className="mnx-enigma-byte-launcher"
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

export function EnigmaVariables() {
  const mission = useMissionExpansion("mathnumbers-enigma-variables");
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

  const [meaningAnswer, setMeaningAnswer] =
    useState<MeaningOption | null>(null);

  const [
    expressionSlots,
    setExpressionSlots,
  ] = useState<(ExpressionTokenId | null)[]>([
    null,
    null,
    null,
  ]);

  const [substitutionResult, setSubstitutionResult] =
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

  const shuffledMeaningOptions = useMemo(
    () => shuffleArray(meaningOptions),
    [shuffleKey],
  );

  const shuffledExpressionTokens = useMemo(
    () => shuffleArray(expressionTokens),
    [shuffleKey],
  );

  const expressionComplete =
    expressionSlots.every(
      (slot) => slot !== null,
    );

  const progress = useMemo(
    () =>
      Number(meaningAnswer !== null) +
      Number(expressionComplete) +
      Number(
        substitutionResult.trim() !== "",
      ),
    [
      meaningAnswer,
      expressionComplete,
      substitutionResult,
    ],
  );

  const energy = Math.round(
    ((progress + mission.readyCount) / mission.total) * 100,
  );

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
        "No se pudo reproducir la introducción de El Enigma de Variables:",
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
        "No se pudo repetir la introducción de El Enigma de Variables:",
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
        "No se pudo reproducir el Consejo de Suma de El Enigma de Variables:",
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
        "No se pudo repetir el Consejo de Suma de El Enigma de Variables:",
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

  const placeToken = (
    tokenId: ExpressionTokenId,
    index?: number,
  ) => {
 if(mission.correctOnly && expressionSlots.every((slot,i)=>slot===correctExpression[i]))return;
    setExpressionSlots((current) => {
      const next = current.map((slot) =>
        slot === tokenId ? null : slot,
      );

      if (typeof index === "number") {
        next[index] = tokenId;
        return next;
      }

      const emptyIndex =
        next.findIndex(
          (slot) => slot === null,
        );

      if (emptyIndex >= 0) {
        next[emptyIndex] = tokenId;
      }

      return next;
    });
  };

  const removeToken = (index: number) => {
 if(mission.correctOnly && expressionSlots.every((slot,i)=>slot===correctExpression[i]))return;
    setExpressionSlots((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index
          ? null
          : slot,
      ),
    );
  };

  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    tokenId: ExpressionTokenId,
  ) => {
    event.dataTransfer.setData(
      "text/plain",
      tokenId,
    );
  };

  const handleDrop = (
    event: DragEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.preventDefault();

    const tokenId =
      event.dataTransfer.getData(
        "text/plain",
      ) as ExpressionTokenId;

    if (
      expressionTokens.some(
        (token) => token.id === tokenId,
      )
    ) {
      placeToken(tokenId, index);
    }
  };

  const resetExpression = () => {
    setExpressionSlots([
      null,
      null,
      null,
    ]);
  };

  const guardarExplicacion = () => {
    if (!explanation.trim()) {
      showToast(
        "Escribe una explicación antes de guardarla.",
        true,
      );
      return;
    }

    showToast(
      "Explicación guardada correctamente.",
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
    setMeaningAnswer(null);
    setExpressionSlots([
      null,
      null,
      null,
    ]);
    setSubstitutionResult("");
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
      "Enigma reiniciado. ¡Activa los segmentos nuevamente!",
    );
  };

  const cerrarResultado = () => {
    setResultModalOpen(false);

    // Conserva las respuestas para revisar y corregir. Reiniciar las limpia.
  };

  const pilotEvidence = useMathNumbersEvidence("mathnumbers-enigma-variables", mission, () => ({
            significado_variable:
              meaningAnswer,
            expresion_construida:
              expressionSlots,
            resultado_sustitucion:
              substitutionResult,
            explicacion_texto:
              explanation.trim(),
          }));

  const comprobar = async () => {
    if (!mission.ready) {
      showToast("Completa los códigos que faltan en los nuevos retos de la misión.", true);
      document.querySelector(`[data-mission="mathnumbers-enigma-variables"]`)?.scrollIntoView({behavior:"smooth",block:"center"});
      return;
    }

    if (guardandoProgreso) {
      return;
    }

    if (progress !== 3) {
      showToast(
        "Completa los tres retos antes de comprobar.",
        true,
      );
      return;
    }

    const meaningCorrect =
      meaningAnswer === "unknown";

    const expressionCorrect =
      expressionSlots.every(
        (slot, index) =>
          slot === correctExpression[index],
      );

    const substitutionCorrect =
      Number(
        substitutionResult.trim(),
      ) === 9;

    const pilotSnapshot = pilotEvidence.reviewForClose();
    const totalCorrect =
      Number(meaningCorrect) +
      Number(expressionCorrect) +
      Number(substitutionCorrect) + mission.correctCount;

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
            "mathnumbers-enigma-variables",
          actividad_titulo:
            "El Enigma de Variables",
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

      const numeroIntentos = Number(
        progresoGuardado.intentos ?? 1,
      );

      console.log(
        "Progreso del Enigma guardado:",
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
          numeroIntentos > 1
            ? `¡Enigma resuelto otra vez! Tu mejor resultado conserva ${estrellasGuardadas} ⭐.`
            : `¡Enigma resuelto! Ganaste ${estrellasGuardadas} estrellas. ⭐`,
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
          ? `¡Casi lo logras! Obtuviste ${estrellasGuardadas} estrellas; revisa uno de los segmentos.`
          : totalCorrect === 1
            ? `Tienes ${estrellasGuardadas} estrella. Revisa la variable, la expresión y la sustitución.`
            : "El enigma todavía tiene códigos incorrectos. Usa la pista de Byte.",
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
        "No se pudo guardar el progreso del Enigma:",
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

  const tokenValue = (
    tokenId: ExpressionTokenId,
  ) =>
    expressionTokens.find(
      (token) => token.id === tokenId,
    )?.value ?? "";

  return (
    <main className="mnx-enigma-page mn-activity mnx-enigma-cofre-layout">
      <button
        type="button"
        className={`mnx-enigma-hamburger ${
          menuOpen
            ? "mnx-enigma-hamburger-open"
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
          className="mnx-enigma-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`mnx-enigma-sidebar ${
          menuOpen
            ? "mnx-enigma-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-enigma-sidebar-logo"
        />

        <nav className="mnx-enigma-sidebar-menu">
          <button
            type="button"
            className="mnx-enigma-menu-item"
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
            className="mnx-enigma-menu-item mnx-enigma-menu-active"
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
            className="mnx-enigma-menu-item"
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
            className="mnx-enigma-menu-item"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="mnx-enigma-menu-item"
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
            className="mnx-enigma-menu-item"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <article className="mnx-enigma-week-card">
          <div className="mnx-enigma-week-head">
            <strong>
              Progreso semanal
            </strong>
            <span>Nivel 4</span>
          </div>

          <div className="mnx-enigma-week-progress">
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

      <section className="mnx-enigma-content">
        <div className="mnx-enigma-decoration mnx-enigma-decoration-one" />
        <div className="mnx-enigma-decoration mnx-enigma-decoration-two" />

        <div
          className="mnx-enigma-stars"
          aria-hidden="true"
        >
          <span>✦</span>
          <span>✧</span>
          <span>✦</span>
          <span>✧</span>
        </div>

        <section className="mnx-enigma-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathnumbers-enigma-variables"]} />

          <div className="mnx-enigma-top-actions">
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

          <header className="mnx-enigma-header">
            <div className="mnx-enigma-header-copy">
              <div className="mnx-enigma-breadcrumb">
                <strong>
                  MathNumbers
                </strong>
                <span>/</span>
                <span>
                  Tema 4: Introducción al álgebra
                </span>
              </div>

              <div className="mnx-enigma-title-row">
                <span className="mnx-enigma-title-icon">
                  <FiBookOpen />
                </span>

                <h1>
                  7. El Enigma de Variables
                </h1>
              </div>

              <p>
                Resuelve los retos usando variables para
                activar los segmentos del puente algebraico.
              </p>

              <div className="mnx-enigma-pills">
                <span>Variables</span>
                <span>12–15 min</span>
                <span>{mission.total} retos</span>
                <span>+60 XP</span>
              </div>
            </div>

            <div className="mnx-enigma-welcome">
              <article className="mnx-enigma-speech">
                <span>
                  Comandante Suma explica
                </span>

                <p aria-live="polite">
                  {introAudioStatus === "idle"
                    ? INTRO_INITIAL_TEXT
                    : INTRO_FULL_TEXT}
                </p>

                <div className="mnx-enigma-audio-controls">
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
                    className={`mnx-enigma-audio-status ${
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
                    ? "enigma-suma-hablando"
                    : "enigma-suma-idle"
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
                className="mnx-enigma-intro-character"
                draggable={false}
                onError={(event) => {
                  event.currentTarget.src =
                    comandanteSumaIdle;
                }}
              />
            </div>
          </header>

          <EnsayoDeMision activityId="mathnumbers-enigma-variables" />
          <section className="mnx-enigma-activity-grid">
            <div className="mnx-enigma-left-column">
              <article className="mnx-enigma-art">
                <img
                  src={activityScene}
                  alt="El Enigma de Variables"
                  draggable={false}
                />

                <div className="mnx-enigma-mission">
                  <FiTarget />

                  <div>
                    <strong>
                      Tu misión
                    </strong>

                    <p>
                      Interpreta situaciones con variables,
                      construye expresiones algebraicas y
                      verifica resultados para activar los
                      tres segmentos del puente.
                    </p>

                    <div className="mnx-enigma-energy-track">
                      <b
                        style={{
                          width: `${energy}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>

              <section className="mnx-enigma-reminder-card">
                <img
                  key={
                    guideAudioStatus === "playing"
                      ? "enigma-consejo-hablando"
                      : "enigma-consejo-idle"
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

                <div className="mnx-enigma-reminder-copy">
                  <span>
                    Consejo de Suma
                  </span>

                  <h3>
                    Comprende antes de resolver
                  </h3>

                  <p aria-live="polite">
                    {guideAudioStatus === "idle"
                      ? GUIDE_INITIAL_TEXT
                      : GUIDE_FULL_TEXT}
                  </p>

                  <div className="mnx-enigma-reminder-audio-controls">
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
                      className={`mnx-enigma-reminder-audio-status ${
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

              <section className="mnx-enigma-stats mnx-enigma-stats-compact">
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
                  <span className="mnx-enigma-xp-star">
                    ★
                  </span>
                  <div>
                    <span>Recompensa</span>
                    <strong>60 XP</strong>
                  </div>
                </article>
              </section>
            </div>

            <div className="mnx-enigma-right-column">
              <section className="mnx-enigma-guide-card">
                <div className="mnx-enigma-section-heading">
                  <span>
                    <FiZap />
                  </span>

                  <div>
                    <strong>
                      Guía visual rápida
                    </strong>

                    <p>
                      Variable → construcción → sustitución.
                    </p>
                  </div>
                </div>

                <div className="mnx-enigma-guide-steps">
                  <article>
                    <b>1</b>
                    <strong>Variable</strong>
                    <span>x</span>
                    <p>
                      Representa una cantidad desconocida.
                    </p>
                  </article>

                  <i>→</i>

                  <article>
                    <b>2</b>
                    <strong>Construcción</strong>
                    <span>x + 4</span>
                    <p>
                      Transforma la situación en una expresión.
                    </p>
                  </article>

                  <i>→</i>

                  <article>
                    <b>3</b>
                    <strong>Sustitución</strong>
                    <span>x = 5</span>
                    <p>
                      Sustituye y obtiene el resultado.
                    </p>
                  </article>
                </div>
              </section>

              <section className="mnx-enigma-challenges">
<article className="mnx-enigma-challenge-card mnx-enigma-challenge-one">
                  <div className="mnx-enigma-challenge-head">
                    <span>1</span>

                    <div>
                      <h2>
                        Reto 1: ¿Qué representa x?
                      </h2>
                      <p>
                        Elige el significado correcto.
                      </p>
                    </div>
                  </div>

                  <div className="mnx-enigma-context-box">
                    Un módulo del puente necesita una
                    cantidad desconocida de energía para
                    encenderse.
                  </div>

                  <div className="mnx-enigma-radio-options">
                    {shuffledMeaningOptions.map(
                      (option) => (
                        <label key={option.id}>
                          <input
                            type="radio"
                            name="meaning"
                            checked={
                              meaningAnswer ===
                              option.id
                            }
                            onChange={() =>
                              setMeaningAnswer(
                                option.id,
                              )
                            }
                            disabled={guardandoProgreso || (mission.correctOnly && meaningAnswer==="unknown")}
                          />
                          <span>
                            {option.label}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                </article>

                <article className="mnx-enigma-challenge-card mnx-enigma-challenge-two">
                  <div className="mnx-enigma-challenge-head">
                    <span>2</span>

                    <div>
                      <h2>
                        Reto 2: Construye la expresión
                      </h2>
                      <p>
                        Ordena las tarjetas correctamente.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="mnx-enigma-reset-expression"
                      onClick={resetExpression}
                      aria-label="Reiniciar expresión"
                    >
                      <FiRotateCcw />
                    </button>
                  </div>

                  <div className="mnx-enigma-context-box">
                    La energía del módulo aumenta en
                    4 unidades.
                  </div>

                  <div className="mnx-enigma-expression-slots">
                    {expressionSlots.map(
                      (slot, index) => (
                        <button
                          key={`expression-slot-${index}`}
                          type="button"
                          className={
                            slot
                              ? "is-filled"
                              : ""
                          }
                          onDragOver={(event) =>
                            event.preventDefault()
                          }
                          onDrop={(event) =>
                            handleDrop(
                              event,
                              index,
                            )
                          }
                          onClick={() =>
                            slot &&
                            removeToken(index)
                          }
                          aria-label={
                            slot
                              ? `Quitar ${tokenValue(
                                  slot,
                                )}`
                              : `Posición ${
                                  index + 1
                                } vacía`
                          }
                        >
                          {slot ? (
                            <strong>
                              {tokenValue(slot)}
                            </strong>
                          ) : (
                            <span>
                              {index + 1}
                            </span>
                          )}
                        </button>
                      ),
                    )}
                  </div>

                  <div className="mnx-enigma-token-bank">
                    {shuffledExpressionTokens.map(
                      (token) => {
                        const isUsed =
                          expressionSlots.includes(
                            token.id,
                          );

                        return (
                          <button
                            key={token.id}
                            type="button"
                            draggable={
                              !isUsed &&
                              !guardandoProgreso
                            }
                            disabled={
                              isUsed ||
                              guardandoProgreso
                            }
                            className={
                              isUsed
                                ? "is-used"
                                : ""
                            }
                            onDragStart={(event) =>
                              handleDragStart(
                                event,
                                token.id,
                              )
                            }
                            onClick={() =>
                              placeToken(
                                token.id,
                              )
                            }
                          >
                            {token.value}
                          </button>
                        );
                      },
                    )}
                  </div>
                </article>

                <article className="mnx-enigma-challenge-card mnx-enigma-challenge-three">
                  <div className="mnx-enigma-challenge-head">
                    <span>3</span>

                    <div>
                      <h2>
                        Reto 3: Sustitución
                      </h2>
                      <p>
                        Sustituye el valor de x.
                      </p>
                    </div>
                  </div>

                  <div className="mnx-enigma-substitution-expression">
                    <small>Expresión</small>
                    <strong>x + 4</strong>
                  </div>

                  <div className="mnx-enigma-substitution-row">
                    <span>x =</span>
                    <b>5</b>
                  </div>

                  <label className="mnx-enigma-result-field">
                    <span>Resultado</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern={"[0-9\\-]*"}
                      value={substitutionResult}
                      onChange={(event) =>
                        setSubstitutionResult(
                          event.target.value,
                        )
                      }
                      disabled={guardandoProgreso || (mission.correctOnly && Number(substitutionResult)===9)}
                      placeholder="?"
                    />
                  </label>
                </article>

                <PilotEvidenceStatus pilot={pilotEvidence} />
            <RetosDeMision expansion={mission} disabled={guardandoProgreso} />
<article className="mnx-enigma-explanation-card">
                  <div className="mnx-enigma-challenge-head">
                    <span>4</span>

                    <div>
                      <h2>
                        Reto extra: Explica con tus palabras
                      </h2>
                      <p>
                        ¿Qué representa x en esta misión?
                      </p>
                    </div>
                  </div>

                  <label className="mnx-enigma-answer-box">
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

                  <div className="mnx-enigma-explanation-actions">
                    <button
                      type="button"
                      className="mnx-enigma-save-button mnx-enigma-save-button-inline"
                      onClick={guardarExplicacion}
                      disabled={guardandoProgreso}
                    >
                      <FiSave />
                      Guardar explicación
                    </button>
                  </div>
                </article>
              </section>

              <aside className="mnx-enigma-actions">
                

                {activityResolved && (
                  <article className="mnx-enigma-evidence-card">
                    <div className="mnx-enigma-evidence-title">
                      <FiClipboard />

                      <strong>
                        Evidencia guardada
                      </strong>
                    </div>

                    <p>
                      Tus respuestas, intentos y explicación
                      se registraron correctamente.
                    </p>

                    <div className="mnx-enigma-info-row">
                      <FiInfo />

                      <p>
                        Podrás revisar tus aciertos y errores
                        en Retroalimentación.
                      </p>
                    </div>
                  </article>
                )}
              </aside>
            </div>
          </section>
        <CierreDeMision onFinish={comprobar} busy={guardandoProgreso}/></section>
      </section>

      <button
        className="mnx-enigma-logout"
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
          reviewItems={[...([{id:"native-0",title:"Significado de x",answer:String(meaningAnswer??""),correct:meaningAnswer==="unknown",hint:"x representa una cantidad desconocida.",target:".mnx-enigma-activity-grid"},{id:"native-1",title:"Expresión del enigma",answer:expressionSlots.join(" "),correct:expressionSlots.every((slot,i)=>slot===correctExpression[i]),hint:"La cantidad desconocida más cuatro se representa x + 4.",target:".mnx-enigma-token-bank"},{id:"native-2",title:"Sustitución",answer:substitutionResult,correct:substitutionResult.trim()!==""&&Number(substitutionResult)===9,hint:"Sustituye x por 5: 5 + 4 = 9.",target:".mnx-enigma-result-field"}]),...mission.items]}
          onCorrect={(item)=>{setResultModalOpen(false);mission.beginCorrection(item);}}
          summary={mission.result ?? undefined}
          kind={resultModalKind}
          nextRoute={nextActivityRoute}
          retryRoute={activityRoute}
          onClose={cerrarResultado}
          onRetry={repetirActividad}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}