import useMathDataEvidence from "../../hooks/useMathDataEvidence";
import PilotEvidenceStatus from "../../components/PilotEvidenceStatus";
import AudioRetroalimentacion from "../../components/AudioRetroalimentacion";
import CierreDeMision from "../../components/CierreDeMision";
import useMissionExpansion from "../../hooks/useMissionExpansion";
import EnsayoOtrosMundos from "../../components/EnsayoOtrosMundos";
import RetosDeMision from "../../components/RetosDeMision";
import DetalleErroresDeMision, {type MissionReviewItem} from "../../components/DetalleErroresDeMision";
import AvisoActividad from "../../components/AvisoActividad";
import CabeceraCurricular from "../../components/CabeceraCurricular";
import { activityCurriculum } from "../../curriculum/activityCurriculum";
import "../../styles/activityExperience.css";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/authSession";

import logo from "../../assets/logo_MathNova.png";
import "./SensorFrecuencias.css";

/* ---- Reutilizadas de las actividades anteriores ---- */
import baitSaludoImg from "../../assets/bait-saludo.png";
import baitPistaImg from "../../assets/bait-pista.png";
import villanoTrofeoCompleto from "../../assets/villano-trofeo-completo.png";
import villanoIntentar from "../../assets/villano-vintentar.png";
import iconoAciertos from "../../assets/icono-aciertos.png";
import iconoTiempo from "../../assets/icono-tiempo.png";
import iconoPrecision from "../../assets/icono-precision.png";
import iconoRecompensa from "../../assets/icono-recompensa.png";
import iconoInsignia from "../../assets/icono-insignia.png";
import baitHablandoVideo from "../../assets/bait-hablando.mp4";

/* ---- Nueva para la Actividad 5 ---- */
import fondoSensorImg from "../../assets/fondo-sensor-frecuencias.png";

/* ---- Audios ---- */
import introBaitAudioSensor from "../../assets/sensor-intro-audio.mp3";
import pistaBaitAudioSensor from "../../assets/sensor-pista-audio.mp3";
import baitAudioActividadCompletada from "../../assets/sensor-actividad-completada.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/sensor-vuelve-a-intentarlo.mp3";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowLeft,
  FiHelpCircle,
  FiVolume2,
  FiTarget,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiRefreshCw,
  FiArrowRight,
  FiPercent,
  FiInfo,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
  FiRadio,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   CONFIGURACIÓN DEL BACKEND
========================================================= */

const API_URL_BASE =
  (
    import.meta.env.VITE_API_URL as
      | string
      | undefined
  )?.replace(/\/+$/, "") ||
  "/api";

const API_URL =
  API_URL_BASE.endsWith("/api")
    ? API_URL_BASE
    : `${API_URL_BASE}/api`;

/* =========================================================
   DATOS DE LA MISIÓN
========================================================= */

type UsuarioSesionSensor = {
  id_usuario?: number | string;
  idUsuario?: number | string;
  usuario_id?: number | string;
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  usuario?: UsuarioSesionSensor;
  user?: UsuarioSesionSensor;
  data?: UsuarioSesionSensor;
  session?: UsuarioSesionSensor;
};

const extraerIdUsuarioSensor = (
  valor: unknown,
): number => {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return 0;
  }

  const usuario =
    valor as UsuarioSesionSensor;

  const idDirecto = Number(
    usuario.id_usuario ??
      usuario.idUsuario ??
      usuario.usuario_id ??
      usuario.user_id ??
      usuario.userId ??
      usuario.id ??
      0,
  );

  if (
    Number.isInteger(idDirecto) &&
    idDirecto > 0
  ) {
    return idDirecto;
  }

  for (const anidado of [
    usuario.usuario,
    usuario.user,
    usuario.data,
    usuario.session,
  ]) {
    const idAnidado =
      extraerIdUsuarioSensor(
        anidado,
      );

    if (idAnidado > 0) {
      return idAnidado;
    }
  }

  return 0;
};

const obtenerIdEstudianteActual = (): number => {
  const candidatos: unknown[] = [
    getSessionUser(),
  ];

  for (const clave of [
    "auth_session",
    "usuario",
    "user",
    "session_user",
    "sessionUser",
    "mathnova_user",
    "authUser",
  ]) {
    try {
      const valor =
        localStorage.getItem(clave) ||
        sessionStorage.getItem(clave);

      if (valor) {
        candidatos.push(
          JSON.parse(valor),
        );
      }
    } catch (error) {
      console.warn(
        `No se pudo leer la sesión "${clave}":`,
        error,
      );
    }
  }

  for (const candidato of candidatos) {
    const idUsuario =
      extraerIdUsuarioSensor(
        candidato,
      );

    if (idUsuario > 0) {
      return idUsuario;
    }
  }

  return 0;
};

const formatearTiempoSensor = (
  segundos: number,
): string => {
  const minutos = Math.floor(
    segundos / 60,
  );

  const segundosRestantes =
    segundos % 60;

  return `${String(minutos).padStart(
    2,
    "0",
  )}:${String(
    segundosRestantes,
  ).padStart(2, "0")}`;
};

type Senal = "alfa" | "beta" | "gamma" | "delta";

const FRECUENCIAS: Record<Senal, number> = {
  alfa: 5,
  beta: 8,
  gamma: 4,
  delta: 3,
};

const TOTAL_SENALES = 20;

const PORCENTAJES_CORRECTOS: Record<Senal, string> = {
  alfa: "25",
  beta: "40",
  gamma: "20",
  delta: "15",
};

const NOMBRE_SENAL: Record<Senal, string> = {
  alfa: "Señal Alfa",
  beta: "Señal Beta",
  gamma: "Señal Gamma",
  delta: "Señal Delta",
};

const ZONA_SENAL: Record<Senal, string> = {
  alfa: "Zona Norte",
  beta: "Zona Sur",
  gamma: "Zona Este",
  delta: "Zona Oeste",
};

const COLOR_SENAL: Record<Senal, string> = {
  alfa: "#16a34a",
  beta: "#dc2626",
  gamma: "#2563eb",
  delta: "#f97316",
};

type Zona = "norte" | "sur" | "este" | "oeste";
const NOMBRE_ZONA: Record<Zona, string> = {
  norte: "Zona Norte",
  sur: "Zona Sur",
  este: "Zona Este",
  oeste: "Zona Oeste",
};

function palitos(n: number) {
  // grupos de 4 líneas + una diagonal representando 5
  const grupos = Math.floor(n / 5);
  const resto = n % 5;
  return "IIII\u0338 ".repeat(grupos) + "I".repeat(resto);
}

/* Posiciones fijas (no aleatorias) de los puntos del radar,
   repartidos por cuadrante según la señal/zona que representan. */
const PUNTOS_RADAR: { x: number; y: number; senal: Senal }[] = [
  // Alfa (Norte) — 5 puntos, cuadrante superior
  { x: 46, y: 16, senal: "alfa" }, { x: 58, y: 20, senal: "alfa" },
  { x: 40, y: 24, senal: "alfa" }, { x: 52, y: 12, senal: "alfa" },
  { x: 62, y: 28, senal: "alfa" },
  // Beta (Sur) — 8 puntos, cuadrante inferior (el más denso)
  { x: 44, y: 70, senal: "beta" }, { x: 52, y: 76, senal: "beta" },
  { x: 38, y: 66, senal: "beta" }, { x: 60, y: 72, senal: "beta" },
  { x: 34, y: 74, senal: "beta" }, { x: 48, y: 82, senal: "beta" },
  { x: 56, y: 66, senal: "beta" }, { x: 42, y: 78, senal: "beta" },
  // Gamma (Este) — 4 puntos, cuadrante derecho
  { x: 78, y: 44, senal: "gamma" }, { x: 84, y: 52, senal: "gamma" },
  { x: 74, y: 38, senal: "gamma" }, { x: 88, y: 46, senal: "gamma" },
  // Delta (Oeste) — 3 puntos, cuadrante izquierdo
  { x: 20, y: 44, senal: "delta" }, { x: 14, y: 52, senal: "delta" },
  { x: 24, y: 38, senal: "delta" },
];

/* =========================================================
   COMPONENTE: PISTA DE BAIT (modal con video real)
   Idéntico al de las actividades anteriores.
========================================================= */

type PistaBaitModalProps = {
  tema?: "azul" | "rojo";
  titulo?: string;
  contenido: string;
  videoSrc: string;
  audioSrc?: string;
  botonTexto?: string;
  onClose: () => void;
};

const SALTO_SEGUNDOS = 10;

function PistaBaitModal({
  tema = "azul",
  titulo = "Pista de Bait",
  contenido,
  videoSrc,
  audioSrc,
  botonTexto = "Cerrar y volver a la actividad",
  onClose,
}: PistaBaitModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const sincronizarVideoConAudio = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;
    if (Math.abs(video.currentTime - audio.currentTime) > 0.35) {
      video.currentTime = audio.currentTime;
    }
  };

  const alternarReproduccion = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;
    if (audio.paused || audio.ended) {
      audio.play();
      video?.play();
    } else {
      audio.pause();
      video?.pause();
    }
  };

  const saltar = (segundos: number) => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !audio.duration) return;
    const nuevoTiempo = Math.min(Math.max(audio.currentTime + segundos, 0), audio.duration);
    audio.currentTime = nuevoTiempo;
    if (video) video.currentTime = nuevoTiempo;
  };

  const actualizarProgreso = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgreso((audio.currentTime / audio.duration) * 100);
  };

  return createPortal(
    <div className="pb-overlay" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className={`pb-modal pb-modal-${tema}`}>
        <button type="button" className="pb-cerrar" onClick={onClose} aria-label="Cerrar">
          <FiX />
        </button>

        <div className="pb-video-wrap">
          <video
            ref={videoRef}
            src={videoSrc}
            className="pb-video"
            muted
            playsInline
            preload="auto"
            onTimeUpdate={sincronizarVideoConAudio}
            aria-hidden="true"
          />
        </div>

        <h3>{titulo}</h3>

        <p>{contenido}</p>

        <div className="pb-controles">
          <button
            type="button"
            className={`pb-btn-salto pb-btn-salto-${tema}`}
            onClick={() => saltar(-SALTO_SEGUNDOS)}
            aria-label={`Retroceder ${SALTO_SEGUNDOS} segundos`}
          >
            <FiRotateCcw /> {SALTO_SEGUNDOS}s
          </button>

          <button
            type="button"
            className={`pb-btn-play pb-btn-play-${tema}`}
            onClick={alternarReproduccion}
            aria-label={reproduciendo ? "Pausar" : "Reproducir"}
          >
            {reproduciendo ? <FiPause /> : <FiPlay />}
          </button>

          <button
            type="button"
            className={`pb-btn-salto pb-btn-salto-${tema}`}
            onClick={() => saltar(SALTO_SEGUNDOS)}
            aria-label={`Adelantar ${SALTO_SEGUNDOS} segundos`}
          >
            {SALTO_SEGUNDOS}s <FiRotateCw />
          </button>
        </div>

        <div className="pb-progress-track">
          <div className={`pb-progress-fill pb-progress-fill-${tema}`} style={{ width: `${progreso}%` }} />
        </div>

        {audioSrc && (
          <audio
            ref={audioRef}
            src={audioSrc}
            onPlay={() => setReproduciendo(true)}
            onPause={() => setReproduciendo(false)}
            onEnded={() => setReproduciendo(false)}
            onTimeUpdate={actualizarProgreso}
          />
        )}

        <button type="button" className={`pb-cerrar-btn pb-cerrar-btn-${tema}`} onClick={onClose}>
          {botonTexto}
        </button>
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   COMPONENTE: REPRODUCTOR DE AUDIO DEL RESULTADO
   Se reproduce solo apenas se monta, y muestra los
   controles normales de un reproductor de audio: retroceder
   10s, pausar/reproducir y adelantar 10s. Mismo patrón que
   las demás actividades.
========================================================= */

const RESULT_AUDIO_SALTO_SEGUNDOS = 10;

function ResultAudioPlayer({ src }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !src) {
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
  }, [src]);

  const alternarReproduccion = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused || audio.ended) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const saltar = (segundos: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.min(
      Math.max(audio.currentTime + segundos, 0),
      audio.duration,
    );
  };

  const actualizarProgreso = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgreso((audio.currentTime / audio.duration) * 100);
  };

  if (!src) return null;

  return (
    <div className="sen-modal-audio">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        autoPlay
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
        onEnded={() => setReproduciendo(false)}
        onTimeUpdate={actualizarProgreso}
      />

      <button
        type="button"
        className="sen-modal-audio-btn"
        onClick={() => saltar(-RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Retroceder 10 segundos"
      >
        <FiRotateCcw />
      </button>

      <button
        type="button"
        className="sen-modal-audio-btn sen-modal-audio-btn--play"
        onClick={alternarReproduccion}
        aria-label={reproduciendo ? "Pausar" : "Reproducir"}
      >
        {reproduciendo ? <FiPause /> : <FiPlay />}
      </button>

      <button
        type="button"
        className="sen-modal-audio-btn"
        onClick={() => saltar(RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Adelantar 10 segundos"
      >
        <FiRotateCw />
      </button>

      <div className="sen-modal-audio-progress">
        <div style={{ width: `${progreso}%` }} />
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function SensorFrecuencias() {
 const mission=useMissionExpansion("mathdata-sensor-frecuencias");
  const [avisoActividad, setAvisoActividad] = useState<string | null>(null);
  const navigate = useNavigate();

  const ID_ESTUDIANTE =
    obtenerIdEstudianteActual();

  const inicioActividadRef =
    useRef<number>(Date.now());

  const guardandoProgresoRef =
    useRef(false);

  const [frecAbsoluta, setFrecAbsoluta] = useState<Record<Senal, string>>({
    alfa: "",
    beta: "",
    gamma: "",
    delta: "",
  });
  const [absolutaEstados, setAbsolutaEstados] = useState<
    Record<Senal, "correcto" | "pendiente" | "incorrecto">
  >({ alfa: "pendiente", beta: "pendiente", gamma: "pendiente", delta: "pendiente" });
  const [absolutaBloqueada, setAbsolutaBloqueada] = useState<Record<Senal, boolean>>({
    alfa: false,
    beta: false,
    gamma: false,
    delta: false,
  });

  const [frecRelativa, setFrecRelativa] = useState<Record<Senal, string>>({
    alfa: "",
    beta: "",
    gamma: "",
    delta: "",
  });
  const [relativaEstados, setRelativaEstados] = useState<
    Record<Senal, "correcto" | "pendiente" | "incorrecto">
  >({ alfa: "pendiente", beta: "pendiente", gamma: "pendiente", delta: "pendiente" });
  const [relativaBloqueada, setRelativaBloqueada] = useState<Record<Senal, boolean>>({
    alfa: false,
    beta: false,
    gamma: false,
    delta: false,
  });

  const [preguntaMayorFrecuencia, setPreguntaMayorFrecuencia] = useState<Senal | null>(null);
  const [preguntaZona, setPreguntaZona] = useState<Zona | null>(null);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mensajePistaBait, setMensajePistaBait] = useState("");
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoAbsoluta, setCargandoAbsoluta] = useState(false);
  const [cargandoRelativa, setCargandoRelativa] = useState(false);
  const [cargandoZona, setCargandoZona] = useState(false);

  const [
    aciertosResultado,
    setAciertosResultado,
  ] = useState(0);

  const [
    tiempoResultado,
    setTiempoResultado,
  ] = useState(0);


  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
    const cargarProgreso = async () => {
      if (!ID_ESTUDIANTE) {
        console.warn(
          "No se encontró el estudiante autenticado para cargar Sensor de Frecuencias.",
        );
        setCargandoInicial(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/sensor/progreso/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          const progreso = data.data;
          const valoresAbs = (progreso.valores_absoluta || {}) as Record<string, number>;
          const intentosAbs = (progreso.intentos_absoluta || {}) as Record<string, number>;
          const valoresRel = (progreso.valores_relativa || {}) as Record<string, string>;
          const intentosRel = (progreso.intentos_relativa || {}) as Record<string, number>;

          (["alfa", "beta", "gamma", "delta"] as Senal[]).forEach((s) => {
            if (valoresAbs[s] !== undefined) {
              setFrecAbsoluta((prev) => ({ ...prev, [s]: String(valoresAbs[s]) }));
              setAbsolutaEstados((prev) => ({
                ...prev,
                [s]: valoresAbs[s] === FRECUENCIAS[s] ? "correcto" : "incorrecto",
              }));
              setAbsolutaBloqueada((prev) => ({
                ...prev,
                [s]: (intentosAbs[s] || 0) >= 3 && valoresAbs[s] !== FRECUENCIAS[s],
              }));
            }

            if (valoresRel[s] !== undefined) {
              setFrecRelativa((prev) => ({ ...prev, [s]: String(valoresRel[s]) }));
              setRelativaEstados((prev) => ({
                ...prev,
                [s]: valoresRel[s] === PORCENTAJES_CORRECTOS[s] ? "correcto" : "incorrecto",
              }));
              setRelativaBloqueada((prev) => ({
                ...prev,
                [s]: (intentosRel[s] || 0) >= 3 && valoresRel[s] !== PORCENTAJES_CORRECTOS[s],
              }));
            }
          });

          if (progreso.pregunta_senal_frecuente) {
            setPreguntaMayorFrecuencia(progreso.pregunta_senal_frecuente as Senal);
          }
          if (progreso.pregunta_zona_origen) {
            setPreguntaZona(progreso.pregunta_zona_origen as Zona);
          }

          if (progreso.completada) {
            const correcto =
              Boolean(
                progreso.resultado_correcto,
              );

            const senales =
              [
                "alfa",
                "beta",
                "gamma",
                "delta",
              ] as Senal[];

            const absolutasCorrectas =
              senales.every(
                (senal) =>
                  Number(
                    valoresAbs[senal],
                  ) ===
                  FRECUENCIAS[senal],
              );

            const relativasCorrectas =
              senales.every(
                (senal) =>
                  String(
                    valoresRel[senal] ??
                      "",
                  ).trim() ===
                  PORCENTAJES_CORRECTOS[
                    senal
                  ],
              );

            const aciertosGuardados =
              correcto
                ? 4
                : Number(
                    absolutasCorrectas,
                  ) +
                  Number(
                    relativasCorrectas,
                  ) +
                  Number(
                    progreso.pregunta_senal_frecuente ===
                      "beta",
                  ) +
                  Number(
                    progreso.pregunta_zona_origen ===
                      "sur",
                  );

            setAciertosResultado(
              aciertosGuardados,
            );

            setTiempoResultado(
              Number(
                progreso.tiempo_total ??
                  progreso.tiempo_segundos ??
                  0,
              ) || 0,
            );

            setResultado(null);
          }
        }
      } catch (error) {
        console.error("Error al cargar progreso:", error);
      } finally {
        setCargandoInicial(false);
      }
    };

    void cargarProgreso();
  }, [ID_ESTUDIANTE]);

  const absolutaEstado = (s: Senal) => absolutaEstados[s];
  const relativaEstado = (s: Senal) => relativaEstados[s];

  // ==========================================
  // VERIFICAR FRECUENCIA ABSOLUTA (celda por celda)
  // ==========================================

  const verificarAbsoluta = async () => {
    pilot.recordAll();
    if (
      cargandoAbsoluta ||
      cargandoZona
    ) {
      return;
    }

    if (!ID_ESTUDIANTE) {
      setAvisoActividad(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setCargandoAbsoluta(true);
    try {
      for (const s of Object.keys(FRECUENCIAS) as Senal[]) {
        if (absolutaBloqueada[s] || absolutaEstados[s] === "correcto" || frecAbsoluta[s].trim() === "") {
          continue;
        }

        const response = await fetch(`${API_URL}/sensor/validar-absoluta`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_estudiante: ID_ESTUDIANTE,
            senal: s,
            valor: Number(frecAbsoluta[s]),
          }),
        });
        const data = await response.json();

        if (data.success && data.data) {
          const r = data.data;

          if (r.mostrar_pista_bait) {
            setMensajePistaBait(r.mensaje);
            setMostrarPistaBait(true);
            fetch(`${API_URL}/sensor/pista-consultada`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: 4 }),
            }).catch((error) => console.error("Error al registrar consulta de pista:", error));
          }

          if (r.celda_completada && !r.correcto) {
            setFrecAbsoluta((prev) => ({ ...prev, [s]: String(r.respuesta_correcta) }));
            setAbsolutaEstados((prev) => ({ ...prev, [s]: "incorrecto" }));
            setAbsolutaBloqueada((prev) => ({ ...prev, [s]: true }));
          } else if (r.correcto) {
            setAbsolutaEstados((prev) => ({ ...prev, [s]: "correcto" }));
          } else {
            setAbsolutaEstados((prev) => ({ ...prev, [s]: "incorrecto" }));
          }
        }
      }
    } catch (error) {
      console.error("Error al verificar frecuencias absolutas:", error);
    } finally {
      setCargandoAbsoluta(false);
    }
  };

  // ==========================================
  // VERIFICAR FRECUENCIA RELATIVA (celda por celda)
  // ==========================================

  const verificarRelativa = async () => {
    pilot.recordAll();
    if (
      cargandoRelativa ||
      cargandoZona
    ) {
      return;
    }

    if (!ID_ESTUDIANTE) {
      setAvisoActividad(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setCargandoRelativa(true);
    try {
      for (const s of Object.keys(PORCENTAJES_CORRECTOS) as Senal[]) {
        if (relativaBloqueada[s] || relativaEstados[s] === "correcto" || frecRelativa[s].trim() === "") {
          continue;
        }

        const response = await fetch(`${API_URL}/sensor/validar-relativa`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_estudiante: ID_ESTUDIANTE,
            senal: s,
            valorTexto: frecRelativa[s],
          }),
        });
        const data = await response.json();

        if (data.success && data.data) {
          const r = data.data;

          if (r.mostrar_pista_bait) {
            setMensajePistaBait(r.mensaje);
            setMostrarPistaBait(true);
            fetch(`${API_URL}/sensor/pista-consultada`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: 6 }),
            }).catch((error) => console.error("Error al registrar consulta de pista:", error));
          }

          if (r.celda_completada && !r.correcto) {
            setFrecRelativa((prev) => ({ ...prev, [s]: String(r.respuesta_correcta) }));
            setRelativaEstados((prev) => ({ ...prev, [s]: "incorrecto" }));
            setRelativaBloqueada((prev) => ({ ...prev, [s]: true }));
          } else if (r.correcto) {
            setRelativaEstados((prev) => ({ ...prev, [s]: "correcto" }));
          } else {
            setRelativaEstados((prev) => ({ ...prev, [s]: "incorrecto" }));
          }
        }
      }
    } catch (error) {
      console.error("Error al verificar frecuencias relativas:", error);
    } finally {
      setCargandoRelativa(false);
    }
  };

  // ==========================================
  // CALCULAR ZONA DE ORIGEN (paso final)
  // ==========================================

  const pilot=useMathDataEvidence("mathdata-sensor-frecuencias",mission,()=>({frecuencias_absolutas:frecAbsoluta,frecuencias_relativas:frecRelativa,senal_mayor_frecuencia:preguntaMayorFrecuencia,zona_origen:preguntaZona}));
  useEffect(()=>{const attempt=pilot.receipt?.intento_piloto;if(!attempt)return;
    setResultado(attempt.evaluacion.completada?"exito":"fallo");
    setAciertosResultado(attempt.evaluacion.aciertos);setTiempoResultado(attempt.tiempo_segundos);
  },[pilot.receipt]);

  const calcularZonaOrigen = async () => {
    if(pilot.busy)return;
    setCargandoZona(true);
    try {await pilot.finish(Math.max(1,Math.floor((Date.now()-inicioActividadRef.current)/1000)),50);}
    catch(error){setAvisoActividad(error instanceof Error?error.message:"No se pudo guardar; conserva esta pestaña.");}
    finally{setCargandoZona(false);}
  };

  // ==========================================
  // REINICIAR ACTIVIDAD
  // ==========================================

  const handleReiniciarActividad = async () => {
 mission.reset();
 pilot.resetSession();
    if (ID_ESTUDIANTE) {
      try {
        await fetch(`${API_URL}/sensor/reiniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE }),
        });
      } catch (error) {
        console.error("Error al reiniciar actividad:", error);
      }
    }

    setFrecAbsoluta({ alfa: "", beta: "", gamma: "", delta: "" });
    setAbsolutaEstados({ alfa: "pendiente", beta: "pendiente", gamma: "pendiente", delta: "pendiente" });
    setAbsolutaBloqueada({ alfa: false, beta: false, gamma: false, delta: false });
    setFrecRelativa({ alfa: "", beta: "", gamma: "", delta: "" });
    setRelativaEstados({ alfa: "pendiente", beta: "pendiente", gamma: "pendiente", delta: "pendiente" });
    setRelativaBloqueada({ alfa: false, beta: false, gamma: false, delta: false });
    setPreguntaMayorFrecuencia(null);
    setPreguntaZona(null);
    setResultado(null);
    setAciertosResultado(0);
    setTiempoResultado(0);

    guardandoProgresoRef.current =
      false;

    inicioActividadRef.current =
      Date.now();
  };

  const precisionResultado =
    Math.round(
      (
        aciertosResultado / mission.total
      ) * 100,
    );

  // ==========================================
  // PANTALLA DE CARGA INICIAL (evita mostrar el
  // tablero antes de saber si ya estaba completada)
  // ==========================================

  if (cargandoInicial) {
    return (
      <div className="sen-loading-screen">
        <img src={logo} alt="MathNova" className="sen-loading-logo" />
        <p>Cargando actividad...</p>
      </div>
    );
  }

  // ==========================================
  // VENTANA EMERGENTE: ACTIVIDAD COMPLETADA
  // ==========================================

  
 const missionNativeItems:MissionReviewItem[]=[{id:"absolutas",title:"Frecuencias absolutas",answer:String(JSON.stringify(frecAbsoluta)),correct:(Object.keys(FRECUENCIAS) as Senal[]).every(m=>Number(frecAbsoluta[m])===FRECUENCIAS[m]),hint:"Vuelve a contar las marcas de cada señal.",target:'[data-review-target="native-absolutas"]'},{id:"relativas",title:"Frecuencias relativas",answer:String(JSON.stringify(frecRelativa)),correct:(Object.keys(FRECUENCIAS) as Senal[]).every(m=>relativaEstados[m]==="correcto" || frecRelativa[m].trim()===PORCENTAJES_CORRECTOS[m]),hint:"La tabla pide porcentajes: divide entre 20 y multiplica por 100. Alfa 25%, Beta 40%, Gamma 20%, Delta 15%. Escribe solo el número.",target:'[data-review-target="native-relativas"]'},{id:"senal",title:"Señal más frecuente",answer:String(preguntaMayorFrecuencia),correct:preguntaMayorFrecuencia==="beta",hint:"Compara las cuatro frecuencias: beta es la mayor.",target:'[data-review-target="native-senal"]'},{id:"zona",title:"Zona recomendada",answer:String(preguntaZona),correct:preguntaZona==="sur",hint:"Relaciona la señal más frecuente con su zona: sur.",target:'[data-review-target="native-zona"]'}];
 const resumeMission=(item?:MissionReviewItem)=>{setResultado(null);mission.beginCorrection(item);};
if (resultado === "exito") return (
    <div
      className="sen-modal-overlay sen-modal-overlay--completed"
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 24,
        background: "rgba(15, 23, 42, 0.58)",
        overflowY: "auto",
      }}
    >
      <section
        className="sen-modal sen-modal--completed"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sen-result-title"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1120,
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: 28,
          boxShadow: "0 40px 80px rgba(15, 23, 42, 0.35)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 310px",
        }}
      >
        <div className="sen-modal-decoration sen-modal-decoration--one" />
        <div className="sen-modal-decoration sen-modal-decoration--two" />

        <div className="sen-modal-main">
          <header className="sen-modal-header">
            <div className="sen-modal-status-icon">
              <FiCheckCircle />
            </div>

            <div className="sen-modal-header-copy">
              <span className="sen-modal-badge">
                <FiCheckCircle />
                Actividad completada
              </span>

              <h1 id="sen-result-title">¡Actividad completada!</h1>

              <p>
                Has terminado con éxito la misión de{" "}
                <span className="sen-modal-mathnova-color">MathData</span>.
              </p>
            </div>
          </header>

          <div className="sen-modal-content"><AudioRetroalimentacion/>
            <div className="sen-modal-character">
              <img
                src={villanoTrofeoCompleto}
                alt="Villano celebrando con trofeo"
                draggable={false}
                style={{ maxWidth: 220, width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <article className="sen-modal-message">
              <span className="sen-modal-message-label">Resultado de la misión</span>
              <h2>¡Excelente trabajo, agente!</h2>
              <p>
Lo lograste a gente con la frecuencia absoluta y relativa pudimos calcular dónde es más probable encontrar el origen de las señales el reporte del sensor está listo para el centro de mando.
              </p>
            </article>
          </div>

          <ResultAudioPlayer src={baitAudioActividadCompletada} />

          <article className="sen-modal-summary">
            <header>
              <FiBarChart2 />
              <h2>Resumen de la actividad</h2>
            </header>

            <div
              className="sen-modal-stats"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 12,
              }}
            >
              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoAciertos} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Pasos correctos</span>
                  <strong>{aciertosResultado}/{mission.total}</strong>
                  <small>¡Perfecto!</small>
                </div>
              </article>

              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoTiempo} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Tiempo</span>
                  <strong>{formatearTiempoSensor(tiempoResultado)}</strong>
                  <small>min</small>
                </div>
              </article>

              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoPrecision} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Precisión</span>
                  <strong>{precisionResultado}%</strong>
                  <small>¡Impecable!</small>
                </div>
              </article>

              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoRecompensa} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Recompensa</span>
                  <strong>{pilot.receipt?.intento_piloto?.xp_obtenido ?? 0} XP</strong>
                  <small>XP del intento</small>
                </div>
              </article>

              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoInsignia} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Insignia obtenida</span>
                  <strong>Misión cumplida</strong>
                  <small>¡Felicidades!</small>
                </div>
              </article>
            </div>
          </article>
        </div>

        <aside
          className="sen-modal-side"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <article className="sen-modal-side-message">
            <span>¡Misión completada!</span>
            <strong>Sigue avanzando por MathData</strong>
            <p>Cada actividad superada fortalece tus habilidades matemáticas.</p>
          </article>

          <div className="sen-modal-progress">
            <div>
              <span>Progreso del tema</span>
              <strong>50%</strong>
            </div>
            <div className="sen-modal-progress-bar">
              <span style={{ width: "50%" }} />
            </div>
          </div>

          <div className="sen-modal-actions" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              type="button"
              className="sen-modal-action sen-modal-action--primary"
              onClick={() => navigate("/actividades-math-data/nucleo-decisiones")}
            >
              <FiArrowRight />
              <span>Siguiente actividad</span>
            </button>

            <button
              type="button"
              className="sen-modal-action sen-modal-action--secondary"
              onClick={handleReiniciarActividad}
            >
              <FiRefreshCw />
              <span>Repetir actividad</span>
            </button>

            <button
              type="button"
              className="sen-modal-action sen-modal-action--secondary"
              onClick={() => navigate("/actividades-math-data")}
            >
              <FiGrid />
              <span>Volver a actividades</span>
            </button>
          </div>
        </aside>
      </section>
    </div>
  );

  // ==========================================
  // VENTANA EMERGENTE: VUELVE A INTENTARLO
  // ==========================================

  if (resultado === "fallo") return (
    <div
      className="sen-modal-overlay sen-modal-overlay--retry"
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 24,
        background: "rgba(15, 23, 42, 0.58)",
        overflowY: "auto",
      }}
    >
      <section
        className="sen-modal sen-modal--retry"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sen-result-title-fallo"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1120,
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: 28,
          boxShadow: "0 40px 80px rgba(15, 23, 42, 0.35)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 310px",
        }}
      >
        <div className="sen-modal-decoration sen-modal-decoration--one" />
        <div className="sen-modal-decoration sen-modal-decoration--two" />

        <div className="sen-modal-main"><DetalleErroresDeMision items={pilot.reviewItems([...missionNativeItems,...mission.items])} onCorrect={resumeMission} onRestart={handleReiniciarActividad}/>
          <header className="sen-modal-header">
            <div className="sen-modal-status-icon">
              <FiRefreshCw />
            </div>

            <div className="sen-modal-header-copy">
              <span className="sen-modal-badge">
                <FiRefreshCw />
                Vuelve a intentarlo
              </span>

              <h1 id="sen-result-title-fallo">¡Vuelve a intentarlo!</h1>

              <p>
                Aún no completas con éxito la misión de{" "}
                <span className="sen-modal-mathnova-color">MathData</span>.
              </p>
            </div>
          </header>

          <div className="sen-modal-content"><AudioRetroalimentacion/>
            <div className="sen-modal-character">
              <img
                src={villanoIntentar}
                alt="Villano retando"
                draggable={false}
                style={{ maxWidth: 220, width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <article className="sen-modal-message">
              <span className="sen-modal-message-label">Resultado de la misión</span>
              <h2>¡No te rindas, agente!</h2>
              <p>
                Revisa el conteo de cada señal en el radar y recalcula sus
                porcentajes. Recuerda: frecuencia relativa = frecuencia
                absoluta ÷ total × 100.
              </p>
            </article>
          </div>

          <ResultAudioPlayer src={baitAudioVuelveAIntentarlo} />

          <article className="sen-modal-summary">
            <header>
              <FiBarChart2 />
              <h2>Resumen de la actividad</h2>
            </header>

            <div
              className="sen-modal-stats"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 12,
              }}
            >
              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoAciertos} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Pasos correctos</span>
                  <strong>{aciertosResultado}/{mission.total}</strong>
                  <small>¡Sigue así!</small>
                </div>
              </article>

              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoTiempo} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Tiempo</span>
                  <strong>{formatearTiempoSensor(tiempoResultado)}</strong>
                  <small>min</small>
                </div>
              </article>

              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoPrecision} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Precisión</span>
                  <strong>{precisionResultado}%</strong>
                  <small>Puedes mejorar</small>
                </div>
              </article>

              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoRecompensa} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Recompensa</span>
                  <strong>{pilot.receipt?.intento_piloto?.xp_obtenido ?? 0} XP</strong>
                  <small>XP del intento</small>
                </div>
              </article>

              <article className="sen-modal-stat">
                <div className="sen-modal-stat-icon">
                  <img src={iconoInsignia} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Insignia obtenida</span>
                  <strong>Sigue intentando</strong>
                  <small>¡No te rindas!</small>
                </div>
              </article>
            </div>
          </article>
        </div>

        <aside
          className="sen-modal-side"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <article className="sen-modal-side-message">
            <span>¡No te rindas!</span>
            <strong>Cada intento te ayuda a mejorar</strong>
            <p>Usa la pista, revisa el procedimiento y vuelve a resolver la actividad.</p>
          </article>

          <div className="sen-modal-progress">
            <div>
              <span>Progreso del tema</span>
              <strong>50%</strong>
            </div>
            <div className="sen-modal-progress-bar">
              <span style={{ width: "50%" }} />
            </div>
          </div>

          <div className="sen-modal-actions" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              type="button"
              className="sen-modal-action sen-modal-action--primary"
              onClick={()=>resumeMission(missionNativeItems.find(item=>item.correct===false))}
            >
              <FiRefreshCw />
              <span>Corregir errores</span>
            </button>

            <button
              type="button"
              className="sen-modal-action sen-modal-action--secondary"
              onClick={() => setMostrarPistaBait(true)}
            >
              <FiTarget />
              <span>Ver pista</span>
            </button>

            <button
              type="button"
              className="sen-modal-action sen-modal-action--secondary"
              onClick={() => navigate("/actividades-math-data")}
            >
              <FiGrid />
              <span>Volver a actividades</span>
            </button>
          </div>
        </aside>
      </section>

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido={
            mensajePistaBait ||
            "¡No te rindas! Cuenta con calma las marcas de conteo: Alfa 5, Beta 8, Gamma 4 y Delta 3. Cada grupo de 4 líneas con una diagonal es un grupo de 5 señales."
          }
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioSensor}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="sen-page mn-activity">
      {avisoActividad && <AvisoActividad message={avisoActividad} onClose={() => setAvisoActividad(null)} />}
      {/* ================= SIDEBAR ================= */}
      <aside className="sen-sidebar">
        <img src={logo} alt="MathNova" className="sen-logo-img" />

        <nav className="sen-nav">
          <button className="sen-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="sen-nav-item sen-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button className="sen-nav-item" type="button" onClick={() => navigate("/retroalimentacion")}>
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="sen-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button className="sen-nav-item" type="button" onClick={() => navigate("/perfil-alumno")}>
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button className="sen-nav-item" type="button" onClick={() => navigate("/estadisticas")}>
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="sen-progreso-card">
          <small>Progreso de la actividad</small>
          <div className="sen-progreso-track">
            <div className="sen-progreso-fill" style={{ width: "80%" }} />
          </div>
          <small>4/5 actividad</small>
        </div>

        <div className="sen-xp-card">
          <small>XP del último intento</small>
          <strong>{pilot.receipt?.intento_piloto?.xp_obtenido ?? "—"} XP ⭐</strong>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="sen-main" style={{ backgroundImage: `url(${fondoSensorImg})` }}>
        <header className="sen-header">
          
          <button type="button" className="sen-ayuda-btn" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>
        <CabeceraCurricular curriculum={activityCurriculum["mathdata-sensor-frecuencias"]} />
        


        {/* FILA SUPERIOR */}
        <div className="sen-top-row">
          <div className="sen-titulo-bloque">
            <h1>Sensor de Frecuencias</h1>
            <p>
              Cuenta señales, calcula frecuencias y localiza la zona de
              origen más probable.
            </p>

            <div className="sen-explica-fila">
              <img src={baitSaludoImg} alt="Bait explicando" className="sen-bait-avatar-img" />

              <div className="sen-explica-burbuja">
                <div className="sen-explica-titulo-row">
                  <strong>BIT te explica</strong>
                  <button
                    className="sen-audio-btn"
                    type="button"
                    onClick={() => setMostrarIntroBait(true)}
                    aria-label="Escuchar explicación"
                  >
                    <FiVolume2 />
                  </button>
                </div>
                <p>
                  Agente, despierta. El sensor nocturno registró actividad
                  extraña: veinte señales aparecieron en distintas zonas del
                  mapa mientras dormías. Necesito que cuentes cuántas veces
                  apareció cada tipo de señal y calcules qué porcentaje del
                  total representa cada una. Con esos datos, el sistema
                  podrá calcular la zona donde es más probable encontrar su
                  origen. ¡Vamos a revisar el radar!
                </p>
              </div>
            </div>
          </div>
        </div>
<EnsayoOtrosMundos activityId="mathdata-sensor-frecuencias"/>


        {/* FILA DE 4 PASOS */}
        <div className="sen-pasos-row">
          {/* PASO 1: RADAR */}
          <div className="sen-paso-card">
            <div className="sen-paso-header">
              <span className="sen-paso-num">1</span>
              <strong>Registro nocturno del radar</strong>
            </div>

            <div className="sen-radar-wrap">
              <svg viewBox="0 0 100 100" className="sen-radar-svg">
                <circle cx="50" cy="50" r="48" className="sen-radar-anillo" />
                <circle cx="50" cy="50" r="32" className="sen-radar-anillo" />
                <circle cx="50" cy="50" r="16" className="sen-radar-anillo" />
                <line x1="50" y1="2" x2="50" y2="98" className="sen-radar-eje" />
                <line x1="2" y1="50" x2="98" y2="50" className="sen-radar-eje" />
                {PUNTOS_RADAR.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="2.1"
                    fill={COLOR_SENAL[p.senal]}
                  />
                ))}
                <text x="50" y="9" className="sen-radar-etiqueta">Norte</text>
                <text x="50" y="96" className="sen-radar-etiqueta">Sur</text>
                <text x="6" y="53" className="sen-radar-etiqueta">Oeste</text>
                <text x="86" y="53" className="sen-radar-etiqueta">Este</text>
              </svg>
            </div>

            <div className="sen-radar-leyenda">
              {(Object.keys(FRECUENCIAS) as Senal[]).map((s) => (
                <div className="sen-leyenda-fila" key={s}>
                  <span className="sen-leyenda-punto" style={{ background: COLOR_SENAL[s] }} />
                  <span className="sen-leyenda-nombre">{NOMBRE_SENAL[s]}</span>
                  <small>{ZONA_SENAL[s]}</small>
                </div>
              ))}
            </div>

            <div className="sen-info-box">
              <FiInfo /> Cada punto representa una señal detectada.
            </div>
          </div>

          {/* PASO 2: FRECUENCIA ABSOLUTA */}
          <div className="sen-paso-card">
            <div className="sen-paso-header">
              <span className="sen-paso-num">2</span>
              <strong>Frecuencia absoluta</strong>
            </div>

            <table className="sen-tabla">
              <thead>
                <tr>
                  <th>Tipo de señal</th>
                  <th>Conteo (marcas)</th>
                  <th>Frec. absoluta</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(FRECUENCIAS) as Senal[]).map((s) => (
                  <tr key={s}>
                    <td className="sen-td-nombre">
                      <span className="sen-td-punto" style={{ background: COLOR_SENAL[s] }} />
                      {NOMBRE_SENAL[s]}
                    </td>
                    <td className="sen-td-marcas">{palitos(FRECUENCIAS[s])}</td>
                    <td>
                      <div className="sen-input-grupo">
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`sen-input sen-input-${absolutaEstado(s)}`}
                          data-review-target="native-absolutas" value={frecAbsoluta[s]}
                          onChange={(e) =>
                            setFrecAbsoluta((prev) => ({ ...prev, [s]: e.target.value }))
                          }
                          aria-label={`Frecuencia absoluta de ${NOMBRE_SENAL[s]}`}
                          disabled={
                            cargandoAbsoluta ||
                            cargandoZona ||
                            absolutaBloqueada[s] ||
                            absolutaEstados[s] === "correcto"
                          }
                        />
                        {absolutaEstado(s) === "correcto" && <FiCheckCircle className="sen-check-verde" />}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="sen-fila-total">
                  <td>TOTAL</td>
                  <td>—</td>
                  <td>{TOTAL_SENALES}</td>
                </tr>
              </tbody>
            </table>

            <div className="sen-info-box">
              <FiInfo /> Cada grupo de 4 líneas con una diagonal representa 5 señales.
            </div>

            <button
              type="button"
              className="sen-verificar-btn"
              onClick={verificarAbsoluta}
              disabled={
                cargandoAbsoluta ||
                cargandoZona
              }
            >
              <FiCheck /> {cargandoAbsoluta ? "Verificando..." : "Verificar frecuencias"}
            </button>
          </div>

          {/* PASO 3: FRECUENCIA RELATIVA */}
          <div className="sen-paso-card">
            <div className="sen-paso-header">
              <span className="sen-paso-num">3</span>
              <strong>Frecuencia relativa (%)</strong>
            </div>
            <p className="sen-paso-pregunta">
              (Frecuencia absoluta ÷ total) × 100
            </p>

            <table className="sen-tabla">
              <thead>
                <tr>
                  <th>Tipo de señal</th>
                  <th>Frec. relativa (%)</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(PORCENTAJES_CORRECTOS) as Senal[]).map((s) => (
                  <tr key={s}>
                    <td className="sen-td-nombre">
                      <span className="sen-td-punto" style={{ background: COLOR_SENAL[s] }} />
                      {NOMBRE_SENAL[s]}
                    </td>
                    <td>
                      <div className="sen-input-grupo">
                        <input
                          type="text"
                          inputMode="decimal"
                          className={`sen-input sen-input-${relativaEstado(s)}`}
                          data-review-target="native-relativas" value={frecRelativa[s]}
                          onChange={(e) =>
                            setFrecRelativa((prev) => ({ ...prev, [s]: e.target.value }))
                          }
                          aria-label={`Frecuencia relativa de ${NOMBRE_SENAL[s]}`}
                          disabled={
                            cargandoRelativa ||
                            cargandoZona ||
                            relativaBloqueada[s] ||
                            relativaEstados[s] === "correcto"
                          }
                        />
                        <span>%</span>
                        {relativaEstado(s) === "correcto" && <FiCheckCircle className="sen-check-verde" />}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="sen-fila-total">
                  <td>TOTAL</td>
                  <td>100 %</td>
                </tr>
              </tbody>
            </table>

            <div className="sen-info-box">
              <FiInfo /> Escribe solo el número del porcentaje, sin el símbolo %.
            </div>

            <button
              type="button"
              className="sen-verificar-btn"
              onClick={verificarRelativa}
              disabled={
                cargandoRelativa ||
                cargandoZona
              }
            >
              <FiPercent /> {cargandoRelativa ? "Verificando..." : "Verificar porcentajes"}
            </button>
          </div>

          {/* PASO 4: PREGUNTAS DE INTERPRETACIÓN */}
          <div className="sen-paso-card">
            <div className="sen-paso-header">
              <span className="sen-paso-num">4</span>
              <strong>Preguntas de interpretación</strong>
            </div>

            <div className="sen-pregunta-bloque">
              <p className="sen-paso-pregunta">¿Qué tipo de señal tuvo la mayor frecuencia?</p>
              <div className="sen-opciones-radio">
                {(Object.keys(FRECUENCIAS) as Senal[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`sen-opcion-radio ${
                      preguntaMayorFrecuencia === s ? "sen-opcion-radio-activa" : ""
                    }`}
                    data-review-target="native-senal" onClick={() => setPreguntaMayorFrecuencia(s)}
                    aria-pressed={preguntaMayorFrecuencia === s}
                    disabled={cargandoZona}
                  >
                    <span className="sen-radio-circulo" />
                    {NOMBRE_SENAL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="sen-pregunta-bloque">
              <p className="sen-paso-pregunta">
                Según tus datos, ¿en qué zona del mapa es más probable
                encontrar el origen de las señales?
              </p>
              <div className="sen-opciones-radio">
                {(Object.keys(NOMBRE_ZONA) as Zona[]).map((z) => (
                  <button
                    key={z}
                    type="button"
                    className={`sen-opcion-radio ${
                      preguntaZona === z ? "sen-opcion-radio-activa" : ""
                    }`}
                    data-review-target="native-zona" onClick={() => setPreguntaZona(z)}
                    aria-pressed={preguntaZona === z}
                    disabled={cargandoZona}
                  >
                    <span className="sen-radio-circulo" />
                    {NOMBRE_ZONA[z]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR: PISTA + CALCULAR ZONA DE ORIGEN */}
        <div className="sen-bottom-row">
          <div className="sen-pista-card">
            <button
              type="button"
              className="sen-pista-trigger"
              onClick={() => {
                setMensajePistaBait("");
                setMostrarPistaBait(true);

                if (!ID_ESTUDIANTE) {
                  return;
                }

                fetch(`${API_URL}/sensor/pista-consultada`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: 4 }),
                }).catch((error) => console.error("Error al registrar consulta de pista:", error));
              }}
            >
              <img src={baitPistaImg} alt="" className="sen-pista-icono" />
              <strong>Pista de BIT</strong>
            </button>

            <div className="sen-pista-items">
              <div className="sen-pista-item">
                <FiRadio />
                <span>Frecuencia absoluta: cuenta cuántas veces aparece cada señal.</span>
              </div>
              <div className="sen-pista-item">
                <FiPercent />
                <span>Frecuencia relativa: frecuencia absoluta ÷ 20 × 100.</span>
              </div>
            </div>
          </div>

          <p className="mn-finish-direction">Cuando completes los retos, usa «Terminar misión» al final de la actividad.</p>
        </div>
      <PilotEvidenceStatus pilot={pilot}/>
<RetosDeMision expansion={mission}/><CierreDeMision onFinish={()=>void calcularZonaOrigen()} busy={pilot.busy}/></main>

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="BIT te explica"
          contenido="Agente, despierta. El sensor nocturno registró actividad extraña: veinte señales aparecieron en distintas zonas del mapa mientras dormías. Necesito que cuentes cuántas veces apareció cada tipo de señal y calcules qué porcentaje del total representa cada una. Con esos datos, el sistema podrá calcular la zona donde es más probable encontrar su origen. ¡Vamos a revisar el radar!"
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioSensor}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido={
            mensajePistaBait ||
            "¡No te rindas! Cuenta con calma las marcas de conteo: Alfa 5, Beta 8, Gamma 4 y Delta 3. Cada grupo de 4 líneas con una diagonal es un grupo de 5 señales."
          }
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioSensor}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );
}
