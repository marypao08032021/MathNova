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
import "./NucleoDecisiones.css";

/* ---- Reutilizadas de las actividades anteriores (mismos recursos, sin cambios) ---- */
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

/* ---- Nueva para la Actividad 6 ---- */
import fondoNucleoImg from "../../assets/fondo-nucleo-decisiones.png";
import villanoDivideImg from "../../assets/villano-divide.png";

/* ---- Audios ---- */
import introBaitAudioNucleo from "../../assets/intro_act6.mp3";
import baitAudioActividadCompletada from "../../assets/actividad_completada_act6.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/volver_intentarlo_act6.mp3";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowLeft,
  FiHelpCircle,
  FiVolume2,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiArrowRight,
  FiInfo,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
  FiSend,
  FiShield,
  FiClipboard,
  FiRefreshCw,
  FiAlertTriangle,
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

type UsuarioSesionNucleo = {
  id_usuario?: number | string;
  idUsuario?: number | string;
  usuario_id?: number | string;
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  usuario?: UsuarioSesionNucleo;
  user?: UsuarioSesionNucleo;
  data?: UsuarioSesionNucleo;
  session?: UsuarioSesionNucleo;
};

const extraerIdUsuarioNucleo = (
  valor: unknown,
): number => {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return 0;
  }

  const usuario =
    valor as UsuarioSesionNucleo;

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
      extraerIdUsuarioNucleo(
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
      extraerIdUsuarioNucleo(
        candidato,
      );

    if (idUsuario > 0) {
      return idUsuario;
    }
  }

  return 0;
};

interface Expedicion {
  id: number;
  minutos: number;
}

const EXPEDICIONES: Expedicion[] = [
  { id: 1, minutos: 44 },
  { id: 2, minutos: 60 },
  { id: 3, minutos: 48 },
  { id: 4, minutos: 44 },
  { id: 5, minutos: 58 },
  { id: 6, minutos: 52 },
];

const ORDEN_INICIAL: number[] = EXPEDICIONES.map((e) => e.id);
const VALOR_POR_ID: Record<number, number> = Object.fromEntries(
  EXPEDICIONES.map((e) => [e.id, e.minutos])
);

const SECUENCIA_CORRECTA = [44, 44, 48, 52, 58, 60];
const SUMA_TOTAL = EXPEDICIONES.reduce((acc, e) => acc + e.minutos, 0); // 306

const MEDIA_CORRECTA = "51";
const MEDIANA_CORRECTA = "50";
const MODA_CORRECTA = "44";
const RANGO_CORRECTA = "16";
const CAPACIDAD_CORRECTA = Number(MEDIA_CORRECTA) + Number(RANGO_CORRECTA); // 67

type EstadoCampo = "correcto" | "pendiente" | "incorrecto";
type Pantalla = "orden" | "media" | "mediana" | "moda" | "rango" | "decision";

const PISTAS_POR_TEMA: Record<Pantalla, string> = {
  orden:
    "Ordena los tiempos del menor al mayor. Toca un número y después toca otro para intercambiar sus posiciones.",
  media:
    "La media se obtiene sumando todos los tiempos y dividiendo el total entre la cantidad de expediciones.",
  mediana:
    "Con seis datos ordenados, la mediana es el promedio de los dos valores que quedan en el centro.",
  moda:
    "La moda es el valor que aparece más veces dentro del conjunto de datos.",
  rango:
    "El rango se calcula restando el valor menor al valor mayor.",
  decision:
    "Combina la estimación general de la media con la reserva adicional indicada por el rango.",
};

// Reconstruye un arreglo de IDs de expedición que coincida con la
// secuencia de valores dada (necesario porque el 44 aparece dos veces).
function construirOrdenDesdeValores(valores: number[]): number[] {
  const usados = new Set<number>();
  return valores.map((v) => {
    const candidato = EXPEDICIONES.find((e) => e.minutos === v && !usados.has(e.id));
    const id = candidato?.id ?? EXPEDICIONES[0].id;
    usados.add(id);
    return id;
  });
}

function formatearTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

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

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;

    video?.play().catch(() => {
      // El video es decorativo; la actividad continúa si el navegador lo bloquea.
    });

    if (audioSrc && audio) {
      audio.currentTime = 0;
      const intento = audio.play();
      intento?.catch(() => {
        // Los controles manuales permanecen disponibles si el navegador bloquea autoplay.
      });
    }
  }, [audioSrc]);

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
            autoPlay
            loop
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
            autoPlay
            preload="auto"
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

function PistaCompacta({
  contenido,
  onClose,
}: {
  contenido: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [onClose]);

  return createPortal(
    <div
      className="nuc-pista-compacta-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuc-pista-compacta-titulo"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article className="nuc-pista-compacta">
        <button
          type="button"
          className="nuc-pista-compacta-cerrar"
          onClick={onClose}
          aria-label="Cerrar pista"
        >
          <FiX />
        </button>
        <img src={baitPistaImg} alt="Bait dando una pista" />
        <div>
          <span>Pista rápida</span>
          <h2 id="nuc-pista-compacta-titulo">Revisa este concepto</h2>
          <p>{contenido}</p>
          <button type="button" onClick={onClose}>
            Continuar
          </button>
        </div>
      </article>
    </div>,
    document.body,
  );
}

function AyudaContextual({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [onClose]);

  return createPortal(
    <div
      className="nuc-contexto-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuc-contexto-titulo"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article className="nuc-contexto-modal">
        <button
          type="button"
          className="nuc-contexto-cerrar"
          onClick={onClose}
          aria-label="Cerrar contexto"
        >
          <FiX />
        </button>
        <img src={baitPistaImg} alt="Bait orientando la misión" />
        <div>
          <span>Contexto de la actividad 6</span>
          <h2 id="nuc-contexto-titulo">El Núcleo de Decisiones</h2>
          <p>
            DIVIDE mezcló los tiempos de seis expediciones. Tu misión es
            ordenarlos y analizar la media, mediana, moda y rango para decidir
            cuánta energía necesita la nave.
          </p>
          <ol>
            <li>Ordena los tiempos de menor a mayor.</li>
            <li>Calcula y verifica cada medida estadística.</li>
            <li>Usa la media y el rango para enviar la decisión final.</li>
          </ol>
          <button type="button" onClick={onClose}>
            Entendido, continuar
          </button>
        </div>
      </article>
    </div>,
    document.body,
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
    <div className="nuc-modal-audio">
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
        className="nuc-modal-audio-btn"
        onClick={() => saltar(-RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Retroceder 10 segundos"
      >
        <FiRotateCcw />
      </button>

      <button
        type="button"
        className="nuc-modal-audio-btn nuc-modal-audio-btn--play"
        onClick={alternarReproduccion}
        aria-label={reproduciendo ? "Pausar" : "Reproducir"}
      >
        {reproduciendo ? <FiPause /> : <FiPlay />}
      </button>

      <button
        type="button"
        className="nuc-modal-audio-btn"
        onClick={() => saltar(RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Adelantar 10 segundos"
      >
        <FiRotateCw />
      </button>

      <div className="nuc-modal-audio-progress">
        <div style={{ width: `${progreso}%` }} />
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function NucleoDecisiones() {
 const mission=useMissionExpansion("mathdata-nucleo-decisiones");
  const [avisoActividad, setAvisoActividad] = useState<string | null>(null);
  const navigate = useNavigate();

  const ID_ESTUDIANTE =
    obtenerIdEstudianteActual();

  const guardandoProgresoRef =
    useRef(false);

  /* ---- Paso 2: ordenamiento por selección ---- */
  const [orden, setOrden] = useState<number[]>(ORDEN_INICIAL);
  const [posicionesCorrectas, setPosicionesCorrectas] = useState<boolean[]>([false, false, false, false, false, false]);
  const [posicionesPista, setPosicionesPista] = useState<boolean[]>([false, false, false, false, false, false]);
  const [ordenVerificadoAlMenos1Vez, setOrdenVerificadoAlMenos1Vez] = useState(false);
  const [pasosDesbloqueados, setPasosDesbloqueados] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number | null>(null);

  /* ---- Pasos 3 a 6: medidas estadísticas ---- */
  const [media, setMedia] = useState("");
  const [mediaEstado, setMediaEstado] = useState<EstadoCampo>("pendiente");
  const [mediaAsistida, setMediaAsistida] = useState(false);

  const [mediana, setMediana] = useState("");
  const [medianaEstado, setMedianaEstado] = useState<EstadoCampo>("pendiente");
  const [medianaAsistida, setMedianaAsistida] = useState(false);

  const [moda, setModa] = useState("");
  const [modaEstado, setModaEstado] = useState<EstadoCampo>("pendiente");
  const [modaAsistida, setModaAsistida] = useState(false);

  const [rango, setRango] = useState("");
  const [rangoEstado, setRangoEstado] = useState<EstadoCampo>("pendiente");
  const [rangoAsistida, setRangoAsistida] = useState(false);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mensajePistaBait, setMensajePistaBait] = useState("");
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarContexto, setMostrarContexto] = useState(false);

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoOrden, setCargandoOrden] = useState(false);
  const [cargandoMedia, setCargandoMedia] = useState(false);
  const [cargandoMediana, setCargandoMediana] = useState(false);
  const [cargandoModa, setCargandoModa] = useState(false);
  const [cargandoRango, setCargandoRango] = useState(false);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);

  /* ---- Temporizador ---- */
  const tiempoInicioRef = useRef<number>(Date.now());
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);

  useEffect(() => {
    if (cargandoInicial || resultado !== null) return;

    const intervalo = setInterval(() => {
      setSegundosTranscurridos(Math.floor((Date.now() - tiempoInicioRef.current) / 1000));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [cargandoInicial, resultado]);

  /* ---- Derivados ---- */
  const ordenResuelto = posicionesCorrectas.every(Boolean);
  const mediaValida = mediaEstado === "correcto" || mediaAsistida;
  const medianaValida = medianaEstado === "correcto" || medianaAsistida;
  const modaValida = modaEstado === "correcto" || modaAsistida;
  const rangoValido = rangoEstado === "correcto" || rangoAsistida;

  const capacidadTotal = mediaValida && rangoValido ? Number(media) + Number(rango) : null;
  const capacidadCorrecta = capacidadTotal === CAPACIDAD_CORRECTA;

  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
    const cargarProgreso = async () => {
      if (!ID_ESTUDIANTE) {
        console.warn(
          "No se encontró el estudiante autenticado para cargar Núcleo de Decisiones.",
        );
        setCargandoInicial(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/nucleo/progreso/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          const progreso = data.data;

          const ordenGuardado = (progreso.orden_valores || []) as number[];
          const posicionesGuardadas = (progreso.orden_posiciones_correctas || []) as boolean[];
          if (ordenGuardado.length === 6) {
            setOrden(construirOrdenDesdeValores(ordenGuardado));
            setOrdenVerificadoAlMenos1Vez(true);
          }
          if (posicionesGuardadas.length === 6) {
            setPosicionesCorrectas(posicionesGuardadas);
            if (posicionesGuardadas.every(Boolean)) setPasosDesbloqueados(true);
          }

          if (progreso.valor_media) {
            setMedia(String(progreso.valor_media));
            setMediaEstado(String(progreso.valor_media) === MEDIA_CORRECTA ? "correcto" : "incorrecto");
            setMediaAsistida(!!progreso.media_asistida);
          }
          if (progreso.valor_mediana) {
            setMediana(String(progreso.valor_mediana));
            setMedianaEstado(String(progreso.valor_mediana) === MEDIANA_CORRECTA ? "correcto" : "incorrecto");
            setMedianaAsistida(!!progreso.mediana_asistida);
          }
          if (progreso.valor_moda) {
            setModa(String(progreso.valor_moda));
            setModaEstado(String(progreso.valor_moda) === MODA_CORRECTA ? "correcto" : "incorrecto");
            setModaAsistida(!!progreso.moda_asistida);
          }
          if (progreso.valor_rango) {
            setRango(String(progreso.valor_rango));
            setRangoEstado(String(progreso.valor_rango) === RANGO_CORRECTA ? "correcto" : "incorrecto");
            setRangoAsistida(!!progreso.rango_asistida);
          }

          if (progreso.completada) {
            setResultado(progreso.resultado_correcto ? "exito" : "fallo");
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

  /* ---- Intercambio por clic o toque: funciona con mouse y pantalla táctil ---- */
  const seleccionarPosicion = (index: number) => {
    if (posicionesCorrectas[index] || cargandoEnvio || ordenResuelto) return;

    if (indiceSeleccionado === null) {
      setIndiceSeleccionado(index);
      return;
    }

    if (indiceSeleccionado === index) {
      setIndiceSeleccionado(null);
      return;
    }

    const origen = indiceSeleccionado;
    if (posicionesCorrectas[origen]) {
      setIndiceSeleccionado(index);
      return;
    }

    setOrden((prev) => {
      const copia = [...prev];
      const temporal = copia[origen];
      copia[origen] = copia[index];
      copia[index] = temporal;
      return copia;
    });
    setIndiceSeleccionado(null);
    setPosicionesPista([false, false, false, false, false, false]);
  };

  // ==========================================
  // VERIFICAR ORDEN
  // ==========================================

  const verificarOrden = async () => {
    pilot.recordAll();
    if (
      ordenResuelto ||
      cargandoOrden
    ) {
      return;
    }

    if (!ID_ESTUDIANTE) {
      setAvisoActividad(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setCargandoOrden(true);
    try {
      const secuenciaActual = orden.map((id) => VALOR_POR_ID[id]);

      const response = await fetch(`${API_URL}/nucleo/validar-orden`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, orden: secuenciaActual }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        const r = data.data;

        setOrdenVerificadoAlMenos1Vez(true);
        setPosicionesCorrectas(r.posiciones_correctas || posicionesCorrectas);
        setPosicionesPista(r.posiciones_pista || [false, false, false, false, false, false]);

        if (r.mostrar_pista_bait) {
          setMensajePistaBait(r.mensaje);
          setMostrarPistaBait(true);

          if (ID_ESTUDIANTE) {
            fetch(`${API_URL}/nucleo/pista-consultada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla: "orden" }),
            }).catch((error) =>
              console.error(
                "Error al registrar consulta de pista:",
                error,
              ),
            );
          }
        }

        if (r.correcto) {
          setPasosDesbloqueados(true);
        } else {
          setMensajePistaBait(PISTAS_POR_TEMA.orden);
          setMostrarPistaBait(true);
        }
      }
    } catch (error) {
      console.error("Error al verificar el orden:", error);
    } finally {
      setCargandoOrden(false);
    }
  };

  // ==========================================
  // Validador genérico para media, mediana, moda y rango
  // ==========================================

  const verificarCampo = async (
    endpoint: string,
    valorActual: string,
    pantalla: Pantalla,
    setEstado: (v: EstadoCampo) => void,
    setAsistida: (v: boolean) => void,
    setValor: (v: string) => void,
    setCargando: (v: boolean) => void
  ) => {
    pilot.recordAll();
    if (!ID_ESTUDIANTE) {
      setAvisoActividad(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    if (!valorActual.trim()) {
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/nucleo/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, valor: valorActual }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        const r = data.data;

        if (r.mostrar_pista_bait) {
          setMensajePistaBait(r.mensaje);
          setMostrarPistaBait(true);

          if (ID_ESTUDIANTE) {
            fetch(`${API_URL}/nucleo/pista-consultada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE, pantalla }),
            }).catch((error) =>
              console.error(
                "Error al registrar consulta de pista:",
                error,
              ),
            );
          }
        }

        if (r.celda_completada && !r.correcto) {
          setValor(r.respuesta_correcta);
          setEstado("incorrecto");
          setAsistida(true);
        } else if (r.correcto) {
          setEstado("correcto");
        } else {
          setEstado("incorrecto");
        }

        if (!r.correcto) {
          setMensajePistaBait(PISTAS_POR_TEMA[pantalla]);
          setMostrarPistaBait(true);
        }
      }
    } catch (error) {
      console.error(`Error al verificar ${pantalla}:`, error);
    } finally {
      setCargando(false);
    }
  };

  const verificarMedia = () =>
    verificarCampo("validar-media", media, "media", setMediaEstado, setMediaAsistida, setMedia, setCargandoMedia);
  const verificarMediana = () =>
    verificarCampo("validar-mediana", mediana, "mediana", setMedianaEstado, setMedianaAsistida, setMediana, setCargandoMediana);
  const verificarModa = () =>
    verificarCampo("validar-moda", moda, "moda", setModaEstado, setModaAsistida, setModa, setCargandoModa);
  const verificarRango = () =>
    verificarCampo("validar-rango", rango, "rango", setRangoEstado, setRangoAsistida, setRango, setCargandoRango);

  /* ---- Envío final de la decisión ---- */
  const pilot=useMathDataEvidence("mathdata-nucleo-decisiones",mission,()=>({orden_tiempos:orden.map(id=>VALOR_POR_ID[id]),media,mediana,moda,rango,capacidad_total:capacidadTotal,respuestas_asistidas:{media:mediaAsistida,mediana:medianaAsistida,moda:modaAsistida,rango:rangoAsistida}}));
  useEffect(()=>{const attempt=pilot.receipt?.intento_piloto;if(!attempt)return;
    setResultado(attempt.evaluacion.completada?"exito":"fallo");
  },[pilot.receipt]);

  const handleEnviarDecision = async () => {
    if(pilot.busy)return;
    setCargandoEnvio(true);
    try {await pilot.finish(Math.max(1,Math.floor((Date.now()-tiempoInicioRef.current)/1000)),60);}
    catch(error){setAvisoActividad(error instanceof Error?error.message:"No se pudo guardar; conserva esta pestaña.");}
    finally{setCargandoEnvio(false);}
  };

  const handleReiniciarActividad = async () => {
 mission.reset();
 pilot.resetSession();
    if (ID_ESTUDIANTE) {
      try {
        await fetch(`${API_URL}/nucleo/reiniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE }),
        });
      } catch (error) {
        console.error("Error al reiniciar actividad:", error);
      }
    }

    setOrden(ORDEN_INICIAL);
    setIndiceSeleccionado(null);
    setPosicionesCorrectas([false, false, false, false, false, false]);
    setPosicionesPista([false, false, false, false, false, false]);
    setOrdenVerificadoAlMenos1Vez(false);
    setPasosDesbloqueados(false);
    setMedia("");
    setMediaEstado("pendiente");
    setMediaAsistida(false);
    setMediana("");
    setMedianaEstado("pendiente");
    setMedianaAsistida(false);
    setModa("");
    setModaEstado("pendiente");
    setModaAsistida(false);
    setRango("");
    setRangoEstado("pendiente");
    setRangoAsistida(false);
    setMostrarPistaBait(false);
    setMensajePistaBait("");
    setMostrarIntroBait(false);
    setMostrarContexto(false);
    setResultado(null);
    tiempoInicioRef.current = Date.now();
    setSegundosTranscurridos(0);
    guardandoProgresoRef.current =
      false;
  };

  /* ---- Resumen para las pantallas de resultado ---- */
  const aciertos = pilot.evaluation?.aciertos ?? ([ordenResuelto, mediaValida, medianaValida, modaValida, rangoValido].filter(Boolean).length + mission.correctCount);
  const totalPasos = mission.total;
  const precision = Math.round((aciertos / totalPasos) * 100);
  const puntosGanados = pilot.receipt?.intento_piloto?.xp_obtenido ?? (resultado === "exito" ? 50 : 10);

  // ==========================================
  // PANTALLA DE CARGA INICIAL (evita mostrar el
  // tablero antes de saber si ya estaba completada)
  // ==========================================


 const missionNativeItems:MissionReviewItem[]=[{id:"orden",title:"Orden de lecturas",answer:String(JSON.stringify(orden)),correct:ordenResuelto,hint:"Ordena las lecturas de menor a mayor.",target:'[data-review-target="native-orden"]'},{id:"media",title:"Media",answer:String(media),correct:mediaValida,hint:"Suma las seis lecturas y divide entre seis: 51.",target:'[data-review-target="native-media"]'},{id:"mediana",title:"Mediana",answer:String(mediana),correct:medianaValida,hint:"Con seis datos, promedia el tercero y el cuarto: (48+52)/2 = 50.",target:'[data-review-target="native-mediana"]'},{id:"moda",title:"Moda",answer:String(moda),correct:modaValida,hint:"La lectura más repetida es 44.",target:'[data-review-target="native-moda"]'},{id:"rango",title:"Rango",answer:String(rango),correct:rangoValido,hint:"Resta mínimo a máximo: 60−44 = 16.",target:'[data-review-target="native-rango"]'}];
 const resumeMission=(item?:MissionReviewItem)=>{setResultado(null);mission.beginCorrection(item);};
  if (cargandoInicial) {
    return (
      <div className="nuc-loading-screen">
        <img src={logo} alt="MathNova" className="nuc-loading-logo" />
        <p>Cargando actividad...</p>
      </div>
    );
  }

  // ==========================================
  // VENTANA EMERGENTE: ACTIVIDAD COMPLETADA
  // ==========================================

  if (resultado === "exito") return (
    <div
      className="nuc-modal-overlay nuc-modal-overlay--completed"
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
        overflowX: "hidden",
      }}
    >
      <section
        className="nuc-modal nuc-modal--completed"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nuc-result-title"
        style={{
          position: "relative",
          width: "100%",
          minWidth: 0,
          maxWidth: 1120,
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: 28,
          boxShadow: "0 40px 80px rgba(15, 23, 42, 0.35)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 310px",
          overflowX: "hidden",
        }}
      >
        <div className="nuc-modal-decoration nuc-modal-decoration--one" />
        <div className="nuc-modal-decoration nuc-modal-decoration--two" />

        <div className="nuc-modal-main" style={{ minWidth: 0, overflowX: "hidden" }}>
          <header className="nuc-modal-header">
            <div className="nuc-modal-status-icon">
              <FiCheckCircle />
            </div>

            <div className="nuc-modal-header-copy">
              <span className="nuc-modal-badge">
                <FiCheckCircle />
                Actividad completada
              </span>

              <h1 id="nuc-result-title">¡Actividad completada!</h1>

              <p>
                Has terminado con éxito la misión de{" "}
                <span className="nuc-modal-mathnova-color">MathData</span>.
              </p>
            </div>
          </header>

          <div className="nuc-modal-content"><AudioRetroalimentacion/>
            <div className="nuc-modal-character">
              <img
                src={villanoTrofeoCompleto}
                alt="Villano celebrando con trofeo"
                draggable={false}
                style={{ maxWidth: 220, width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <article className="nuc-modal-message">
              <span className="nuc-modal-message-label">Resultado de la misión</span>
              <h2>¡Excelente trabajo, agente!</h2>
              <p>
Decisión autorizada agente estimamos una misión de 51 minutos y cargamos 16 minutos adicionales de Reserva la nave está preparada para operar durante 67 minutos el núcleo de decisiones queda restaurado
              </p>
            </article>
          </div>

          <ResultAudioPlayer src={baitAudioActividadCompletada} />

          <article className="nuc-modal-summary">
            <header>
              <FiBarChart2 />
              <h2>Resumen de la actividad</h2>
            </header>

            <div
              className="nuc-modal-stats"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 10,
                minWidth: 0,
                width: "100%",
              }}
            >
              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
                  <img src={iconoAciertos} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Pasos correctos</span>
                  <strong>{aciertos}/{totalPasos}</strong>
                  <small>¡Perfecto!</small>
                </div>
              </article>

              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
                  <img src={iconoTiempo} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Tiempo</span>
                  <strong>{formatearTiempo(segundosTranscurridos)}</strong>
                  <small>min</small>
                </div>
              </article>

              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
                  <img src={iconoPrecision} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Precisión</span>
                  <strong>{precision}%</strong>
                  <small>¡Impecable!</small>
                </div>
              </article>

              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
                  <img src={iconoRecompensa} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Recompensa</span>
                  <strong>{puntosGanados} XP</strong>
                  <small>XP del intento</small>
                </div>
              </article>

              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
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
          className="nuc-modal-side"
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <article className="nuc-modal-side-message">
            <span>¡Misión completada!</span>
            <strong>Sigue avanzando por MathData</strong>
            <p>Cada actividad superada fortalece tus habilidades matemáticas.</p>
          </article>

          <div className="nuc-modal-progress">
            <div>
              <span>Progreso del tema</span>
              <strong>60%</strong>
            </div>
            <div className="nuc-modal-progress-bar">
              <span style={{ width: "60%" }} />
            </div>
          </div>

          <div
            className="nuc-modal-actions"
            style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}
          >
            <button
              type="button"
              className="nuc-modal-action nuc-modal-action--primary"
              onClick={() => navigate("/actividades-math-data/oraculo-estacion")}
            >
              <FiArrowRight />
              <span>Siguiente actividad</span>
            </button>

            <button
              type="button"
              className="nuc-modal-action nuc-modal-action--secondary"
              onClick={handleReiniciarActividad}
            >
              <FiRefreshCw />
              <span>Repetir actividad</span>
            </button>

            <button
              type="button"
              className="nuc-modal-action nuc-modal-action--secondary"
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
      className="nuc-modal-overlay nuc-modal-overlay--retry"
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
        overflowX: "hidden",
      }}
    >
      <section
        className="nuc-modal nuc-modal--retry"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nuc-result-title-fallo"
        style={{
          position: "relative",
          width: "100%",
          minWidth: 0,
          maxWidth: 1120,
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: 28,
          boxShadow: "0 40px 80px rgba(15, 23, 42, 0.35)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 310px",
          overflowX: "hidden",
        }}
      >
        <div className="nuc-modal-decoration nuc-modal-decoration--one" />
        <div className="nuc-modal-decoration nuc-modal-decoration--two" />

        <div className="nuc-modal-main" style={{ minWidth: 0, overflowX: "hidden" }}><DetalleErroresDeMision items={pilot.reviewItems([...missionNativeItems,...mission.items])} onCorrect={resumeMission} onRestart={handleReiniciarActividad}/>
          <header className="nuc-modal-header">
            <div className="nuc-modal-status-icon">
              <FiRefreshCw />
            </div>

            <div className="nuc-modal-header-copy">
              <span className="nuc-modal-badge">
                <FiRefreshCw />
                Vuelve a intentarlo
              </span>

              <h1 id="nuc-result-title-fallo">¡Vuelve a intentarlo!</h1>

              <p>
                Aún no completas con éxito la misión de{" "}
                <span className="nuc-modal-mathnova-color">MathData</span>.
              </p>
            </div>
          </header>

          <div className="nuc-modal-content"><AudioRetroalimentacion/>
            <div className="nuc-modal-character">
              <img
                src={villanoIntentar}
                alt="Villano retando"
                draggable={false}
                style={{ maxWidth: 220, width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <article className="nuc-modal-message">
              <span className="nuc-modal-message-label">Resultado de la misión</span>
              <h2>¡No te rindas, agente!</h2>
              <p>
                Revisa el orden de los tiempos y vuelve a calcular la media,
                la mediana, la moda y el rango. Recuerda: la capacidad total
                es la media más el rango.
              </p>
            </article>
          </div>

          <ResultAudioPlayer src={baitAudioVuelveAIntentarlo} />

          <article className="nuc-modal-summary">
            <header>
              <FiBarChart2 />
              <h2>Resumen de la actividad</h2>
            </header>

            <div
              className="nuc-modal-stats"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 10,
                minWidth: 0,
                width: "100%",
              }}
            >
              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
                  <img src={iconoAciertos} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Pasos correctos</span>
                  <strong>{aciertos}/{totalPasos}</strong>
                  <small>¡Sigue así!</small>
                </div>
              </article>

              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
                  <img src={iconoTiempo} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Tiempo</span>
                  <strong>{formatearTiempo(segundosTranscurridos)}</strong>
                  <small>min</small>
                </div>
              </article>

              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
                  <img src={iconoPrecision} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Precisión</span>
                  <strong>{precision}%</strong>
                  <small>Puedes mejorar</small>
                </div>
              </article>

              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
                  <img src={iconoRecompensa} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Recompensa</span>
                  <strong>{puntosGanados} XP</strong>
                  <small>XP del intento</small>
                </div>
              </article>

              <article className="nuc-modal-stat">
                <div className="nuc-modal-stat-icon">
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
          className="nuc-modal-side"
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <article className="nuc-modal-side-message">
            <span>¡No te rindas!</span>
            <strong>Cada intento te ayuda a mejorar</strong>
            <p>Usa la pista, revisa el procedimiento y vuelve a resolver la actividad.</p>
          </article>

          <div className="nuc-modal-progress">
            <div>
              <span>Progreso del tema</span>
              <strong>60%</strong>
            </div>
            <div className="nuc-modal-progress-bar">
              <span style={{ width: "60%" }} />
            </div>
          </div>

          <div
            className="nuc-modal-actions"
            style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}
          >
            <button
              type="button"
              className="nuc-modal-action nuc-modal-action--primary"
              onClick={()=>resumeMission(missionNativeItems.find(item=>item.correct===false))}
            >
              <FiRefreshCw />
              <span>Corregir errores</span>
            </button>

            <button
              type="button"
              className="nuc-modal-action nuc-modal-action--secondary"
              onClick={() => navigate("/actividades-math-data")}
            >
              <FiGrid />
              <span>Volver a actividades</span>
            </button>
          </div>
        </aside>
      </section>

      {mostrarPistaBait && (
        <PistaCompacta
          contenido={
            mensajePistaBait ||
            "Revisa cada parte del análisis. Primero, ordena los tiempos de menor a mayor. Para obtener la media, suma los seis valores y divídelos entre seis. La mediana se obtiene con los dos valores centrales del conjunto ordenado. La moda es el tiempo que más se repite. El rango se calcula restando el valor menor al mayor. Finalmente, utiliza la media como estimación general y el rango como reserva adicional. ¡Tú puedes, agente!"
          }
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="nuc-page mn-activity">
      {avisoActividad && <AvisoActividad message={avisoActividad} onClose={() => setAvisoActividad(null)} />}
      {/* ================= SIDEBAR ================= */}
      <aside className="nuc-sidebar">
        <img src={logo} alt="MathNova" className="nuc-logo-img" />

        <nav className="nuc-nav">
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="nuc-nav-item nuc-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/retroalimentacion")}>
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/perfil-alumno")}>
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button className="nuc-nav-item" type="button" onClick={() => navigate("/estadisticas")}>
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="nuc-progreso-card">
          <small>Progreso de la actividad</small>
          <div className="nuc-progreso-track">
            <div className="nuc-progreso-fill" style={{ width: "83%" }} />
          </div>
          <small>5/6 actividad</small>
        </div>

        <div className="nuc-tiempo-card">
          <small>Tiempo transcurrido</small>
          <strong>{formatearTiempo(segundosTranscurridos)}</strong>
        </div>

        <div className="nuc-xp-card">
          <small>XP del último intento</small>
          <strong>{pilot.receipt?.intento_piloto?.xp_obtenido ?? "—"} XP ⭐</strong>
        </div>

        <div className="nuc-sidebar-actions">
          <button type="button" onClick={() => navigate("/actividades-math-data")}>
            <FiArrowLeft />
            <span>Salir</span>
          </button>
          <button type="button" onClick={() => setMostrarContexto(true)}>
            <FiHelpCircle />
            <span>Contexto</span>
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="nuc-main" style={{ backgroundImage: `url(${fondoNucleoImg})` }}>
        <header className="nuc-header">
          
          <button
            type="button"
            className="nuc-ayuda-btn"
            aria-label="Ver contexto de la actividad"
            onClick={() => setMostrarContexto(true)}
          >
            <FiHelpCircle />
          </button>
        </header>
        <CabeceraCurricular curriculum={activityCurriculum["mathdata-nucleo-decisiones"]} />
        <EnsayoOtrosMundos activityId="mathdata-nucleo-decisiones"/>


        {/* FILA SUPERIOR: TÍTULO + OBJETIVO + VILLANO */}
        <div className="nuc-layout">
          <div className="nuc-col-izquierda">
            <div className="nuc-top-row">
              <div className="nuc-titulo-bloque">
                <h1>El Núcleo de Decisiones</h1>
                <p>
                  Ordena los tiempos de seis expediciones y calcula la media,
                  la mediana, la moda y el rango. Después usa estas medidas
                  para decidir cuánta energía segura necesita la nave.
                </p>
              </div>

              <div className="nuc-objetivo-card">
                <div className="nuc-objetivo-icono">
                  <FiRefreshCw />
                </div>
                <div>
                  <strong>Objetivo de la misión</strong>
                  <p>
                    Usa las medidas de tendencia central y de dispersión para
                    tomar una decisión segura y eficiente.
                  </p>
                </div>
              </div>
            </div>

            {/* PASO 1: REGISTRO DE EXPEDICIONES */}
            <div className="nuc-paso-card">
              <div className="nuc-paso-header">
                <span className="nuc-paso-num">1</span>
                <strong>Registro de expediciones</strong>
              </div>

              <div className="nuc-expediciones-row">
                {EXPEDICIONES.map((exp, i) => (
                  <div className="nuc-expedicion-card" key={exp.id}>
                    <small>Expedición {i + 1}</small>
                    <strong>{exp.minutos}</strong>
                    <span>minutos</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PASO 2: ORDENAMIENTO DE TIEMPOS */}
            <div className="nuc-paso-card">
              <div className="nuc-paso-header">
                <span className="nuc-paso-num">2</span>
                <strong>Ordenamiento de tiempos</strong>
                {ordenResuelto && <FiCheckCircle className="nuc-check-verde" />}
                {!ordenResuelto && ordenVerificadoAlMenos1Vez && (
                  <FiAlertTriangle className="nuc-check-alerta" />
                )}
              </div>

              <div className="nuc-orden-row">
                {orden.map((id, index) => (
                  <div key={id} className="nuc-orden-item">
                    <button
                      type="button"
                      className={`nuc-orden-chip ${
                        indiceSeleccionado === index ? "nuc-orden-chip-seleccionado" : ""
                      } ${
                        posicionesCorrectas[index]
                          ? "nuc-orden-chip-correcto"
                          : posicionesPista[index]
                            ? "nuc-orden-chip-pista"
                            : ordenVerificadoAlMenos1Vez
                              ? "nuc-orden-chip-incorrecto"
                              : ""
                      }`}
                      data-review-target="native-orden" onClick={() => seleccionarPosicion(index)}
                      disabled={posicionesCorrectas[index] || cargandoEnvio}
                      aria-pressed={indiceSeleccionado === index}
                      aria-label={`Tiempo ${VALOR_POR_ID[id]} minutos${
                        indiceSeleccionado === index ? ", seleccionado" : ""
                      }`}
                    >
                      {VALOR_POR_ID[id]}
                    </button>
                    {index < orden.length - 1 && <span className="nuc-orden-flecha">→</span>}
                  </div>
                ))}
                <span className="nuc-orden-unidad">minutos</span>
              </div>

              <small className="nuc-orden-ayuda">
                Toca un tiempo y después otro para intercambiarlos
              </small>

              <button
                type="button"
                className="nuc-verificar-btn"
                onClick={verificarOrden}
                disabled={
                  cargandoOrden ||
                  cargandoEnvio ||
                  ordenResuelto
                }
              >
                <FiCheck /> {cargandoOrden ? "Verificando..." : "Verificar orden"}
              </button>
            </div>

            {/* PASOS 3 A 6: MEDIA, MEDIANA, MODA, RANGO */}
            <div className={`nuc-stats-row ${!pasosDesbloqueados ? "nuc-stats-row-bloqueada" : ""}`}>
              {/* PASO 3: MEDIA */}
              <div className="nuc-paso-card nuc-stat-card">
                <div className="nuc-paso-header">
                  <span className="nuc-paso-num">3</span>
                  <strong>Media (promedio)</strong>
                  {mediaEstado === "correcto" && <FiCheckCircle className="nuc-check-verde" />}
                  {mediaAsistida && <FiCheckCircle className="nuc-check-asistido" />}
                </div>
                <p className="nuc-formula">
                  {SECUENCIA_CORRECTA.join("+")}={SUMA_TOTAL}
                </p>
                <p className="nuc-formula">{SUMA_TOTAL} ÷ 6 =</p>
                <div className="nuc-input-grupo">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`nuc-input nuc-input-${mediaAsistida ? "asistido" : mediaEstado}`}
                    data-review-target="native-media" value={media}
                    disabled={
                      !pasosDesbloqueados ||
                      cargandoMedia ||
                      cargandoEnvio ||
                      mediaValida
                    }
                    onChange={(e) => setMedia(e.target.value)}
                    aria-label="Resultado de la media"
                  />
                  <span>min</span>
                </div>
                <button
                  type="button"
                  className="nuc-mini-verificar-btn"
                  disabled={!pasosDesbloqueados || cargandoMedia || mediaValida}
                  onClick={verificarMedia}
                >
                  {cargandoMedia ? "..." : "Verificar"}
                </button>
              </div>

              {/* PASO 4: MEDIANA */}
              <div className="nuc-paso-card nuc-stat-card">
                <div className="nuc-paso-header">
                  <span className="nuc-paso-num">4</span>
                  <strong>Mediana</strong>
                  {medianaEstado === "correcto" && <FiCheckCircle className="nuc-check-verde" />}
                  {medianaAsistida && <FiCheckCircle className="nuc-check-asistido" />}
                </div>
                <p className="nuc-formula">
                  44, 44, <span className="nuc-formula-resaltado">48, 52</span>, 58, 60
                </p>
                <p className="nuc-formula">(48 + 52) ÷ 2 =</p>
                <div className="nuc-input-grupo">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`nuc-input nuc-input-${medianaAsistida ? "asistido" : medianaEstado}`}
                    data-review-target="native-mediana" value={mediana}
                    disabled={
                      !pasosDesbloqueados ||
                      cargandoMediana ||
                      cargandoEnvio ||
                      medianaValida
                    }
                    onChange={(e) => setMediana(e.target.value)}
                    aria-label="Resultado de la mediana"
                  />
                  <span>min</span>
                </div>
                <button
                  type="button"
                  className="nuc-mini-verificar-btn"
                  disabled={!pasosDesbloqueados || cargandoMediana || medianaValida}
                  onClick={verificarMediana}
                >
                  {cargandoMediana ? "..." : "Verificar"}
                </button>
              </div>

              {/* PASO 5: MODA */}
              <div className="nuc-paso-card nuc-stat-card">
                <div className="nuc-paso-header">
                  <span className="nuc-paso-num">5</span>
                  <strong>Moda</strong>
                  {modaEstado === "correcto" && <FiCheckCircle className="nuc-check-verde" />}
                  {modaAsistida && <FiCheckCircle className="nuc-check-asistido" />}
                </div>
                <p className="nuc-formula">
                  <span className="nuc-formula-resaltado">44, 44</span>, 48, 52, 58, 60
                </p>
                <p className="nuc-formula">El valor que más se repite es:</p>
                <div className="nuc-input-grupo">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`nuc-input nuc-input-${modaAsistida ? "asistido" : modaEstado}`}
                    data-review-target="native-moda" value={moda}
                    disabled={
                      !pasosDesbloqueados ||
                      cargandoModa ||
                      cargandoEnvio ||
                      modaValida
                    }
                    onChange={(e) => setModa(e.target.value)}
                    aria-label="Resultado de la moda"
                  />
                  <span>min</span>
                </div>
                <button
                  type="button"
                  className="nuc-mini-verificar-btn"
                  disabled={!pasosDesbloqueados || cargandoModa || modaValida}
                  onClick={verificarModa}
                >
                  {cargandoModa ? "..." : "Verificar"}
                </button>
              </div>

              {/* PASO 6: RANGO */}
              <div className="nuc-paso-card nuc-stat-card">
                <div className="nuc-paso-header">
                  <span className="nuc-paso-num">6</span>
                  <strong>Rango</strong>
                  {rangoEstado === "correcto" && <FiCheckCircle className="nuc-check-verde" />}
                  {rangoAsistida && <FiCheckCircle className="nuc-check-asistido" />}
                </div>
                <p className="nuc-formula">Máximo − Mínimo</p>
                <p className="nuc-formula">60 − 44 =</p>
                <div className="nuc-input-grupo">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`nuc-input nuc-input-${rangoAsistida ? "asistido" : rangoEstado}`}
                    data-review-target="native-rango" value={rango}
                    disabled={
                      !pasosDesbloqueados ||
                      cargandoRango ||
                      cargandoEnvio ||
                      rangoValido
                    }
                    onChange={(e) => setRango(e.target.value)}
                    aria-label="Resultado del rango"
                  />
                  <span>min</span>
                </div>
                <button
                  type="button"
                  className="nuc-mini-verificar-btn"
                  disabled={!pasosDesbloqueados || cargandoRango || rangoValido}
                  onClick={verificarRango}
                >
                  {cargandoRango ? "..." : "Verificar"}
                </button>
              </div>
            </div>

            {!pasosDesbloqueados && (
              <div className="nuc-info-box">
                <FiInfo /> Ordena los tiempos y verifica el paso 2 para desbloquear la media, la mediana, la moda y el rango.
              </div>
            )}

            {/* FILA INFERIOR: BIT EXPLICA */}
            <div className="nuc-bottom-row">
              <div className="nuc-explica-fila">
                <img src={baitSaludoImg} alt="Bait explicando" className="nuc-bait-avatar-img" />

                <div className="nuc-explica-burbuja">
                  <div className="nuc-explica-titulo-row">
                    <strong>BIT te explica</strong>
                    <button
                      className="nuc-audio-btn"
                      type="button"
                      onClick={() => setMostrarIntroBait(true)}
                      aria-label="Escuchar explicación"
                    >
                      <FiVolume2 />
                    </button>
                  </div>
                  <p>
                    ¡Agente! Tenemos los tiempos de seis expediciones
                    similares. Ordenaremos los datos y calcularemos la
                    media, la mediana, la moda y el rango. Con estas medidas
                    estimaremos la duración de la nueva misión y decidiremos
                    cuánta energía adicional activará el Núcleo de
                    Decisiones.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ================= COLUMNA DERECHA ================= */}
          <div className="nuc-col-derecha">
            <img
              src={villanoDivideImg}
              alt="Interferencia: DIVIDE ha mezclado los tiempos de las expediciones. Sin un análisis correcto, el Núcleo jamás autorizará la energía."
              className="nuc-villano-card-img"
            />

            <div className="nuc-bitacora-card">
              <div className="nuc-bitacora-header">
                <FiClipboard />
                <strong>Bitácora de decisión</strong>
              </div>

              <div className="nuc-bitacora-fila">
                <span>Estimación general (media)</span>
                <div className="nuc-bitacora-valor">
                  {mediaValida ? `${media} min` : "— min"}
                </div>
              </div>

              <div className="nuc-bitacora-fila">
                <span>Reserva adicional (protocolo)</span>
                <div className="nuc-bitacora-valor">
                  {rangoValido ? `${rango} min` : "— min"}
                </div>
              </div>

              <div className="nuc-capacidad-box">
                <small>Capacidad total recomendada</small>
                <div className="nuc-capacidad-fila">
                  <div className="nuc-capacidad-icono">
                    <FiShield />
                  </div>
                  <strong className={capacidadTotal !== null ? (capacidadCorrecta ? "nuc-capacidad-verde" : "nuc-capacidad-alerta") : ""}>
                    {capacidadTotal !== null ? `${capacidadTotal} min` : "— min"}
                  </strong>
                  {capacidadCorrecta && <FiCheckCircle className="nuc-check-verde" />}
                </div>
              </div>

              <div className="nuc-justificacion-box">
                <FiShield />
                <div>
                  <strong>Justificación</strong>
                  <p>
                    La media estima la duración general de la misión y el
                    rango funciona como reserva adicional para una operación
                    segura.
                  </p>
                </div>
              </div>

              <p className="mn-finish-direction">Cuando completes los retos, usa «Terminar misión» al final de la actividad.</p>
            </div>
          </div>
        </div>
      <PilotEvidenceStatus pilot={pilot}/>
<RetosDeMision expansion={mission}/><CierreDeMision onFinish={()=>void handleEnviarDecision()} busy={pilot.busy}/></main>

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="BIT te explica"
          contenido="¡Agente! Tenemos los tiempos de seis expediciones similares. Ordenaremos los datos y calcularemos la media, la mediana, la moda y el rango. Con estas medidas estimaremos la duración de la nueva misión y decidiremos cuánta energía adicional activará el Núcleo de Decisiones."
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioNucleo}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarContexto && (
        <AyudaContextual onClose={() => setMostrarContexto(false)} />
      )}

      {mostrarPistaBait && (
        <PistaCompacta
          contenido={
            mensajePistaBait ||
            "Revisa cada parte del análisis. Primero, ordena los tiempos de menor a mayor. Para obtener la media, suma los seis valores y divídelos entre seis. La mediana se obtiene con los dos valores centrales del conjunto ordenado. La moda es el tiempo que más se repite. El rango se calcula restando el valor menor al mayor. Finalmente, utiliza la media como estimación general y el rango como reserva adicional. ¡Tú puedes, agente!"
          }
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );
}
