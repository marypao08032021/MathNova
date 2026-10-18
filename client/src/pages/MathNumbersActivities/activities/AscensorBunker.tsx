import useMathNumbersEvidence from "../../../hooks/useMathNumbersEvidence";
import PilotEvidenceStatus from "../../../components/PilotEvidenceStatus";
import CierreDeMision from "../../../components/CierreDeMision";
import useMissionExpansion from "../../../hooks/useMissionExpansion";
import EnsayoDeMision from "../../../components/EnsayoDeMision";
import RetosDeMision from "../../../components/RetosDeMision";
import CabeceraCurricular from "../../../components/CabeceraCurricular";
import { activityCurriculum } from "../../../curriculum/activityCurriculum";
import "../../../styles/activityExperience.css";
import "./AscensorBunker.css";
import audioIntroSumaAscensor from "../../../assets/mathnumbers/03-ascensor-bunker/intro_suma_ascensor.mp3";
import audioConsejoSumaAscensor from "../../../assets/mathnumbers/03-ascensor-bunker/consejo_suma_ascensor.mp3";
import audioPistaByteAscensor from "../../../assets/mathnumbers/03-ascensor-bunker/pista_byte_ascensor.mp3";
import bytePista from "../../../assets/mathnumbers/byte_pista.png";
import videoByteAscensor from "../../../assets/mathnumbers/03-ascensor-bunker/byte_hablando_ascensor.mp4";
import ascensorAnimado from "../../../assets/mathnumbers/03-ascensor-bunker/ascensor.webp";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowRight,
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

/*
 * Ruta de esta actividad.
 *
 * Se utiliza para que el botón "Repetir actividad"
 * vuelva correctamente al Ascensor del Búnker.
 */
const ascensorRoute =
  "/actividades/mathnumbers/ascensor-bunker";

/*
 * Ruta de la siguiente actividad.
 *
 * Se utiliza para que el botón "Siguiente actividad"
 * abra Escuadrón Táctico.
 */
const escuadronTacticoRoute =
  "/actividades/mathnumbers/escuadron-tactico";

/*
 * Orden correcto que valida la actividad.
 *
 * No lo cambies si solamente quieres modificar
 * los números de la guía visual.
 */
const correctOrder = [-5, -2, 0, 3, 6];

/*
 * Tarjetas que el estudiante debe ordenar.
 */
const floorCards = [3, -5, 0, 6, -2];

/*
 * Números independientes de la Guía visual rápida.
 *
 * Puedes cambiar solamente estos números y no se
 * modificará la respuesta correcta ni el funcionamiento
 * de la actividad.
 *
 * Ejemplo:
 *
 * const guideNumbers = [-8, -3, 0, 4, 9];
 */
const guideNumbers = [-8, -3, 0, 4, 9];

const emptySlots: (number | null)[] = [
  null,
  null,
  null,
  null,
  null,
];

type AudioStatus = "idle" | "playing" | "paused" | "ended";

const SUMA_ASCENSOR_VISIBLE_TEXT =
  "Ordena las cinco tarjetas desde el número más pequeño hasta el más grande y colócalas en los espacios del ascensor.";

const BYTE_ASCENSOR_TEXT =
  "Comienza buscando el número más pequeño. Los negativos van antes que el cero y, entre dos negativos, el que está más lejos del cero es el menor. Después coloca el cero y continúa con los positivos de menor a mayor.";

function AscensorSumaIntro() {
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
      console.error("No se pudo reproducir la voz de Suma en Ascensor:", error);
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
      console.error("No se pudo reiniciar la voz de Suma en Ascensor:", error);
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
    <div className="mnx-ascensor-welcome-wrap">
      <article className="mnx-ascensor-speech">
        <strong>¡Sistema en espera!</strong>
        <span>{SUMA_ASCENSOR_VISIBLE_TEXT}</span>

        <audio
          ref={audioRef}
          src={audioIntroSumaAscensor}
          preload="metadata"
          onPlay={() => setStatus("playing")}
          onPause={() => {
            if (!audioRef.current?.ended) {
              setStatus("paused");
            }
          }}
          onEnded={() => setStatus("ended")}
        />

        <div className="mnx-ascensor-suma-audio">
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
        key={status === "playing" ? "suma-ascensor-talking" : "suma-ascensor-idle"}
        className="mnx-ascensor-hero-robot"
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


const SUMA_ASCENSOR_ADVICE_TEXT =
  "¡Vamos paso a paso, explorador! Para ordenar los pisos, comienza con el número más pequeño. Los números negativos van antes del cero y, entre ellos, el que está más lejos del cero es menor. Después coloca el cero y continúa con los números positivos de menor a mayor. Revisa toda la secuencia antes de comprobar. ¡El ascensor está en tus manos!";

function AscensorSumaAdvice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.ended) audio.currentTime = 0;

    try {
      await audio.play();
      setStatus("playing");
    } catch (error) {
      setStatus("paused");
      console.error("No se pudo reproducir el consejo de Suma en Ascensor:", error);
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
      console.error("No se pudo repetir el consejo de Suma en Ascensor:", error);
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
    <section className="mnx-ascensor-reminder-card mnx-ascensor-reminder mnx-ascensor-suma-advice">
      <img
        key={status === "playing" ? "suma-ascensor-advice-talking" : "suma-ascensor-advice-idle"}
        src={status === "playing" ? cofreHeroTalking : cofreGuide}
        alt="Comandante Suma dando un consejo"
        draggable={false}
      />

      <div className="mnx-ascensor-suma-advice-copy">
        <span className="mnx-ascensor-suma-advice-label">Consejo de Suma</span>
        <h3>Ordena desde el menor</h3>
        <p>{status === "idle" ? "Presiona reproducir para escuchar el consejo de Suma." : SUMA_ASCENSOR_ADVICE_TEXT}</p>

        <audio
          ref={audioRef}
          src={audioConsejoSumaAscensor}
          preload="metadata"
          onPlay={() => setStatus("playing")}
          onPause={() => {
            if (!audioRef.current?.ended) {
              setStatus("paused");
            }
          }}
          onEnded={() => setStatus("ended")}
        />

        <div className="mnx-ascensor-suma-audio mnx-ascensor-suma-advice-audio">
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

function limpiarFondoByteAscensor(
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

function dibujarByteAscensor(
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

function ByteAscensorMedia({ active }: { active: boolean }) {
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
      dibujarByteAscensor(ctx, video, canvasWidth, canvasHeight);
      limpiarFondoByteAscensor(ctx, canvasWidth, canvasHeight);
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
        console.error("No se pudo reproducir la animación de Byte en Ascensor:", error);
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
        src={videoByteAscensor}
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
          className="mnx-ascensor-byte-character"
          src={bytePista}
          alt="Byte"
          draggable={false}
        />
      )}

      <canvas
        ref={canvasRef}
        className="mnx-ascensor-byte-character"
        role="img"
        aria-label="Byte hablando y ofreciendo una pista"
        style={{ display: videoReady ? "block" : "none" }}
      />
    </>
  );
}

function FloatingByteAscensor() {
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
      console.error("No se pudo reproducir automáticamente la pista de Byte en Ascensor:", error);
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
      console.error("No se pudo reproducir la pista de Byte en Ascensor:", error);
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
      console.error("No se pudo repetir la pista de Byte en Ascensor:", error);
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
    <div className={`mnx-ascensor-byte-float ${open ? "mnx-ascensor-byte-float-open" : ""}`}>
      <audio
        ref={audioRef}
        src={audioPistaByteAscensor}
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
        <article className="mnx-ascensor-byte-panel">
          <button
            type="button"
            className="mnx-ascensor-byte-close"
            onClick={closeHint}
            aria-label="Cerrar pista de Byte"
          >
            <FiX />
          </button>

          <div className="mnx-ascensor-byte-media">
            <ByteAscensorMedia active={status === "playing"} />
          </div>

          <div className="mnx-ascensor-byte-copy">
            <span className="mnx-ascensor-byte-label">Pista de Byte</span>
            <h3>Comienza por el menor</h3>
            <p>{BYTE_ASCENSOR_TEXT}</p>

            <div className="mnx-ascensor-byte-audio">
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
        className="mnx-ascensor-byte-launcher"
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

export function AscensorBunker() {
  const mission = useMissionExpansion("mathnumbers-ascensor-bunker");
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    selectedFloor,
    setSelectedFloor,
  ] = useState<number | null>(null);

  const [slots, setSlots] =
    useState<(number | null)[]>(emptySlots);

  const [explanation, setExplanation] =
    useState("");

  const [attempts, setAttempts] =
    useState(0);

  const [guardandoProgreso, setGuardandoProgreso] =
    useState(false);

  const inicioActividadRef =
    useRef<number>(Date.now());

  const resultadoTimerRef =
    useRef<number | null>(null);

  /*
   * Controla la ventana modal de actividad completada.
   */
  const [
    resultModalOpen,
    setResultModalOpen,
  ] = useState(false);

  const [resultModalKind, setResultModalKind] =
    useState<ResultKind>("completed");

  const progress = slots.filter(
    (slot) => slot !== null,
  ).length;

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
      if (resultadoTimerRef.current !== null) {
        window.clearTimeout(resultadoTimerRef.current);
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

  const placeFloor = (
    index: number,
    value: number,
  ) => {
    setSlots((current) => {
      if(mission.correctOnly && (current[index]===correctOrder[index] || current.some((floor,i)=>floor===correctOrder[i] && floor===value)))return current;
      const next = current.map((slot) =>
        slot === value ? null : slot,
      );

      next[index] = value;

      return next;
    });

    setSelectedFloor(value);
  };

  const dragFloor = (
    event: DragEvent<HTMLButtonElement>,
    value: number,
  ) => {
    event.dataTransfer.setData(
      "text/plain",
      String(value),
    );
  };

  const dropFloor = (
    event: DragEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.preventDefault();

    const value = Number(
      event.dataTransfer.getData("text/plain"),
    );

    if (!Number.isNaN(value)) {
      placeFloor(index, value);
    }
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

  /*
   * Cierra el modal y reinicia completamente
   * el Ascensor del Búnker.
   */
  const repetirActividad = () => {
    mission.reset();
    pilotEvidence.resetSession();
    if (resultadoTimerRef.current !== null) {
      window.clearTimeout(resultadoTimerRef.current);
      resultadoTimerRef.current = null;
    }

    setResultModalOpen(false);
    setSelectedFloor(null);
    setSlots([...emptySlots]);
    setExplanation("");
    setAttempts(0);
    setGuardandoProgreso(false);

    inicioActividadRef.current = Date.now();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast(
      "Ascensor reiniciado. ¡Ordena los pisos nuevamente!",
    );
  };

  const pilotEvidence = useMathNumbersEvidence("mathnumbers-ascensor-bunker", mission, () => ({
            orden_usuario: slots,
            explicacion_texto: explanation.trim(),
          }));

  const verificar = async () => {
    if (!mission.ready) {
      showToast("Completa los códigos que faltan en los nuevos retos de la misión.", true);
      document.querySelector(`[data-mission="mathnumbers-ascensor-bunker"]`)?.scrollIntoView({behavior:"smooth",block:"center"});
      return;
    }

    if (guardandoProgreso) {
      return;
    }

    if (progress < 5) {
      showToast(
        "Coloca las cinco tarjetas en el ascensor.",
        true,
      );
      return;
    }

    const pilotSnapshot = pilotEvidence.reviewForClose();
    const total = correctOrder.filter(
      (value, index) => slots[index] === value,
    ).length + mission.correctCount;

    const esCorrecto = total === mission.total;

    const tiempoSegundos = Math.max(
      1,
      Math.floor(
        (Date.now() - inicioActividadRef.current) / 1000,
      ),
    );

    setAttempts((intentosActuales) =>
      Math.min(intentosActuales + 1, 3),
    );

    setGuardandoProgreso(true);

    try {
      const resultado =
        await guardarProgresoUsuarioActual({
          mundo: "MathNumbers",
          tema: "Tema 2: Positivos y negativos",
          actividad_codigo:
            "mathnumbers-ascensor-bunker",
          actividad_titulo:
            "El Ascensor del Búnker",
          respuestas: pilotSnapshot,
          aciertos: total,
          total_preguntas: mission.total,
          tiempo_segundos: tiempoSegundos,
          xp_base: 50,
          completada: esCorrecto,
        });
      mission.recordResult({correct:total,seconds:tiempoSegundos,xp:Number(resultado.progreso.xp_obtenido ?? 0)});

      inicioActividadRef.current = Date.now();

      const progresoGuardado = resultado.progreso;
      const estrellasGuardadas = Number(
        progresoGuardado.estrellas_obtenidas ?? 0,
      );
      const numeroIntentos = Number(
        progresoGuardado.intentos ?? 1,
      );

      console.log(
        "Progreso del Ascensor guardado:",
        progresoGuardado,
      );

      if (resultadoTimerRef.current !== null) {
        window.clearTimeout(resultadoTimerRef.current);
      }

      if (esCorrecto) {
        showToast(
          numeroIntentos > 1
            ? `¡Increíble! Volviste a restablecer el ascensor. Tu mejor resultado conserva ${estrellasGuardadas} ⭐.`
            : `¡Ruta correcta! Ascensor restablecido. ¡Has ganado ${estrellasGuardadas} estrellas! ⭐`,
        );

        resultadoTimerRef.current = window.setTimeout(() => {
          setResultModalKind("completed");
          setResultModalOpen(true);
          resultadoTimerRef.current = null;
        }, 1200);

        return;
      }

      showToast(
        total >= 3
          ? "Vas cerca: revisa la posición de algunos pisos."
          : "El orden no es correcto. Inténtalo de nuevo.",
        true,
      );

      resultadoTimerRef.current = window.setTimeout(() => {
        setResultModalKind(
          total >= 3 ? "almost" : "retry",
        );
        setResultModalOpen(true);
        resultadoTimerRef.current = null;
      }, 900);
    } catch (error) {
      console.error(
        "No se pudo guardar el progreso del Ascensor:",
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
    <main className="mnx-ascensor-page mn-activity">
      <button
        type="button"
        className={`mnx-ascensor-hamburger ${
          menuOpen
            ? "mnx-ascensor-hamburger-open"
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
          className="mnx-ascensor-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`mnx-ascensor-sidebar ${
          menuOpen
            ? "mnx-ascensor-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="mnx-ascensor-sidebar-logo"
        />

        <nav className="mnx-ascensor-sidebar-menu">
          <button
            className="mnx-ascensor-menu-item"
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
            className="mnx-ascensor-menu-item mnx-ascensor-menu-active"
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
            className="mnx-ascensor-menu-item"
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
            className="mnx-ascensor-menu-item"
            type="button"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />

            <span>
              Recompensas
            </span>
          </button>

          <button
            className="mnx-ascensor-menu-item"
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
            className="mnx-ascensor-menu-item"
            type="button"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />

            <span>
              Estadísticas
            </span>
          </button>
        </nav>

        <div className="mnx-ascensor-sidebar-fox-box">
          <img
            src={zorritoConsejo}
            alt="Zorrito consejo MathNova"
            className="mnx-ascensor-sidebar-fox"
          />
        </div>
      </aside>

      <section className="mnx-ascensor-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathnumbers-ascensor-bunker"]} />

        <div className="mnx-ascensor-top-actions">
          <button
            type="button"
            className="mnx-ascensor-ghost-btn"
            onClick={() =>
              showToast(
                "Ayuda: arrastra o selecciona cada tarjeta y colócala en el piso correcto, de menor a mayor.",
              )
            }
          >
            <FiHelpCircle />
            Ayuda
          </button>

          <button
            type="button"
            className="mnx-ascensor-ghost-btn mnx-ascensor-wide"
            onClick={() =>
              irARuta(activityListRoute)
            }
          >
            <span>←</span>
            Salir de la actividad
          </button>
        </div>

        <header className="mnx-ascensor-header">
          <div className="mnx-ascensor-header-copy">
            <div className="mnx-ascensor-crumb">
              <strong>
                MathNumbers
              </strong>

              <span>/</span>

              <span>
                Tema 2: Positivos y negativos
              </span>
            </div>

            <div className="mnx-ascensor-title-row">
              <span
                className="mnx-ascensor-title-icon"
                aria-hidden="true"
              >
                <FiTarget />
              </span>

              <h1>
                El Ascensor del Búnker
              </h1>
            </div>

            <p>
              Ordena números positivos y negativos
              de menor a mayor para restablecer la
              ruta del ascensor.
              <br />
              Cada piso bien ubicado acerca al
              ascensor a la superficie.
            </p>
          </div>

          <AscensorSumaIntro />
        </header>

        <EnsayoDeMision activityId="mathnumbers-ascensor-bunker" />
          <section className="mnx-ascensor-activity-grid">
          <article className="mnx-ascensor-art">
            <div className="mnx-ascensor-visual">
              <img
                className="mnx-ascensor-visual-image"
                src={ascensorAnimado}
                alt="Ascensor del Búnker en funcionamiento"
                draggable={false}
              />

              <span
                className="mnx-ascensor-status-light mnx-ascensor-status-light-one"
                aria-hidden="true"
              />

              <span
                className="mnx-ascensor-status-light mnx-ascensor-status-light-two"
                aria-hidden="true"
              />
            </div>

            <div className="mnx-ascensor-mission">
              <FiTarget />

              <div>
                <strong>
                  Tu misión
                </strong>

                <p>
                  Ordena las tarjetas de números
                  de menor a mayor para restablecer
                  la ruta del ascensor.
                </p>
              </div>
            </div>
          </article>

          <section className="mnx-ascensor-guide-card">
            <div className="mnx-ascensor-card-title">
              <span>
                <FiHelpCircle />
              </span>

              <strong>
                Guía visual rápida
              </strong>
            </div>

            <div className="mnx-ascensor-guide-labels">
              <span className="negative">
                Los sótanos son negativos
              </span>

              <span className="zero">
                El nivel del suelo es 0
              </span>

              <span className="positive">
                Las torres son positivas
              </span>
            </div>

            <div className="mnx-ascensor-guide-chips">
              {guideNumbers.map(
                (value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className="mnx-ascensor-chip-wrap"
                  >
                    <span
                      className={`mnx-ascensor-chip ${
                        value < 0
                          ? "negative"
                          : value > 0
                            ? "positive"
                            : "zero"
                      }`}
                    >
                      {formatSigned(value)}
                    </span>

                    {index <
                      guideNumbers.length - 1 && (
                      <span className="mnx-ascensor-chip-arrow">
                        →
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </section>
<section className="mnx-ascensor-placement-card">
            <div className="mnx-ascensor-question-head">
              <span>1</span>

              <h2>
                Arrastra o selecciona cada tarjeta
                y colócala en su piso.
              </h2>
            </div>

            <div className="mnx-ascensor-floor-cards">
              {floorCards.map((floor) => (
                <button
                  key={floor}
                  type="button"
                  draggable
                  className={`mnx-ascensor-floor-card ${
                    floor < 0
                      ? "negative"
                      : floor > 0
                        ? "positive"
                        : "zero"
                  } ${
                    selectedFloor === floor
                      ? "selected"
                      : ""
                  }`}
                  onDragStart={(event) =>
                    dragFloor(event, floor)
                  }
                  onClick={() =>
                    setSelectedFloor(floor)
                  }
                >
                  {formatSigned(floor)}
                </button>
              ))}
            </div>

            <div className="mnx-ascensor-drop-zone">
              <span className="mnx-ascensor-order-label from">
                Menor
              </span>

              <div className="mnx-ascensor-slots">
                {slots.map((slot, index) => (
                  <div
                    key={`slot-${index}`}
                    className="mnx-ascensor-slot-wrap"
                  >
                    <button
                      type="button"
                      className={`mnx-ascensor-slot ${
                        slot !== null
                          ? "filled"
                          : ""
                      } ${
                        slot !== null &&
                        slot < 0
                          ? "negative"
                          : ""
                      }`}
                      onDragOver={(event) =>
                        event.preventDefault()
                      }
                      onDrop={(event) =>
                        dropFloor(
                          event,
                          index,
                        )
                      }
                      onClick={() =>
                        selectedFloor !== null &&
                        placeFloor(
                          index,
                          selectedFloor,
                        )
                      }
                    >
                      {slot !== null ? (
                        formatSigned(slot)
                      ) : (
                        <FiArrowRight />
                      )}
                    </button>

                    <span className="mnx-ascensor-slot-label">
                      Piso {index + 1}
                    </span>
                  </div>
                ))}
              </div>

              <span className="mnx-ascensor-order-label to">
                Mayor
              </span>
            </div>
          <PilotEvidenceStatus pilot={pilotEvidence} />
            <RetosDeMision expansion={mission} disabled={guardandoProgreso} />
            </section>

          <AscensorSumaAdvice />

          
<section className="mnx-ascensor-question-card mnx-ascensor-question">
            <div className="mnx-ascensor-question-head">
              <span>2</span>

              <h2>
                ¿Por qué este es el orden correcto?
              </h2>
            </div>

            <label className="mnx-ascensor-answer-box">
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
              className="mnx-ascensor-save-btn"
              onClick={guardarExplicacion}
            >
              <FiSave />
              Guardar explicación
            </button>
          </section>

          <section className="mnx-ascensor-actions">
            

            <p className="mnx-ascensor-progress">
              Progreso: {progress + mission.readyCount}/{mission.total} pisos colocados · Intentos: {attempts}/3
            </p>

            <article className="mnx-ascensor-evidence-card">
              <div className="mnx-ascensor-evidence-title">
                <FiClipboard />

                <strong>
                  Evidencia guardada
                </strong>
              </div>

              <p>
                Tu orden, intentos y progreso se
                guardan automáticamente.
              </p>

              <div className="mnx-ascensor-info-row">
                <FiInfo />

                <p>
                  Podrás revisar tus resultados
                  en Retroalimentación.
                </p>
              </div>
            </article>
          </section>
        </section>
      <CierreDeMision onFinish={verificar} busy={guardandoProgreso}/></section>

      <FloatingByteAscensor />

      <button
        className="mnx-ascensor-logout-float"
        type="button"
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
      >
        <FiLogOut />
      </button>

      {resultModalOpen && (
        <ResultModal
          reviewItems={[...([-5,-2,0,3,6].map((value,i)=>({id:`native-${i}`,title:`Posición ${i+1} del ascensor`,answer:String(slots[i]??""),correct:slots[i]===value,hint:"Ordena de menor a mayor: primero los niveles más bajos, después cero y finalmente los positivos.",target:".mnx-ascensor-activity-grid"}))),...mission.items]}
          onCorrect={(item)=>{setResultModalOpen(false);mission.beginCorrection(item);}}
          summary={mission.result ?? undefined}
          kind={resultModalKind}
          nextRoute={escuadronTacticoRoute}
          retryRoute={ascensorRoute}
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