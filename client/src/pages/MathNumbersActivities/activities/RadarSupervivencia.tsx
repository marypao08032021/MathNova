import {useLiveEvidence} from '../../../utils/livePresence';
import usePilotEvidence from "../../../hooks/usePilotEvidence";
import PilotEvidenceStatus from "../../../components/PilotEvidenceStatus";
import {resetPilotSession} from "../../../utils/pilotEvidence";
import CierreDeMision from "../../../components/CierreDeMision";
import useMissionExpansion from "../../../hooks/useMissionExpansion";
import EnsayoDeMision from "../../../components/EnsayoDeMision";
import RetosDeMision from "../../../components/RetosDeMision";
import CabeceraCurricular from "../../../components/CabeceraCurricular";
import { activityCurriculum } from "../../../curriculum/activityCurriculum";
import "../../../styles/activityExperience.css";
import "./RadarSupervivencia.css";
import audioIntroSumaRadar from "../../../assets/mathnumbers/02-radar-supervivencia/intro_suma_radar.mp3";
import audioConsejoSumaRadar from "../../../assets/mathnumbers/02-radar-supervivencia/consejo_suma_radar.mp3";
import audioPistaByteRadar from "../../../assets/mathnumbers/02-radar-supervivencia/pista_byte_radar.mp3";
import bytePista from "../../../assets/mathnumbers/byte_pista.png";
import videoByteRadar from "../../../assets/mathnumbers/02-radar-supervivencia/byte_hablando_radar.mp4";
import radarAnimado from "../../../assets/mathnumbers/02-radar-supervivencia/carpeta_radar_animado.webp";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowDown,
  FiBarChart2,
  FiCheckCircle,
  FiClipboard,
  FiGrid,
  FiHelpCircle,
  FiInfo,
  FiLogOut,
  FiMessageSquare,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSave,
  FiShield,
  FiTarget,
  FiUser,
  FiVolume2,
  FiX,
} from "react-icons/fi";

import {
  GiRingedPlanet,
  GiTrophyCup,
} from "react-icons/gi";

import { clearAuthSession } from "../../../utils/authSession";
import { activityListRoute } from "../constants";
import { Toast } from "../components/Toast";
import { ResultModal } from "../components/ResultModal";
import type { ResultKind } from "../types";
import { useToast } from "../hooks/useToast";
import {
  guardarProgresoUsuarioActual,
} from "../../../services/progresoService";
import {
  cofreGuide,
  cofreHeroTalking,
  cofreHeroTalkingIdle,
  logo,
  menuHamburguesa,
  zorritoConsejo,
} from "../mathNumbersAssets";

import { formatSigned } from "../utils/formatSigned";

const radarRoute =
  "/actividades/mathnumbers/radar-supervivencia";

const ascensorRoute =
  "/actividades/mathnumbers/ascensor-bunker";

const signals = [
  {
    value: "3",
    label: "Señal aliada A",
    type: "ally",
  },
  {
    value: "5",
    label: "Señal aliada B",
    type: "ally",
  },
  {
    value: "-2",
    label: "Señal enemiga C",
    type: "enemy",
  },
  {
    value: "-4",
    label: "Señal enemiga D",
    type: "enemy",
  },
] as const;

const targets = ["-4", "-2", "3", "5"] as const;

const numberLine = [
  -5,
  -4,
  -3,
  -2,
  -1,
  0,
  1,
  2,
  3,
  4,
  5,
];

type SignalValue =
  (typeof signals)[number]["value"];

const getSignal = (value?: string) =>
  signals.find(
    (signal) => signal.value === value,
  );

const numberToColumn = (
  value: string | number,
) => Number(value) + 6;

type AudioStatus = "idle" | "playing" | "paused" | "ended";

const SUMA_RADAR_VISIBLE_TEXT =
  "Coloca las cuatro señales en la posición correcta de la recta numérica. Puedes arrastrarlas o seleccionarlas antes de elegir su lugar.";

const BYTE_RADAR_TEXT =
  "Usa el cero como referencia. Los números negativos van a la izquierda y los positivos a la derecha. Después compara qué tan lejos está cada señal del cero y colócala sobre el número que representa.";

function RadarSumaIntro() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error("No se pudo reproducir la voz de Suma en Radar:", error);
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setStatus("paused");
  };

  const restartAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error("No se pudo reiniciar la voz de Suma en Radar:", error);
    }
  };

  const statusText =
    status === "playing"
      ? "Suma está hablando"
      : status === "paused"
        ? "Audio en pausa"
        : status === "ended"
          ? "Instrucción completada"
          : "Listo para escuchar";

  return (
    <div className="mnx-radar-welcome">
      <article className="mnx-radar-speech">
        <strong>¡Atención, explorador!</strong>
        <span>{SUMA_RADAR_VISIBLE_TEXT}</span>

        <audio
          ref={audioRef}
          src={audioIntroSumaRadar}
          preload="metadata"
          onPlay={() => setStatus("playing")}
          onPause={() => {
            if (!audioRef.current?.ended) {
              setStatus("paused");
            }
          }}
          onEnded={() => setStatus("ended")}
        />

        <div className="mnx-radar-suma-audio">
          <button
            type="button"
            onClick={playAudio}
            disabled={status === "playing"}
            aria-label="Reproducir instrucción del Comandante Suma"
          >
            <FiPlay />
          </button>

          <button
            type="button"
            onClick={pauseAudio}
            disabled={status !== "playing"}
            aria-label="Pausar instrucción del Comandante Suma"
          >
            <FiPause />
          </button>

          <button
            type="button"
            onClick={restartAudio}
            aria-label="Repetir instrucción del Comandante Suma"
          >
            <FiRotateCcw />
          </button>

          <span className={status === "playing" ? "is-playing" : ""}>
            <FiVolume2 />
            {statusText}
          </span>
        </div>
      </article>

      <img
        key={status === "playing" ? "suma-radar-talking" : "suma-radar-idle"}
        className="mnx-radar-hero"
        src={
          status === "playing"
            ? cofreHeroTalking
            : cofreHeroTalkingIdle
        }
        alt="Comandante Suma"
      />
    </div>
  );
}


const SUMA_RADAR_ADVICE_TEXT =
  "Usa el cero como punto de referencia. Los números negativos se colocan a la izquierda y los positivos a la derecha. Entre dos números negativos, el que está más lejos del cero queda más a la izquierda.";

function RadarSumaAdvice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error("No se pudo reproducir el consejo de Suma en Radar:", error);
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setStatus("paused");
  };

  const restartAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error("No se pudo repetir el consejo de Suma en Radar:", error);
    }
  };

  const statusText =
    status === "playing"
      ? "Suma está hablando"
      : status === "paused"
        ? "Audio en pausa"
        : status === "ended"
          ? "Consejo completado"
          : "Listo para escuchar";

  return (
    <section className="mnx-radar-reminder-card mnx-radar-reminder mnx-radar-suma-advice">
      <img
        key={status === "playing" ? "suma-radar-advice-talking" : "suma-radar-advice-idle"}
        src={status === "playing" ? cofreHeroTalking : cofreGuide}
        alt="Comandante Suma dando un consejo"
        draggable={false}
      />

      <div className="mnx-radar-suma-advice-copy">
        <span className="mnx-radar-suma-advice-label">Consejo de Suma</span>
        <h3>Usa el cero como referencia</h3>
        <p>{SUMA_RADAR_ADVICE_TEXT}</p>

        <audio
          ref={audioRef}
          src={audioConsejoSumaRadar}
          preload="metadata"
          onPlay={() => setStatus("playing")}
          onPause={() => {
            if (!audioRef.current?.ended) {
              setStatus("paused");
            }
          }}
          onEnded={() => setStatus("ended")}
        />

        <div className="mnx-radar-suma-audio mnx-radar-suma-advice-audio">
          <button
            type="button"
            onClick={playAudio}
            disabled={status === "playing"}
            aria-label="Reproducir consejo de Suma"
          >
            <FiPlay />
          </button>

          <button
            type="button"
            onClick={pauseAudio}
            disabled={status !== "playing"}
            aria-label="Pausar consejo de Suma"
          >
            <FiPause />
          </button>

          <button
            type="button"
            onClick={restartAudio}
            aria-label="Repetir consejo de Suma"
          >
            <FiRotateCcw />
          </button>

          <span className={status === "playing" ? "is-playing" : ""}>
            <FiVolume2 />
            {statusText}
          </span>
        </div>
      </div>
    </section>
  );
}

function limpiarFondoByteRadar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const total = width * height;
  const visitado = new Uint8Array(total);
  const pila: number[] = [];

  const esFondo = (index: number) => {
    const pixel = index * 4;
    const r = data[pixel];
    const g = data[pixel + 1];
    const b = data[pixel + 2];

    const esClaro = r > 224 && g > 224 && b > 224;
    const casiSinColor =
      Math.abs(r - g) < 34 &&
      Math.abs(r - b) < 34 &&
      Math.abs(g - b) < 34;

    const esMagenta =
      r > 175 &&
      b > 175 &&
      g < 135 &&
      Math.abs(r - b) < 90;

    return (esClaro && casiSinColor) || esMagenta;
  };

  const agregar = (index: number) => {
    if (index < 0 || index >= total) return;
    if (visitado[index]) return;
    if (!esFondo(index)) return;

    visitado[index] = 1;
    pila.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    agregar(x);
    agregar((height - 1) * width + x);
  }

  for (let y = 0; y < height; y += 1) {
    agregar(y * width);
    agregar(y * width + width - 1);
  }

  while (pila.length > 0) {
    const index = pila.pop();
    if (index === undefined) continue;

    data[index * 4 + 3] = 0;

    const x = index % width;
    const y = Math.floor(index / width);

    if (x > 0) agregar(index - 1);
    if (x < width - 1) agregar(index + 1);
    if (y > 0) agregar(index - width);
    if (y < height - 1) agregar(index + width);
  }

  ctx.putImageData(imageData, 0, 0);
}

function dibujarByteRadar(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
) {
  const videoWidth = video.videoWidth || width;
  const videoHeight = video.videoHeight || height;
  const escala = Math.min(width / videoWidth, height / videoHeight);
  const drawWidth = videoWidth * escala;
  const drawHeight = videoHeight * escala;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
}

function ByteRadarMedia({ active }: { active: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const canvasWidth = 480;
    const canvasHeight = 520;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let lastDraw = 0;

    const drawFrame = () => {
      if (video.readyState < 2) return;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      dibujarByteRadar(ctx, video, canvasWidth, canvasHeight);
      limpiarFondoByteRadar(ctx, canvasWidth, canvasHeight);
    };

    const drawAnimation = (time: number) => {
      if (time - lastDraw >= 45 && video.readyState >= 2) {
        drawFrame();
        lastDraw = time;
      }
      animationFrame = window.requestAnimationFrame(drawAnimation);
    };

    const prepare = () => {
      drawFrame();
      setVideoReady(true);
    };

    video.addEventListener("loadeddata", prepare);
    if (video.readyState >= 2) prepare();
    animationFrame = window.requestAnimationFrame(drawAnimation);

    return () => {
      video.removeEventListener("loadeddata", prepare);
      window.cancelAnimationFrame(animationFrame);
      video.pause();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    if (active) {
      video.play().catch((error) => {
        console.error("No se pudo reproducir la animación de Byte en Radar:", error);
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active]);

  return (
    <>
      <video
        ref={videoRef}
        src={videoByteRadar}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {!videoReady && (
        <img
          className="mnx-radar-byte-character"
          src={bytePista}
          alt="Byte"
          draggable={false}
        />
      )}

      <canvas
        ref={canvasRef}
        className="mnx-radar-byte-character"
        role="img"
        aria-label="Byte hablando y ofreciendo una pista"
        style={{ display: videoReady ? "block" : "none" }}
      />
    </>
  );
}

function FloatingByteRadar() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AudioStatus>("idle");

  const openHint = async () => {
    setOpen(true);
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error("No se pudo reproducir automáticamente la pista de Byte en Radar:", error);
    }
  };

  const closeHint = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setStatus("idle");
    setOpen(false);
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setStatus("paused");
  };

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.ended) audio.currentTime = 0;

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error("No se pudo reproducir la pista de Byte en Radar:", error);
    }
  };

  const restartAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error("No se pudo repetir la pista de Byte en Radar:", error);
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
    <div className={`mnx-radar-byte-float ${open ? "mnx-radar-byte-float-open" : ""}`}>
      <audio
        ref={audioRef}
        src={audioPistaByteRadar}
        preload="metadata"
        onPlay={() => setStatus("playing")}
        onPause={() => {
          if (!audioRef.current?.ended && open) {
            setStatus("paused");
          }
        }}
        onEnded={() => setStatus("ended")}
      />

      {open && (
        <article className="mnx-radar-byte-panel">
          <button
            type="button"
            className="mnx-radar-byte-close"
            onClick={closeHint}
            aria-label="Cerrar pista de Byte"
          >
            <FiX />
          </button>

          <div className="mnx-radar-byte-media">
            <ByteRadarMedia active={status === "playing"} />
          </div>

          <div className="mnx-radar-byte-copy">
            <span className="mnx-radar-byte-label">Pista de Byte</span>
            <h3>Usa el cero como referencia</h3>
            <p>{BYTE_RADAR_TEXT}</p>

            <div className="mnx-radar-byte-audio">
              <button
                type="button"
                onClick={playAudio}
                disabled={status === "playing"}
                aria-label="Reproducir pista de Byte"
              >
                <FiPlay />
              </button>

              <button
                type="button"
                onClick={pauseAudio}
                disabled={status !== "playing"}
                aria-label="Pausar pista de Byte"
              >
                <FiPause />
              </button>

              <button
                type="button"
                onClick={restartAudio}
                aria-label="Repetir pista de Byte"
              >
                <FiRotateCcw />
              </button>

              <span className={status === "playing" ? "is-playing" : ""}>
                <FiVolume2 />
                {statusText}
              </span>
            </div>
          </div>
        </article>
      )}

      <button
        type="button"
        className="mnx-radar-byte-launcher"
        onClick={openHint}
        aria-label="Abrir pista de Byte"
        aria-expanded={open}
      >
        <span>PISTA</span>
        <img src={bytePista} alt="Byte" draggable={false} />
        <i aria-hidden="true">?</i>
      </button>
    </div>
  );
}

export function RadarSupervivencia() {
  const mission = useMissionExpansion("mathnumbers-radar-supervivencia");
  const pilot=usePilotEvidence("mathnumbers-radar-supervivencia");
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    selectedSignal,
    setSelectedSignal,
  ] = useState<SignalValue | null>(null);

  const [placements, setPlacements] =
    useState<Record<string, string>>({});

  useLiveEvidence("mathnumbers-radar-supervivencia",()=>({posiciones_usuario:placements,mission_expansion:mission.evidence}));
  const [explanation, setExplanation] =
    useState("");

  /*
   * Controla la ventana de resultado.
   */
  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

  const [resultModalKind, setResultModalKind] =
    useState<ResultKind>("completed");

  const [guardandoProgreso, setGuardandoProgreso] =
    useState(false);

  const inicioActividadRef = useRef<number>(Date.now());
  const modalTimerRef = useRef<number | null>(null);

  const progress =
    Object.keys(placements).length;

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (modalTimerRef.current !== null) {
        window.clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();

    navigate("/login", {
      replace: true,
    });
  };

  const setPlacementWithoutDuplicate = (
    target: string,
    value: string,
  ) => {
    setPlacements((current) => {
      if(mission.correctOnly && (current[target]===target || Object.entries(current).some(([signal,position])=>signal===position && position===value)))return current;
      const next: Record<string, string> = {};

      Object.entries(current).forEach(
        ([currentTarget, currentValue]) => {
          if (
            currentValue !== value &&
            currentTarget !== target
          ) {
            next[currentTarget] =
              currentValue;
          }
        },
      );

      next[target] = value;

      return next;
    });
  };

  const placeSignal = (
    target: string,
    value: string,
  ) => {
    setPlacementWithoutDuplicate(
      target,
      value,
    );

    setSelectedSignal(
      value as SignalValue,
    );
  };

  const dragSignal = (
    event: DragEvent<HTMLButtonElement>,
    value: string,
  ) => {
    event.dataTransfer.setData(
      "text/plain",
      value,
    );
  };

  const dropSignal = (
    event: DragEvent<HTMLButtonElement>,
    target: string,
  ) => {
    event.preventDefault();

    const value =
      event.dataTransfer.getData(
        "text/plain",
      );

    if (value) {
      placeSignal(target, value);
    }
  };

  const guardarExplicacion = () => {
    if (!explanation.trim()) {
      showToast(
        "Escribe una explicación corta antes de guardarla.",
        true,
      );

      return;
    }

    showToast(
      "Explicación guardada como evidencia.",
    );
  };

  /*
   * Cierra el modal y deja Radar desde cero.
   */
  const programarModalResultado = (
    kind: ResultKind,
    delay: number,
  ) => {
    if (modalTimerRef.current !== null) {
      window.clearTimeout(modalTimerRef.current);
    }

    modalTimerRef.current = window.setTimeout(() => {
      setResultModalKind(kind);
      setResultModalOpen(true);
      modalTimerRef.current = null;
    }, delay);
  };

  /*
   * Cierra el modal y deja Radar desde cero.
   */
  const repetirActividad = () => {
    resetPilotSession("mathnumbers-radar-supervivencia");
    mission.reset();
    if (modalTimerRef.current !== null) {
      window.clearTimeout(modalTimerRef.current);
      modalTimerRef.current = null;
    }

    setResultModalOpen(false);
    setSelectedSignal(null);
    setPlacements({});
    setExplanation("");
    setGuardandoProgreso(false);

    inicioActividadRef.current = Date.now();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast(
      "Radar reiniciado. ¡Vuelve a colocar las señales!",
    );
  };

  const comprobar = async () => {
    if (!mission.ready) {
      showToast("Completa los códigos que faltan en los nuevos retos de la misión.", true);
      document.querySelector(`[data-mission="mathnumbers-radar-supervivencia"]`)?.scrollIntoView({behavior:"smooth",block:"center"});
      return;
    }

    if (guardandoProgreso) {
      return;
    }

    if (progress < targets.length) {
      showToast(
        "Ubica las cuatro señales para activar el radar.",
        true,
      );

      return;
    }

    mission.review();
    const total = targets.filter(
      (target) =>
        placements[target] === target,
    ).length + mission.correctCount;

    const esCorrecto = total === mission.total;

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
          tema: "Positivos y negativos",
          actividad_codigo:
            "mathnumbers-radar-supervivencia",
          actividad_titulo:
            "El Radar de Supervivencia",
          respuestas: {
            mission_expansion: mission.evidence,
            posiciones_usuario: placements,
            explicacion_texto: explanation.trim(),
          },
          aciertos: total,
          total_preguntas: mission.total,
          tiempo_segundos: tiempoSegundos,
          xp_base: 40,
          completada: esCorrecto,
        });
      mission.recordResult({correct:total,seconds:tiempoSegundos,xp:Number(resultado.progreso.xp_obtenido ?? 0)});

      inicioActividadRef.current = Date.now();

      const progresoGuardado = resultado.progreso;

      const estrellasGuardadas = Number(
        progresoGuardado.estrellas_obtenidas ?? 0,
      );

      const intentosGuardados = Number(
        progresoGuardado.intentos ?? 1,
      );

      console.log(
        "Progreso del Radar guardado:",
        progresoGuardado,
      );

      if (esCorrecto) {
        showToast(
          intentosGuardados > 1
            ? `¡Increíble! Volviste a calibrar el radar. Tu mejor resultado conserva ${estrellasGuardadas} ⭐.`
            : `¡Excelente! Radar calibrado. ¡Has ganado ${estrellasGuardadas} estrellas! ⭐`,
        );

        programarModalResultado(
          "completed",
          1200,
        );

        return;
      }

      showToast(
        total >= 2
          ? "Vas cerca: todavía hay señales en posiciones incorrectas."
          : "Hay varias señales fuera de posición. Usa el cero como referencia.",
        true,
      );

      programarModalResultado(
        total >= 2 ? "almost" : "retry",
        900,
      );
    } catch (error) {
      console.error(
        "No se pudo guardar el progreso del Radar:",
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
    <main className="mnx-radar-page mn-activity">
      <button
        type="button"
        className={`mnx-radar-hamburger ${
          menuOpen
            ? "mnx-radar-hamburger-open"
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
          className="mnx-radar-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`mnx-radar-sidebar ${
          menuOpen
            ? "mnx-radar-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-radar-sidebar-logo"
        />

        <nav className="mnx-radar-sidebar-menu">
          <button
            className="mnx-radar-menu-item"
            type="button"
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
            className="mnx-radar-menu-item mnx-radar-menu-active"
            type="button"
            onClick={() =>
              irARuta("/seleccion-mundos")
            }
          >
            <GiRingedPlanet />

            <span>
              Selección de mundos
            </span>
          </button>

          <button
            className="mnx-radar-menu-item"
            type="button"
            onClick={() =>
              irARuta("/retroalimentacion")
            }
          >
            <FiMessageSquare />

            <span>
              Retroalimentación
            </span>
          </button>

          <button
            className="mnx-radar-menu-item"
            type="button"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />

            <span>Recompensas</span>
          </button>

          <button
            className="mnx-radar-menu-item"
            type="button"
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
            className="mnx-radar-menu-item"
            type="button"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />

            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mnx-radar-sidebar-fox-box">
          <img
            src={zorritoConsejo}
            alt="Zorrito consejo MathNova"
            className="mnx-radar-sidebar-fox"
          />
        </div>
      </aside>

      <section className="mnx-radar-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathnumbers-radar-supervivencia"]} />

        <div className="mnx-radar-top-actions">
          <button
            type="button"
            className="mnx-radar-ghost-btn"
            onClick={() =>
              showToast(
                "Ayuda: selecciona o arrastra cada señal hasta su número.",
              )
            }
          >
            <FiHelpCircle />
            Ayuda
          </button>

          <button
            type="button"
            className="mnx-radar-ghost-btn mnx-radar-exit-btn"
            onClick={() =>
              irARuta(activityListRoute)
            }
          >
            <span>←</span>
            Salir de la actividad
          </button>
        </div>

        <header className="mnx-radar-header">
          <div className="mnx-radar-header-copy">
            <div className="mnx-radar-breadcrumb">
              <strong>
                MathNumbers
              </strong>

              <span>/</span>

              <span>
                Tema 2: Positivos y negativos
              </span>
            </div>

            <div className="mnx-radar-title-row">
              <span
                className="mnx-radar-title-icon"
                aria-hidden="true"
              >
                <FiTarget />
              </span>

              <h1>
                El Radar de Supervivencia
              </h1>
            </div>

            <p>
              Ubica números positivos y negativos
              en la recta numérica.
              <br />
              Cada señal correcta ayudará a
              calibrar el radar de la base.
            </p>
          </div>

          <RadarSumaIntro />
        </header>

        <EnsayoDeMision activityId="mathnumbers-radar-supervivencia" />
          <section className="mnx-radar-activity-grid">
          <article className="mnx-radar-art">
            <div className="mnx-radar-visual">
              <img
                className="mnx-radar-visual-image"
                src={radarAnimado}
                alt="Radar de supervivencia calibrando señales"
                draggable={false}
              />
            </div>

            <div className="mnx-radar-mission">
              <FiTarget />

              <div>
                <strong>
                  Tu misión
                </strong>

                <p>
                  Coloca las cuatro señales en la
                  posición correcta de la recta
                  numérica.
                </p>
              </div>
            </div>
          </article>

          <section className="mnx-radar-guide-card">
            <div className="mnx-radar-card-title">
              <span>↔</span>

              <strong>
                Guía visual rápida
              </strong>
            </div>

            <div className="mnx-radar-guide-copy">
              <strong className="negative">
                Negativos a la izquierda del 0
              </strong>

              <strong className="positive">
                Positivos a la derecha del 0
              </strong>
            </div>

            <NumberAxis variant="guide" />
          </section>
<section className="mnx-radar-placement-card">
            <div className="mnx-radar-question-head">
              <span>1</span>

              <h2>
                Arrastra o selecciona cada señal y
                colócala en su número.
              </h2>
            </div>

            <div className="mnx-radar-signals">
              {signals.map((signal) => (
                <button
                  key={signal.value}
                  type="button"
                  draggable
                  className={`mnx-radar-signal ${signal.type} ${
                    selectedSignal ===
                    signal.value
                      ? "selected"
                      : ""
                  }`}
                  onDragStart={(event) =>
                    dragSignal(
                      event,
                      signal.value,
                    )
                  }
                  onClick={() =>
                    setSelectedSignal(
                      signal.value,
                    )
                  }
                >
                  {signal.type ===
                  "ally" ? (
                    <FiShield />
                  ) : (
                    <FiTarget />
                  )}

                  <span>
                    <small>
                      {signal.label}
                    </small>

                    <strong>
                      {formatSigned(
                        signal.value,
                      )}
                    </strong>
                  </span>
                </button>
              ))}
            </div>

            <div className="mnx-radar-drop-zone">
              <div className="mnx-radar-targets">
                {targets.map((target) => {
                  const placedValue =
                    placements[target];

                  const signal =
                    getSignal(placedValue);

                  return (
                    <button
                      key={target}
                      type="button"
                      style={{
                        gridColumn:
                          numberToColumn(
                            target,
                          ),
                      }}
                      className={`mnx-radar-target ${
                        placedValue
                          ? "filled"
                          : ""
                      } ${
                        signal?.type || ""
                      }`}
                      onDragOver={(event) =>
                        event.preventDefault()
                      }
                      onDrop={(event) =>
                        dropSignal(
                          event,
                          target,
                        )
                      }
                      onClick={() =>
                        selectedSignal &&
                        placeSignal(
                          target,
                          selectedSignal,
                        )
                      }
                      aria-label={`Colocar señal en ${target}`}
                    >
                      {placedValue ? (
                        formatSigned(
                          placedValue,
                        )
                      ) : (
                        <FiArrowDown />
                      )}
                    </button>
                  );
                })}
              </div>

              <NumberAxis variant="work" />
            </div>
          <PilotEvidenceStatus pilot={pilot}/><RetosDeMision expansion={mission} disabled={guardandoProgreso} />
            </section>

          <RadarSumaAdvice />

          
<section className="mnx-radar-question-card mnx-radar-question">
            <div className="mnx-radar-question-head">
              <span>2</span>

              <h2>
                ¿Por qué -4 queda más lejos a la
                izquierda que -2?
              </h2>
            </div>

            <label className="mnx-radar-answer-box">
              <textarea
                maxLength={300}
                value={explanation}
                onChange={(event) =>
                  setExplanation(
                    event.target.value,
                  )
                }
                placeholder="Escribe tu explicación aquí..."
              />

              <span>
                {explanation.length} / 300
              </span>
            </label>

            <button
              type="button"
              className="mnx-radar-save-btn"
              onClick={guardarExplicacion}
            >
              <FiSave />
              Guardar explicación
            </button>
          </section>

          <section className="mnx-radar-actions">
            

            <p className="mnx-radar-progress">
              Progreso: {progress + mission.readyCount}/{mission.total} señales
              colocadas
            </p>

            <article className="mnx-radar-evidence-card">
              <div className="mnx-radar-evidence-title">
                <FiClipboard />

                <strong>
                  Evidencia guardada
                </strong>
              </div>

              <p>
                Tus posiciones y explicación se
                registran automáticamente.
              </p>

              <div className="mnx-radar-info-row">
                <FiInfo />

                <p>
                  Podrás revisar tus aciertos y
                  errores en Retroalimentación.
                </p>
              </div>
            </article>
          </section>
        </section>
      <CierreDeMision onFinish={comprobar} busy={guardandoProgreso}/></section>

      <FloatingByteRadar />

      <button
        className="mnx-radar-logout-float"
        type="button"
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
      >
        <FiLogOut />
      </button>

      {resultModalOpen && (
        <ResultModal
          reviewItems={[...(["-4","-2","3","5"].map((id,i)=>({id:`native-${i}`,title:`Señal ${id}`,answer:placements[id]||"",correct:placements[id]===id,hint:`Ubica la señal ${id}: los negativos están a la izquierda de cero y los positivos a la derecha.`,target:".mnx-radar-placement-card"}))),...mission.items]}
          onCorrect={(item)=>{setResultModalOpen(false);mission.beginCorrection(item);}}
          summary={mission.result ?? undefined}
          kind={resultModalKind}
          nextRoute={ascensorRoute}
          retryRoute={radarRoute}
          onClose={() =>
            setResultModalOpen(false)
          }
          onRetry={repetirActividad}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}

function NumberAxis({
  variant,
}: {
  variant: "guide" | "work";
}) {
  return (
    <div
      className={`mnx-radar-axis mnx-radar-axis-${variant}`}
    >
      <span className="mnx-radar-axis-arrow left" />
      <span className="mnx-radar-axis-line" />
      <span className="mnx-radar-axis-arrow right" />

      <div className="mnx-radar-ticks">
        {numberLine.map((number) => (
          <span
            key={number}
            className={
              number === 0
                ? "zero"
                : ""
            }
            data-value={number}
          />
        ))}
      </div>
    </div>
  );
}