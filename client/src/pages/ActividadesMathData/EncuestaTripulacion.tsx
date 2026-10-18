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
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/authSession";

import logo from "../../assets/logo_MathNova.png";
import "./EncuestaTripulacion.css";

/* ---- Reutilizadas tal cual de Rampas de Lanzamiento ---- */
import baitSaludoImg from "../../assets/bait-saludo.png";
import baitPistaImg from "../../assets/bait-pista.png";
import villanoTrofeoCompleto from "../../assets/villano-trofeo-completo.png";
import villanoIntentar from "../../assets/villano-vintentar.png";
import iconoAciertos from "../../assets/icono-aciertos.png";
import iconoTiempo from "../../assets/icono-tiempo.png";
import iconoPrecision from "../../assets/icono-precision.png";
import iconoRecompensa from "../../assets/icono-recompensa.png";
import iconoInsignia from "../../assets/icono-insignia.png";
import iconoProgreso from "../../assets/icono-progreso.png";

/* ---- Nuevas para la Actividad 3 ---- */
import interferenciaDivideEncuestaImg from "../../assets/interferencia-divide-encuesta.png";
import astronautasImg from "../../assets/astronautas-tripulacion.png";
import interferenciaActivaImg from "../../assets/interferencia-activa.png";
import baitHablandoVideo from "../../assets/bait-hablando.mp4";
import introBaitAudioEncuesta from "../../assets/encuesta-intro-audio.mp3";
import pistaBaitAudioEncuesta from "../../assets/encuesta-pista-audio.mp3";
import baitAudioActividadCompletada from "../../assets/encuesta-actividad-completada.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/encuesta-vuelve-a-intentarlo.mp3";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiArrowLeft,
  FiHelpCircle,
  FiVolume2,
  FiSend,
  FiTarget,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiGrid as FiTabla,
  FiFileText,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
  FiRefreshCw,
  FiArrowRight,
  FiSettings,
  FiLogOut,
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

type UsuarioSesionEncuesta = {
  id_usuario?: number | string;
  idUsuario?: number | string;
  usuario_id?: number | string;
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  usuario?: UsuarioSesionEncuesta;
  user?: UsuarioSesionEncuesta;
  data?: UsuarioSesionEncuesta;
  session?: UsuarioSesionEncuesta;
};

const extraerIdUsuarioEncuesta = (
  valor: unknown,
): number => {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return 0;
  }

  const usuario =
    valor as UsuarioSesionEncuesta;

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
      extraerIdUsuarioEncuesta(
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
      extraerIdUsuarioEncuesta(
        candidato,
      );

    if (idUsuario > 0) {
      return idUsuario;
    }
  }

  return 0;
};

type Modulo = "bosque" | "desierto" | "cueva";

const VOTOS: Record<Modulo, number> = {
  bosque: 4,
  desierto: 3,
  cueva: 3,
};

const NOMBRE_MODULO: Record<Modulo, string> = {
  bosque: "Bosque",
  desierto: "Desierto",
  cueva: "Cueva de Cristal",
};

const MODULO_MAS_VOTADO: Modulo = "bosque";
const TOTAL_VOTOS = VOTOS.bosque + VOTOS.desierto + VOTOS.cueva;

function palitos(n: number) {
  return "|".repeat(n);
}

function formatearTiempoEncuesta(segundos: number) {
  const minutos = Math.floor(segundos / 60);
  const restoSegundos = segundos % 60;
  return `${String(minutos).padStart(2, "0")}:${String(restoSegundos).padStart(2, "0")}`;
}

type EstadoFila = "correcto" | "pendiente" | "incorrecto";

/* =========================================================
   COMPONENTE: PISTA DE BAIT (modal con video real)
   Idéntico al de Generador de Energía y Rampas de
   Lanzamiento, para que todas las actividades concuerden.
========================================================= */

type PistaBaitModalProps = {
  tema?: "azul" | "rojo";
  titulo?: string;
  contenido: string;
  videoSrc: string;
  audioSrc: string;
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

  const alternarReproduccion = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;

    if (audio.paused || audio.ended) {
      void audio.play();
      void video?.play().catch(() => undefined);
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
    const video = videoRef.current;
    if (!audio || !audio.duration) return;
    setProgreso((audio.currentTime / audio.duration) * 100);
    if (
      video &&
      !audio.paused &&
      Math.abs(video.currentTime - audio.currentTime) > 0.35
    ) {
      video.currentTime = audio.currentTime;
    }
  };

  return createPortal(
    <div className="pb-overlay" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className={`pb-modal pb-modal-${tema}`}>
        <button
          type="button"
          className="pb-cerrar"
          onClick={onClose}
          aria-label="Cerrar"
        >
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

        <audio
          ref={audioRef}
          src={audioSrc}
          autoPlay
          preload="auto"
          onPlay={() => {
            setReproduciendo(true);
            void videoRef.current?.play().catch(() => undefined);
          }}
          onPause={() => {
            setReproduciendo(false);
            videoRef.current?.pause();
          }}
          onEnded={() => setReproduciendo(false)}
          onTimeUpdate={actualizarProgreso}
        />

        <button type="button" className={`pb-cerrar-btn pb-cerrar-btn-${tema}`} onClick={onClose}>
          {botonTexto}
        </button>
      </div>
    </div>,
    document.body
  );
}

function AyudaEncuesta({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [onClose]);

  return createPortal(
    <div
      className="enc-ayuda-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="enc-ayuda-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enc-ayuda-titulo"
      >
        <button
          type="button"
          className="enc-ayuda-cerrar"
          onClick={onClose}
          aria-label="Cerrar ayuda"
        >
          <FiX />
        </button>

        <img
          src={baitPistaImg}
          alt="Bait dando una orientación para resolver la encuesta"
          className="enc-ayuda-imagen"
        />

        <div className="enc-ayuda-contenido">
          <span className="enc-ayuda-etiqueta">CONTEXTO DE LA MISIÓN</span>
          <h2 id="enc-ayuda-titulo">¿Cómo interpretar la encuesta?</h2>
          <p>
            La tripulación registró sus preferencias usando palitos. Observa
            cada fila por separado: cada marca representa el voto de una
            persona y la cantidad total de marcas forma la frecuencia absoluta.
          </p>
          <p>
            Primero completa las cantidades que faltan y después compara los
            resultados. La opción con la frecuencia más alta indica el módulo
            que la tripulación prefiere explorar.
          </p>
          <button type="button" className="enc-ayuda-volver" onClick={onClose}>
            Entendido, volver a la actividad
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function AmenazaEncuesta({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [onClose]);

  return createPortal(
    <div
      className="enc-ayuda-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="enc-ayuda-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enc-amenaza-titulo"
      >
        <button
          type="button"
          className="enc-ayuda-cerrar"
          onClick={onClose}
          aria-label="Cerrar amenaza"
        >
          <FiX />
        </button>

        <img
          src={interferenciaActivaImg}
          alt="Interferencia activa de Divide"
          className="enc-ayuda-imagen"
        />

        <div className="enc-ayuda-contenido">
          <span className="enc-ayuda-etiqueta">AMENAZA DETECTADA</span>
          <h2 id="enc-amenaza-titulo">Interferencia activa</h2>
          <p>
            Divide intenta confundir las marcas de conteo para que las
            frecuencias no coincidan con los votos de la tripulación.
          </p>
          <p>
            Revisa cada fila por separado y recuerda que cada palito representa
            un voto antes de enviar los resultados al Centro de Mando.
          </p>
          <button type="button" className="enc-ayuda-volver" onClick={onClose}>
            Entendido, volver a la actividad
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

/* =========================================================
   COMPONENTE: REPRODUCTOR DE AUDIO DEL RESULTADO
   Se reproduce solo apenas se monta, y muestra los
   controles normales de un reproductor de audio: retroceder
   10s, pausar/reproducir y adelantar 10s. Mismo patrón que
   el Generador de Energía y Rampas de Lanzamiento.
========================================================= */

const RESULT_AUDIO_SALTO_SEGUNDOS = 10;

function ResultAudioPlayer({ src }: { src: string }) {
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
    <div className="enc-modal-audio">
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
        className="enc-modal-audio-btn"
        onClick={() => saltar(-RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Retroceder 10 segundos"
      >
        <FiRotateCcw />
      </button>

      <button
        type="button"
        className="enc-modal-audio-btn enc-modal-audio-btn--play"
        onClick={alternarReproduccion}
        aria-label={reproduciendo ? "Pausar" : "Reproducir"}
      >
        {reproduciendo ? <FiPause /> : <FiPlay />}
      </button>

      <button
        type="button"
        className="enc-modal-audio-btn"
        onClick={() => saltar(RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Adelantar 10 segundos"
      >
        <FiRotateCw />
      </button>

      <div className="enc-modal-audio-progress">
        <div style={{ width: `${progreso}%` }} />
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function EncuestaTripulacion() {
 const mission=useMissionExpansion("mathdata-encuesta-tripulacion");
  const [avisoActividad, setAvisoActividad] = useState<string | null>(null);
  const navigate = useNavigate();

  const ID_ESTUDIANTE =
    obtenerIdEstudianteActual();

  const inicioActividadRef =
    useRef<number>(Date.now());

  const [frecDesierto, setFrecDesierto] = useState("");
  const [frecCueva, setFrecCueva] = useState("");

  const [estadoDesierto, setEstadoDesierto] = useState<EstadoFila>("pendiente");
  const [estadoCueva, setEstadoCueva] = useState<EstadoFila>("pendiente");
  const [mensajeCeldaDesierto, setMensajeCeldaDesierto] = useState("");
  const [mensajeCeldaCueva, setMensajeCeldaCueva] = useState("");

  const [moduloSeleccionado, setModuloSeleccionado] = useState<Modulo | null>(null);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarAyudaContextual, setMostrarAyudaContextual] = useState(false);
  const [mostrarAmenaza, setMostrarAmenaza] = useState(false);
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setSegundosTranscurridos(
        Math.max(0, Math.floor((Date.now() - inicioActividadRef.current) / 1000)),
      );
    }, 1000);

    return () => window.clearInterval(intervalo);
  }, []);

  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
    const cargarProgreso = async () => {
      if (!ID_ESTUDIANTE) {
        console.warn(
          "No se encontró el estudiante autenticado para cargar Encuesta de Tripulación.",
        );
        return;
      }

      try {
        const response = await fetch(`${API_URL}/tripulacion/progreso/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          const progreso = data.data;
          const valores = (progreso.valores_tabla || {}) as Record<string, number>;
          const historial = (progreso.historial_intentos || []) as any[];

          // Busca el último intento registrado para una celda, aunque
          // todavía no haya acertado (para no perderlo al recargar).
          const ultimoIntento = (celda: string) =>
            [...historial].reverse().find((h) => h.celda === celda);

          if (valores.desierto !== undefined) {
            setFrecDesierto(String(valores.desierto));
            setEstadoDesierto("correcto");
          } else {
            const ultimo = ultimoIntento("desierto");
            if (ultimo) {
              setFrecDesierto(String(ultimo.valor));
              setEstadoDesierto("incorrecto");
            }
          }

          if (valores.cueva !== undefined) {
            setFrecCueva(String(valores.cueva));
            setEstadoCueva("correcto");
          } else {
            const ultimo = ultimoIntento("cueva");
            if (ultimo) {
              setFrecCueva(String(ultimo.valor));
              setEstadoCueva("incorrecto");
            }
          }

          if (progreso.modulo_seleccionado) {
            setModuloSeleccionado(progreso.modulo_seleccionado as Modulo);
          }

          if (progreso.completada) {
            setResultado(progreso.resultado_correcto ? "exito" : "fallo");
          }
        }
      } catch (error) {
        console.error("Error al cargar progreso:", error);
      }
    };

    void cargarProgreso();
  }, [ID_ESTUDIANTE]);

  // ==========================================
  // VALIDAR TABLA CON EL BACKEND (celda por celda)
  // ==========================================

  const verificarTabla = async () => {
    pilot.recordAll();
    if (!ID_ESTUDIANTE) {
      setAvisoActividad(
        "No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setCargandoTabla(true);
    try {
      if (estadoDesierto !== "correcto" && frecDesierto.trim() !== "") {
        const response = await fetch(`${API_URL}/tripulacion/validar-celda`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_estudiante: ID_ESTUDIANTE,
            celda: "desierto",
            valor: Number(frecDesierto),
          }),
        });
        const data = await response.json();

        if (data.success && data.data) {
          const resultadoCelda = data.data;
          setMensajeCeldaDesierto(resultadoCelda.mensaje);
          setEstadoDesierto(resultadoCelda.correcto ? "correcto" : "incorrecto");
        }
      }

      if (estadoCueva !== "correcto" && frecCueva.trim() !== "") {
        const response = await fetch(`${API_URL}/tripulacion/validar-celda`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_estudiante: ID_ESTUDIANTE,
            celda: "cueva",
            valor: Number(frecCueva),
          }),
        });
        const data = await response.json();

        if (data.success && data.data) {
          const resultadoCelda = data.data;
          setMensajeCeldaCueva(resultadoCelda.mensaje);
          setEstadoCueva(resultadoCelda.correcto ? "correcto" : "incorrecto");
        }
      }
    } catch (error) {
      console.error("Error al verificar la tabla:", error);
    } finally {
      setCargandoTabla(false);
    }
  };

  const tablaCompleta = estadoDesierto === "correcto" && estadoCueva === "correcto";

  // ==========================================
  // ENVIAR AL CENTRO DE MANDO (módulo ganador)
  // ==========================================

  const pilot=useMathDataEvidence("mathdata-encuesta-tripulacion",mission,()=>({frecuencia_bosque:VOTOS.bosque,frecuencia_desierto:frecDesierto,frecuencia_cueva:frecCueva,modulo_seleccionado:moduloSeleccionado}));
  useEffect(()=>{const attempt=pilot.receipt?.intento_piloto;if(!attempt)return;
    setResultado(attempt.evaluacion.completada?"exito":"fallo");
  },[pilot.receipt]);

  const enviarCentroDeMando = async () => {
    if(pilot.busy)return;
    setCargandoEnvio(true);
    try {await pilot.finish(Math.max(1,Math.floor((Date.now()-inicioActividadRef.current)/1000)),50);}
    catch(error){setAvisoActividad(error instanceof Error?error.message:"No se pudo guardar; conserva esta pestaña.");}
    finally{setCargandoEnvio(false);}
  };

  // ==========================================
  // REINICIAR ACTIVIDAD
  // ==========================================

  const handleReiniciarActividad = async () => {
 mission.reset();
 pilot.resetSession();
    try {
      await fetch(`${API_URL}/tripulacion/reiniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estudiante: ID_ESTUDIANTE }),
      });
    } catch (error) {
      console.error("Error al reiniciar actividad:", error);
    }

    setFrecDesierto("");
    setFrecCueva("");
    setEstadoDesierto("pendiente");
    setEstadoCueva("pendiente");
    setMensajeCeldaDesierto("");
    setMensajeCeldaCueva("");
    setModuloSeleccionado(null);
    setResultado(null);

    inicioActividadRef.current =
      Date.now();
  };

  // ==========================================
  // PANTALLA: ACTIVIDAD COMPLETADA
  // ==========================================

  
 const missionNativeItems:MissionReviewItem[]=[{id:"desierto",title:"Frecuencia del Desierto",answer:String(frecDesierto),correct:Number(frecDesierto)===VOTOS.desierto,hint:"Cuenta los votos del Desierto; hay 3.",target:'[data-review-target="native-desierto"]'},{id:"cueva",title:"Frecuencia de la Cueva",answer:String(frecCueva),correct:Number(frecCueva)===VOTOS.cueva,hint:"Cuenta los votos de la Cueva; hay 3.",target:'[data-review-target="native-cueva"]'},{id:"modulo",title:"Módulo más votado",answer:String(moduloSeleccionado),correct:moduloSeleccionado==="bosque",hint:"Bosque tiene 4 votos; Desierto y Cueva tienen 3.",target:'[data-review-target="native-modulo"]'}];
 const missionReviewScore=pilot.evaluation?.aciertos ?? (missionNativeItems.filter(item=>item.correct===true).length+mission.correctCount);
 const missionReviewPrecision=Math.round(missionReviewScore/mission.total*100);
 const resumeMission=(item?:MissionReviewItem)=>{setResultado(null);mission.beginCorrection(item);};
if (resultado === "exito") return (
    <div className="enc-modal-overlay enc-modal-overlay--completed" role="presentation">
      <section
        className="enc-modal enc-modal--completed"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enc-result-title"
      >
        <div className="enc-modal-decoration enc-modal-decoration--one" />
        <div className="enc-modal-decoration enc-modal-decoration--two" />

        <div className="enc-modal-main">
          <header className="enc-modal-header">
            <div className="enc-modal-status-icon">
              <FiCheckCircle />
            </div>

            <div className="enc-modal-header-copy">
              <span className="enc-modal-badge">
                <FiCheckCircle />
                Actividad completada
              </span>

              <h1 id="enc-result-title">¡Actividad completada!</h1>

              <p>
                Has terminado con éxito la misión de{" "}
                <span className="enc-modal-mathnova-color">MathData</span>.
              </p>
            </div>
          </header>

          <div className="enc-modal-content"><AudioRetroalimentacion/>
            <div className="enc-modal-character">
              <img
                src={villanoTrofeoCompleto}
                alt="Villano celebrando con trofeo"
                draggable={false}
              />
            </div>

            <article className="enc-modal-message">
              <span className="enc-modal-message-label">Resultado de la misión</span>
              <h2>¡Excelente trabajo, piloto!</h2>
              <p>
                Contaste los votos correctamente y descubriste qué módulo
                ganó la encuesta. Sigue así y conquista la siguiente misión.
              </p>
            </article>
          </div>

          <ResultAudioPlayer src={baitAudioActividadCompletada} />

          <article className="enc-modal-summary">
            <header>
              <FiBarChart2 />
              <h2>Resumen de la actividad</h2>
            </header>

            <div className="enc-modal-stats">
              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
                  <img src={iconoAciertos} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Respuestas correctas</span>
                  <strong>{missionReviewScore}/{mission.total}</strong>
                  <small>¡Perfecto!</small>
                </div>
              </article>

              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
                  <img src={iconoTiempo} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Tiempo</span>
                  <strong>{`${Math.floor(segundosTranscurridos/60).toString().padStart(2,"0")}:${(segundosTranscurridos%60).toString().padStart(2,"0")}`}</strong>
                  <small>min</small>
                </div>
              </article>

              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
                  <img src={iconoPrecision} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Precisión</span>
                  <strong>{missionReviewPrecision}%</strong>
                  <small>¡Impecable!</small>
                </div>
              </article>

              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
                  <img src={iconoRecompensa} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Recompensa</span>
                  <strong>{pilot.receipt?.intento_piloto?.xp_obtenido ?? 0} XP</strong>
                  <small>XP del intento</small>
                </div>
              </article>

              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
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

        <aside className="enc-modal-side">
          <article className="enc-modal-side-message">
            <span>¡Misión completada!</span>
            <strong>Sigue avanzando por MathData</strong>
            <p>Cada actividad superada fortalece tus habilidades matemáticas.</p>
          </article>

          <div className="enc-modal-progress">
            <div>
              <span>Progreso del tema</span>
              <strong>{missionReviewPrecision}%</strong>
            </div>
            <div className="enc-modal-progress-bar">
              <span style={{ width: "30%" }} />
            </div>
          </div>

          <div className="enc-modal-actions">
            <button
              type="button"
              className="enc-modal-action enc-modal-action--primary"
              onClick={() => navigate("/actividades-math-data/holograma-reportes")}
            >
              <FiArrowRight />
              <span>Siguiente actividad</span>
            </button>

            <button
              type="button"
              className="enc-modal-action enc-modal-action--secondary"
              onClick={handleReiniciarActividad}
            >
              <FiRefreshCw />
              <span>Repetir actividad</span>
            </button>

            <button
              type="button"
              className="enc-modal-action enc-modal-action--secondary"
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
  // PANTALLA: VUELVE A INTENTARLO
  // ==========================================

  if (resultado === "fallo") return (
    <div className="enc-modal-overlay enc-modal-overlay--retry" role="presentation">
      <section
        className="enc-modal enc-modal--retry"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enc-result-title-fallo"
      >
        <div className="enc-modal-decoration enc-modal-decoration--one" />
        <div className="enc-modal-decoration enc-modal-decoration--two" />

        <div className="enc-modal-main"><DetalleErroresDeMision items={pilot.reviewItems([...missionNativeItems,...mission.items])} onCorrect={resumeMission} onRestart={handleReiniciarActividad}/>
          <header className="enc-modal-header">
            <div className="enc-modal-status-icon">
              <FiRefreshCw />
            </div>

            <div className="enc-modal-header-copy">
              <span className="enc-modal-badge">
                <FiRefreshCw />
                Vuelve a intentarlo
              </span>

              <h1 id="enc-result-title-fallo">¡Vuelve a intentarlo!</h1>

              <p>
                Aún no completas con éxito la misión de{" "}
                <span className="enc-modal-mathnova-color">MathData</span>.
              </p>
            </div>
          </header>

          <div className="enc-modal-content"><AudioRetroalimentacion/>
            <div className="enc-modal-character">
              <img src={villanoIntentar} alt="Villano retando" draggable={false} />
            </div>

            <article className="enc-modal-message">
              <span className="enc-modal-message-label">Resultado de la misión</span>
              <h2>¡No te rindas, piloto!</h2>
              <p>
                Cuenta de nuevo los palitos de cada módulo con cuidado, y
                revisa cuál de los tres obtuvo más votos antes de enviar tu
                reporte al Centro de Mando.
              </p>
            </article>
          </div>

          <ResultAudioPlayer src={baitAudioVuelveAIntentarlo} />

          <article className="enc-modal-summary">
            <header>
              <FiBarChart2 />
              <h2>Resumen de la actividad</h2>
            </header>

            <div className="enc-modal-stats">
              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
                  <img src={iconoAciertos} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Respuestas correctas</span>
                  <strong>{missionReviewScore}/{mission.total}</strong>
                  <small>¡Sigue así!</small>
                </div>
              </article>

              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
                  <img src={iconoTiempo} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Tiempo</span>
                  <strong>{`${Math.floor(segundosTranscurridos/60).toString().padStart(2,"0")}:${(segundosTranscurridos%60).toString().padStart(2,"0")}`}</strong>
                  <small>min</small>
                </div>
              </article>

              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
                  <img src={iconoPrecision} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Precisión</span>
                  <strong>{missionReviewPrecision}%</strong>
                  <small>Puedes mejorar</small>
                </div>
              </article>

              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
                  <img src={iconoRecompensa} alt="" aria-hidden="true" />
                </div>
                <div>
                  <span>Recompensa</span>
                  <strong>{pilot.receipt?.intento_piloto?.xp_obtenido ?? 0} XP</strong>
                  <small>XP del intento</small>
                </div>
              </article>

              <article className="enc-modal-stat">
                <div className="enc-modal-stat-icon">
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

        <aside className="enc-modal-side">
          <article className="enc-modal-side-message">
            <span>¡No te rindas!</span>
            <strong>Cada intento te ayuda a mejorar</strong>
            <p>Usa la pista, revisa el procedimiento y vuelve a resolver la actividad.</p>
          </article>

          <div className="enc-modal-progress">
            <div>
              <span>Progreso del tema</span>
              <strong>{missionReviewPrecision}%</strong>
            </div>
            <div className="enc-modal-progress-bar">
              <span style={{ width: "30%" }} />
            </div>
          </div>

          <div className="enc-modal-actions">
            <button
              type="button"
              className="enc-modal-action enc-modal-action--primary"
              onClick={()=>resumeMission(missionNativeItems.find(item=>item.correct===false))}
            >
              <FiRefreshCw />
              <span>Corregir errores</span>
            </button>

            <button
              type="button"
              className="enc-modal-action enc-modal-action--secondary"
              onClick={() => setMostrarPistaBait(true)}
            >
              <FiTarget />
              <span>Ver pista</span>
            </button>

            <button
              type="button"
              className="enc-modal-action enc-modal-action--secondary"
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
          contenido="Cuenta con cuidado la columna de palitos: cada palito vale 1 voto. La frecuencia absoluta es el número total de votos de cada módulo. El módulo con más palitos es el que ganó la encuesta. Ejemplo: 5 palitos seguidos son 5 votos."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioEncuesta}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="enc-page mn-activity">
      {avisoActividad && <AvisoActividad message={avisoActividad} onClose={() => setAvisoActividad(null)} />}
      {/* ================= SIDEBAR ================= */}
      <aside className="enc-sidebar">
        <img src={logo} alt="MathNova" className="enc-logo-img" />

        <nav className="enc-nav">
          <button className="enc-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="enc-nav-item enc-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button
            className="enc-nav-item"
            type="button"
            onClick={() => navigate("/retroalimentacion")}
          >
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="enc-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button
            className="enc-nav-item"
            type="button"
            onClick={() => navigate("/perfil-alumno")}
          >
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button
            className="enc-nav-item"
            type="button"
            onClick={() => navigate("/estadisticas")}
          >
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="enc-interferencia-activa-wrap">
          <img
            src={interferenciaActivaImg}
            alt="Interferencia activa: Divide puede confundir los palitos y hacerte perder la cuenta. ¡No dejes que eso pase!"
            className="enc-interferencia-activa-img"
          />
          <button
            type="button"
            className="enc-ver-amenaza-btn"
            onClick={() => setMostrarAmenaza(true)}
          >
            <FiTarget /> Ver amenaza
          </button>
        </div>

        <div className="enc-sidebar-tiempo">
          <span className="enc-sidebar-label">Tiempo transcurrido</span>
          <strong>{formatearTiempoEncuesta(segundosTranscurridos)}</strong>
        </div>

        <div className="enc-sidebar-icons">
          <button type="button" onClick={() => navigate("/ajustes")} aria-label="Ajustes">
            <FiSettings />
          </button>
          <button
            type="button"
            onClick={() => setMostrarAyudaContextual(true)}
            aria-label="Ayuda de la actividad"
          >
            <FiHelpCircle />
          </button>
          <button type="button" onClick={() => navigate("/login")} aria-label="Cerrar sesión">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="enc-main">
        <header className="enc-header">
          <div className="enc-header-izquierda">
            
          </div>
          <button
            type="button"
            className="enc-ayuda-btn"
            aria-label="Ayuda"
            onClick={() => setMostrarAyudaContextual(true)}
          >
            <FiHelpCircle />
          </button>
        </header>
        <CabeceraCurricular curriculum={activityCurriculum["mathdata-encuesta-tripulacion"]} />
        


        {/* FILA SUPERIOR */}
        <div className="enc-top-row">
          <div className="enc-centro-control">
            <div className="enc-centro-control-header">
              <FiTarget /> CENTRO DE CONTROL
            </div>
            <ul>
              <li>
                <span className="enc-bullet-azul" />
                Revisa la encuesta.
              </li>
              <li>
                <span className="enc-bullet-verde" />
                Cuenta los votos con palitos.
              </li>
              <li>
                <span className="enc-bullet-rojo" />
                Completa la frecuencia absoluta.
              </li>
            </ul>
          </div>

          <img src={baitSaludoImg} alt="Bait saludando" className="enc-robot-avatar-img" />

          <div className="enc-titulo-bloque">
            <div className="enc-titulo-row">
              <div className="enc-titulo-icono">
                <FiUsers />
              </div>
              <div>
                <h1>La Encuesta de la Tripulación</h1>
                <p>
                  Aplica una encuesta, cuenta los votos y completa la tabla
                  de frecuencias.
                </p>
              </div>
            </div>

            <div className="enc-hola-piloto">
              <div>
                <strong>¡Hola, piloto!</strong>
                <p>
                  En esta misión debes aplicar una encuesta a la tripulación
                  para decidir qué módulo explorar primero. Observa cómo
                  votan los 10 integrantes del escuadrón, cuenta los votos
                  con palitos y completa la tabla de frecuencias. Después
                  revela cuál módulo obtuvo más votos.
                </p>
              </div>
              <button
                className="enc-audio-btn"
                type="button"
                onClick={() => setMostrarIntroBait(true)}
                aria-label="Escuchar instrucciones"
              >
                <FiVolume2 />
              </button>
            </div>
          </div>

          <img
            src={interferenciaDivideEncuestaImg}
            alt="Interferencia de Divide: si cuentas mal los votos, la ruta se aprobará mal. A ver si puedes descubrir qué módulo ganó de verdad."
            className="enc-villano-box"
          />
        </div>
<EnsayoOtrosMundos activityId="mathdata-encuesta-tripulacion"/>


        {/* ENCUESTA Y TABLA */}
        <div className="enc-medio-row">
          {/* ENCUESTA Y VOTOS */}
          <div className="enc-encuesta-card">
            <div className="enc-card-header">
              <FiUsers /> Encuesta y votos de la tripulación
            </div>

            <div className="enc-encuesta-contenido">
              <div className="enc-expedicion-box">
                <span className="enc-subtitulo-caja">Encuesta de Expedición</span>
                <p className="enc-pregunta-caja">
                  ¿Qué módulo prefieres explorar primero?
                </p>
                <div className="enc-modulos-opciones">
                  {(Object.keys(VOTOS) as Modulo[]).map((m) => (
                    <div key={m} className={`enc-modulo-opcion enc-modulo-${m}`}>
                      <span className="enc-modulo-icono" aria-hidden="true" />
                      <span>{NOMBRE_MODULO[m]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="enc-conteo-box">
                <span className="enc-subtitulo-caja">
                  Conteo en tiempo real (Panel de palitos)
                </span>
                {(Object.keys(VOTOS) as Modulo[]).map((m) => (
                  <div key={m} className="enc-conteo-fila">
                    <span className={`enc-modulo-icono enc-modulo-${m}`} aria-hidden="true" />
                    <span className="enc-conteo-nombre">{NOMBRE_MODULO[m]}</span>
                    <span className="enc-conteo-palitos">{palitos(VOTOS[m])}</span>
                    <FiCheckCircle className="enc-conteo-check" />
                  </div>
                ))}
              </div>
            </div>

            <div className="enc-tripulacion-box">
              <span className="enc-subtitulo-caja">Tripulación (10 integrantes)</span>
              <img
                src={astronautasImg}
                alt="Los 10 integrantes de la tripulación que votaron en la encuesta"
                className="enc-astronautas-img"
              />
            </div>

            <div className="enc-nota-bait">
              <img src={baitPistaImg} alt="" className="enc-nota-bait-avatar" />
              <span>Cada palito representa un voto.</span>
            </div>
          </div>

          {/* TABLA DE FRECUENCIAS */}
          <div className="enc-tabla-card">
            <div className="enc-card-header">
              <FiTabla /> Tabla de frecuencias
            </div>

            <table className="enc-tabla">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Conteo (palitos)</th>
                  <th>Frecuencia absoluta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="enc-td-modulo">
                    <span className="enc-modulo-icono enc-modulo-bosque" aria-hidden="true" />
                    Bosque
                  </td>
                  <td className="enc-td-palitos">{palitos(VOTOS.bosque)}</td>
                  <td className="enc-td-frecuencia">
                    <strong>{VOTOS.bosque}</strong>
                  </td>
                  <td>
                    <span className="enc-estado enc-estado-correcto">
                      <FiCheckCircle /> Correcto
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="enc-td-modulo">
                    <span className="enc-modulo-icono enc-modulo-desierto" aria-hidden="true" />
                    Desierto
                  </td>
                  <td className="enc-td-palitos">{palitos(VOTOS.desierto)}</td>
                  <td className="enc-td-frecuencia">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`enc-frecuencia-input enc-frecuencia-input-${estadoDesierto}`}
                      data-review-target="native-desierto" value={frecDesierto}
                      onChange={(e) => setFrecDesierto(e.target.value)}
                      aria-label="Frecuencia absoluta del módulo Desierto"
                      disabled={cargandoTabla || estadoDesierto === "correcto"}
                    />
                    {mensajeCeldaDesierto && (
                      <p className="enc-mensaje-celda">{mensajeCeldaDesierto}</p>
                    )}
                  </td>
                  <td>
                    <span className={`enc-estado enc-estado-${estadoDesierto}`}>
                      {estadoDesierto === "correcto" && (
                        <>
                          <FiCheckCircle /> Correcto
                        </>
                      )}
                      {estadoDesierto === "pendiente" && (
                        <>
                          <FiClock /> Completar
                        </>
                      )}
                      {estadoDesierto === "incorrecto" && (
                        <>
                          <FiClock /> Revisar
                        </>
                      )}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="enc-td-modulo">
                    <span className="enc-modulo-icono enc-modulo-cueva" aria-hidden="true" />
                    Cueva de Cristal
                  </td>
                  <td className="enc-td-palitos">{palitos(VOTOS.cueva)}</td>
                  <td className="enc-td-frecuencia">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`enc-frecuencia-input enc-frecuencia-input-${estadoCueva}`}
                      data-review-target="native-cueva" value={frecCueva}
                      onChange={(e) => setFrecCueva(e.target.value)}
                      aria-label="Frecuencia absoluta del módulo Cueva de Cristal"
                      disabled={cargandoTabla || estadoCueva === "correcto"}
                    />
                    {mensajeCeldaCueva && (
                      <p className="enc-mensaje-celda">{mensajeCeldaCueva}</p>
                    )}
                  </td>
                  <td>
                    <span className={`enc-estado enc-estado-${estadoCueva}`}>
                      {estadoCueva === "correcto" && (
                        <>
                          <FiCheckCircle /> Correcto
                        </>
                      )}
                      {estadoCueva === "pendiente" && (
                        <>
                          <FiClock /> Completar
                        </>
                      )}
                      {estadoCueva === "incorrecto" && (
                        <>
                          <FiClock /> Revisar
                        </>
                      )}
                    </span>
                  </td>
                </tr>

                <tr className="enc-fila-total">
                  <td className="enc-td-modulo">TOTAL</td>
                  <td className="enc-td-palitos">—</td>
                  <td className="enc-td-frecuencia">
                    <strong>{TOTAL_VOTOS}</strong>
                  </td>
                  <td>
                    <span className="enc-estado enc-estado-automatico">
                      Automático
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <button
              type="button"
              className="enc-verificar-tabla-btn"
              onClick={verificarTabla}
              disabled={cargandoTabla}
            >
              <FiCheck /> {cargandoTabla ? "Verificando..." : "Verificar tabla"}
            </button>

            <div className="enc-pista-card">
              <button
                type="button"
                className="enc-pista-trigger"
                onClick={() => setMostrarPistaBait(true)}
              >
                <img src={baitPistaImg} alt="" className="enc-pista-icono" />
                <strong>Pista de Bait</strong>
              </button>
              <p>
                Cuenta con cuidado la columna de palitos. Cada palito vale{" "}
                <strong className="enc-texto-azul">1 voto</strong>. La
                frecuencia absoluta es el número total de votos de cada
                módulo.
              </p>

              <div className="enc-pista-ejemplo">
                <span>Ejemplo:</span>
                <strong>{palitos(5)}</strong>
                <span>5 votos</span>
              </div>
            </div>
          </div>
        </div>

        {/* RESUMEN E INTERPRETACIÓN */}
        <div className="enc-bottom-row">
          <div className="enc-resumen-card">
            <div className="enc-card-header">
              <FiFileText /> Resumen e interpretación
            </div>

            <p className="enc-pregunta-resumen">¿Qué módulo obtuvo más votos?</p>

            <div className="enc-resumen-opciones">
              {(Object.keys(VOTOS) as Modulo[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`enc-resumen-opcion enc-modulo-${m} ${
                    moduloSeleccionado === m ? "enc-resumen-opcion-activa" : ""
                  }`}
                  data-review-target="native-modulo" onClick={() => setModuloSeleccionado(m)}
                  aria-pressed={moduloSeleccionado === m}
                  disabled={!tablaCompleta}
                >
                  <span className="enc-modulo-icono" aria-hidden="true" />
                  {NOMBRE_MODULO[m]}
                  {moduloSeleccionado === m && <FiCheckCircle className="enc-check-opcion" />}
                </button>
              ))}
            </div>

            {moduloSeleccionado && (
              <div className="enc-nota-bait">
                <img src={baitPistaImg} alt="" className="enc-nota-bait-avatar" />
                {moduloSeleccionado === MODULO_MAS_VOTADO ? (
                  <span>
                    ¡Exacto! El {NOMBRE_MODULO[MODULO_MAS_VOTADO]} fue el más
                    votado con {VOTOS[MODULO_MAS_VOTADO]} votos. ⭐
                  </span>
                ) : (
                  <span>Revisa otra vez la tabla de frecuencias antes de confirmar.</span>
                )}
              </div>
            )}

            <p className="mn-finish-direction">Cuando completes los retos, usa «Terminar misión» al final de la actividad.</p>
          </div>
        </div>
      <PilotEvidenceStatus pilot={pilot}/>
<RetosDeMision expansion={mission}/><CierreDeMision onFinish={()=>void enviarCentroDeMando()} busy={pilot.busy}/></main>

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="Cuenta con cuidado la columna de palitos: cada palito vale 1 voto. La frecuencia absoluta es el número total de votos de cada módulo. El módulo con más palitos es el que ganó la encuesta. Ejemplo: 5 palitos seguidos son 5 votos."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioEncuesta}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="¡Hola, piloto!"
          contenido="En esta misión debes aplicar una encuesta a la tripulación para decidir qué módulo explorar primero. Observa cómo votan los 10 integrantes del escuadrón, cuenta los votos con palitos y completa la tabla de frecuencias. Después revela cuál módulo obtuvo más votos."
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioEncuesta}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarAyudaContextual && (
        <AyudaEncuesta onClose={() => setMostrarAyudaContextual(false)} />
      )}

      {mostrarAmenaza && (
        <AmenazaEncuesta onClose={() => setMostrarAmenaza(false)} />
      )}

      {!tablaCompleta && (
        <p className="enc-visually-hidden" role="status">
          Todavía hay filas de la tabla que no coinciden, revísalas antes de
          enviar tu reporte.
        </p>
      )}
    </div>
  );
}
