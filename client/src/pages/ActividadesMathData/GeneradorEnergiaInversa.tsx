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
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./GeneradorEnergiaInversa.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/banner-gen2-MathData.png";
import personajeAyuda from "../../assets/hola-MathData.png";
import villanoTrofeoCompleto from "../../assets/villano-trofeo-completo.png";
import villanoIntentar from "../../assets/villano-vintentar.png";
import estrellaMision from "../../assets/estrella-mision.png";
import iconoAciertos from "../../assets/icono-aciertos.png";
import iconoTiempo from "../../assets/icono-tiempo.png";
import iconoPrecision from "../../assets/icono-precision.png";
import iconoRecompensa from "../../assets/icono-recompensa.png";
import iconoInsignia from "../../assets/icono-insignia.png";
import iconoProgreso from "../../assets/icono-progreso.png";
import villanoMundo from "../../assets/villano_mundo_actividad.png";

import iconoHexagonoPiensa from "../../assets/icono-hexagono-piensa.png";
import iconoHexagonoConsejo from "../../assets/icono-hexagono-consejo.png";
import iconoTipRapido from "../../assets/icono-tip-rapido.png";
import iconoIntentos from "../../assets/icono-intentos.png";
import iconoAyudaUsada from "../../assets/icono-ayuda-usada.png";
import villanoPista from "../../assets/villano-pista.png";

// ============================================
// TRANSMISIÓN DEL VILLANO (video + audio)
// Por ahora solo tenemos lista la animación/audio de INICIO.
// Cuando tengas listos los de éxito/fallo, agrega sus imports aquí
// siguiendo el mismo patrón.
// AJUSTA ESTOS 2 NOMBRES DE ARCHIVO A LOS TUYOS
// ============================================
import villanoHablandoVideo from "../../assets/villano-hablando.mp4";
import audioVillanoDesafio from "../../assets/villano-audio-desafio.mp3";
import audioVillanoDerrotado from "../../assets/villano-audio-derrotado.mp3";
import baitHablandoVideo from "../../assets/bait-hablando.mp4";
import pistaAudio from "../../assets/pista-audio.mp3";
import baitPistaImg from "../../assets/bait-pista.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiArrowLeft,
  FiRotateCcw,
  FiRotateCw,
  FiCheck,
  FiLock,
  FiHome,
  FiPieChart,
  FiPlay,
  FiPause,
  FiX,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";
import { FaStar, FaShieldAlt, FaGem, FaLightbulb, FaHandPointUp, FaBroadcastTower } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { getSessionUser } from "../../utils/authSession";

// ============================================
// CONFIGURACIÓN DEL BACKEND
// ============================================

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

type UsuarioSesionGenerador = {
  id_usuario?: number | string;
  idUsuario?: number | string;
  usuario_id?: number | string;
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  usuario?: UsuarioSesionGenerador;
  user?: UsuarioSesionGenerador;
  data?: UsuarioSesionGenerador;
  session?: UsuarioSesionGenerador;
};

const extraerIdUsuarioGenerador = (
  valor: unknown,
): number => {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return 0;
  }

  const usuario =
    valor as UsuarioSesionGenerador;

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
      extraerIdUsuarioGenerador(
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
      extraerIdUsuarioGenerador(
        candidato,
      );

    if (idUsuario > 0) {
      return idUsuario;
    }
  }

  return 0;
};

// ============================================
// DATOS INICIALES (NO MODIFICAR)
// ============================================

const filasIniciales = [
  { x: 1, y: "12", editable: false, correcto: true, bloqueada: false, asistida: false },
  { x: 2, y: "6", editable: false, correcto: true, bloqueada: false, asistida: false },
  { x: 3, y: "4", editable: false, correcto: true, bloqueada: false, asistida: false },
  { x: 4, y: "", editable: true, correcto: null, bloqueada: false, asistida: false },
  { x: 6, y: "", editable: true, correcto: null, bloqueada: false, asistida: false },
  { x: 12, y: "", editable: true, correcto: null, bloqueada: false, asistida: false },
];

const puntosIniciales = [
  { x: 1, y: 12 },
  { x: 2, y: 6 },
  { x: 3, y: 4 },
];

const EJE_X_MAX = 12;
const EJE_Y_MAX = 14;

// ============================================
// COMPONENTE: PISTA DE BAIT (modal con video real)
// Mismo estilo visual y de comportamiento que las
// actividades 2 y 3 (Rampas de Lanzamiento / Encuesta).
// ============================================

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

  const asignarAudioRef = useCallback((audio: HTMLAudioElement | null) => {
    audioRef.current = audio;
    if (!audio) return;

    audio.currentTime = 0;
    const reproduccion = audio.play();

    if (reproduccion !== undefined) {
      reproduccion.catch((error: DOMException) => {
        if (error.name !== "AbortError") {
          console.warn("El navegador bloqueó el audio automático:", error);
        }
      });
    }
  }, []);

  const actualizarReproduccion = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;

    if (audio.duration) {
      setProgreso((audio.currentTime / audio.duration) * 100);
    }

    // El audio dirige la sincronización solamente cuando realmente está
    // reproduciéndose. Así, si el navegador bloquea el audio automático,
    // el video puede seguir avanzando y no vuelve continuamente al segundo 0.
    if (
      video &&
      !audio.paused &&
      Math.abs(video.currentTime - audio.currentTime) > 0.35
    ) {
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
          ref={asignarAudioRef}
          src={audioSrc}
          autoPlay
          preload="auto"
          onPlay={() => {
            setReproduciendo(true);
            const video = videoRef.current;
            if (video) {
              video.currentTime = audioRef.current?.currentTime ?? 0;
              void video.play().catch(() => undefined);
            }
          }}
          onPause={() => setReproduciendo(false)}
          onEnded={() => setReproduciendo(false)}
          onTimeUpdate={actualizarReproduccion}
        />

        <button type="button" className={`pb-cerrar-btn pb-cerrar-btn-${tema}`} onClick={onClose}>
          {botonTexto}
        </button>
      </div>
    </div>,
    document.body
  );
}

type AyudaActividadModalProps = {
  onClose: () => void;
};

function AyudaActividadModal({ onClose }: AyudaActividadModalProps) {
  useEffect(() => {
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
    };

    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [onClose]);

  return createPortal(
    <div
      className="gen1-ayuda-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gen1-ayuda-titulo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <article className="gen1-ayuda-modal">
        <button
          type="button"
          className="gen1-ayuda-cerrar"
          onClick={onClose}
          aria-label="Cerrar ayuda"
        >
          <FiX />
        </button>

        <img
          src={baitPistaImg}
          alt="Bait comparte una pista para la misión"
          className="gen1-ayuda-imagen"
        />

        <div className="gen1-ayuda-contenido">
          <span className="gen1-ayuda-etiqueta">Ayuda de la misión</span>
          <h2 id="gen1-ayuda-titulo">¿Cómo recuperar la energía de la base?</h2>
          <p>
            Observa qué sucede con el tiempo cuando aumenta la cantidad de
            reactores. Los primeros datos de la tabla esconden una relación
            que se mantiene en todas las filas.
          </p>
          <div className="gen1-ayuda-pista">
            <FaLightbulb />
            <p>
              Busca una operación entre <strong>reactores</strong> y{" "}
              <strong>horas</strong> que produzca siempre el mismo resultado.
              Cuando descubras ese valor constante, úsalo para completar la
              tabla; después coloca esos pares en la gráfica y analiza la
              tendencia antes de responder la predicción.
            </p>
          </div>
        </div>
      </article>
    </div>,
    document.body,
  );
}

// ============================================
// COMPONENTE: REPRODUCTOR DE AUDIO DEL RESULTADO
// Se reproduce solo apenas se monta (igual que el
// useEffect de ResultModal.tsx de MathNumbers), y además
// muestra los controles normales de un reproductor de
// audio: retroceder 10s, pausar/reproducir y adelantar 10s.
// ============================================

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
    <div className="gen1r-modal-audio">
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
        className="gen1r-modal-audio-btn"
        onClick={() => saltar(-RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Retroceder 10 segundos"
      >
        <FiRotateCcw />
      </button>

      <button
        type="button"
        className="gen1r-modal-audio-btn gen1r-modal-audio-btn--play"
        onClick={alternarReproduccion}
        aria-label={reproduciendo ? "Pausar" : "Reproducir"}
      >
        {reproduciendo ? <FiPause /> : <FiPlay />}
      </button>

      <button
        type="button"
        className="gen1r-modal-audio-btn"
        onClick={() => saltar(RESULT_AUDIO_SALTO_SEGUNDOS)}
        aria-label="Adelantar 10 segundos"
      >
        <FiRotateCw />
      </button>

      <div className="gen1r-modal-audio-progress">
        <div style={{ width: `${progreso}%` }} />
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function GeneradorEnergiaInversa() {
 const mission=useMissionExpansion("mathdata-generador-energia");
  const [avisoActividad, setAvisoActividad] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const ID_ESTUDIANTE =
    obtenerIdEstudianteActual();

  const inicioActividadRef =
    useRef<number>(Date.now());

  const guardandoProgresoRef =
    useRef(false);

  const [filas, setFilas] = useState(filasIniciales);
  const [puntos, setPuntos] = useState(puntosIniciales);
  const [puntosIncorrectos, setPuntosIncorrectos] = useState<{ x: number; y: number }[]>([]);
  const [puntosAsistidos, setPuntosAsistidos] = useState<{ x: number; y: number }[]>([]);
  const [respuesta, setRespuesta] = useState("");
  const [mensajeFeedback, setMensajeFeedback] = useState("");
  const [actividadCompletada, setActividadCompletada] = useState(false);
  const [xpGanado, setXpGanado] = useState(0);
  const [progresoPorcentaje, setProgresoPorcentaje] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<"exito" | "fallo" | "incompleto" | "pista" | null>(null);
  const [mostrarIntroVillano, setMostrarIntroVillano] = useState(false);
  const [mostrarPistaModal, setMostrarPistaModal] = useState(false);
  const [mostrarAyudaActividad, setMostrarAyudaActividad] = useState(false);
  const [graficaCompleta, setGraficaCompleta] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  // ---- Temporizador ----
  const tiempoInicioRef = useRef<number>(Date.now());
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);

  useEffect(() => {
    if (cargandoInicial || resultado !== null) return;

    const intervalo = setInterval(() => {
      setSegundosTranscurridos(Math.floor((Date.now() - tiempoInicioRef.current) / 1000));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [cargandoInicial, resultado]);

  const formatearTiempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  // ==========================================
  // CARGAR PROGRESO GUARDADO
  // ==========================================

  useEffect(() => {
    const cargarProgreso = async () => {
      if (!ID_ESTUDIANTE) {
        console.warn(
          "No se encontró el estudiante autenticado para cargar Generador de Energía Inversa.",
        );
        setCargandoInicial(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/proporcionalidad/progreso/${ID_ESTUDIANTE}`);
        const data = await response.json();

        if (data.success && data.data) {
          const progreso = data.data;
          const celdasAsistidas = (progreso.celdas_asistidas || {}) as Record<string, boolean>;

          if (progreso.valores_tabla) {
            const nuevosValores = filasIniciales.map((fila) => {
              const valorGuardado = (progreso.valores_tabla as Record<string, number>)[String(fila.x)];
              if (valorGuardado !== undefined) {
                const esAsistida = !!celdasAsistidas[String(fila.x)];
                return {
                  ...fila,
                  y: String(valorGuardado),
                  correcto: esAsistida ? null : true,
                  bloqueada: true,
                  asistida: esAsistida,
                };
              }
              return fila;
            });
            setFilas(nuevosValores);

            const puntosAsistidosRestaurados = nuevosValores
              .filter((f) => f.asistida)
              .map((f) => ({ x: f.x, y: Number(f.y) }));
            if (puntosAsistidosRestaurados.length > 0) {
              setPuntosAsistidos(puntosAsistidosRestaurados);
            }
          }

          // ✅ "completada" (con o sin ayuda) siempre manda a éxito; el
          // color naranja ya indica que hubo asistencia.
          if (progreso.completada) {
            setActividadCompletada(true);
            setXpGanado(progreso.xp_obtenido || 0);
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

  // ==========================================
  // GUARDAR PROGRESO EN EL BACKEND
  // ==========================================

  const guardarProgreso = async (pantalla: number) => {
    if (!ID_ESTUDIANTE) {
      return;
    }

    try {
      await fetch(`${API_URL}/proporcionalidad/guardar-progreso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          pantalla_actual: pantalla,
        }),
      });
    } catch (error) {
      console.error("Error al guardar progreso:", error);
    }
  };

  // ==========================================
  // REINICIAR ACTIVIDAD
  // ==========================================

  const handleReiniciarActividad = async () => {
 mission.reset();
 pilot.resetSession();
    try {
      await fetch(`${API_URL}/proporcionalidad/reiniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
        }),
      });
    } catch (error) {
      console.error("Error al reiniciar actividad:", error);
    }

    setResultado(null);
    setActividadCompletada(false);
    setFilas(filasIniciales);
    setPuntos(puntosIniciales);
    setPuntosIncorrectos([]);
    setPuntosAsistidos([]);
    setMensajeFeedback("");
    setProgresoPorcentaje(0);
    setRespuesta("");
    setXpGanado(0);
    setGraficaCompleta(false);

    guardandoProgresoRef.current =
      false;

    inicioActividadRef.current =
      Date.now();

    tiempoInicioRef.current = Date.now();
    setSegundosTranscurridos(0);
  };

  // ==========================================
  // VALIDAR TABLA CON BACKEND
  // ==========================================

  const actualizarFila = async (index: number, valor: string) => {
    if(valor!=="")pilot.recordAll({valores_tabla:Object.fromEntries(filas.map((f,i)=>[String(f.x),i===index?valor:f.y]))});
    if (!ID_ESTUDIANTE) {
      setMensajeFeedback(
        "❌ No se encontró tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    setFilas((prev) =>
      prev.map((fila, i) => (i === index ? { ...fila, y: valor, correcto: null } : fila))
    );

    if (valor === "") return;

    const fila = filas[index];
    if (!fila) return;

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/proporcionalidad/validar-tabla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: ID_ESTUDIANTE,
          reactores: fila.x,
          tiempo: Number(valor),
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const resultado = data.data;

        setFilas((prev) =>
          prev.map((f, i) => {
            if (i !== index) return f;

            if (resultado.celda_completada && !resultado.correcto) {
              // Se agotaron los intentos: se revela la respuesta. Ya NO se
              // marca como "incorrecta" (rojo) — se marca "asistida"
              // (naranja fijo), porque quedó resuelta con ayuda.
              return {
                ...f,
                y: String(resultado.respuesta_correcta),
                correcto: null,
                bloqueada: true,
                asistida: true,
              };
            }

            return { ...f, correcto: resultado.correcto, asistida: false };
          })
        );

        if (resultado.correcto) {
          setMensajeFeedback(resultado.mensaje);
          await guardarProgreso(4);
          if (!puntos.some(p => p.x === fila.x)) {
            setPuntos((prev) => [...prev, { x: fila.x, y: Number(valor) }]);
          }
          // Ya no está mal: si tenía un punto rojo marcado, se quita
          setPuntosIncorrectos((prev) => prev.filter((p) => p.x !== fila.x));
        } else if (resultado.celda_completada && resultado.asistido) {
          // Revelada: punto naranja fijo (sin parpadeo), se quita el rojo
          setMensajeFeedback("");
          setPuntosIncorrectos((prev) => prev.filter((p) => p.x !== fila.x));
          setPuntosAsistidos((prev) => [
            ...prev.filter((p) => p.x !== fila.x),
            { x: fila.x, y: Number(resultado.respuesta_correcta) },
          ]);
          await guardarProgreso(4);
        } else {
          // Incorrecto (aún con intentos disponibles): sin mensaje de
          // texto, solo el punto rojo parpadeante en la gráfica
          setMensajeFeedback("");
          setPuntosIncorrectos((prev) => [
            ...prev.filter((p) => p.x !== fila.x),
            { x: fila.x, y: Number(valor) },
          ]);
        }

        const celdasCompletadas = filas.filter(f => f.correcto === true || f.bloqueada).length;
        const totalCeldas = filas.length;
        setProgresoPorcentaje(Math.round((celdasCompletadas / totalCeldas) * 100));
      }
    } catch (error) {
      console.error("Error al validar:", error);
      setMensajeFeedback("❌ Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // VALIDAR PREDICCIÓN CON BACKEND
  // ==========================================

  const pilot=useMathDataEvidence("mathdata-generador-energia",mission,()=>({valores_tabla:Object.fromEntries(filas.map(f=>[String(f.x),f.y])),grafica_completa:graficaCompleta,puntos_grafica:[...puntos,...puntosAsistidos],prediccion_reactores:respuesta,filas_asistidas:filas.filter(f=>f.asistida||f.bloqueada).map(f=>f.x)}));
  useEffect(()=>{const attempt=pilot.receipt?.intento_piloto;if(!attempt)return;
    setResultado(attempt.evaluacion.completada?"exito":"fallo");
    setActividadCompletada(attempt.evaluacion.completada);setProgresoPorcentaje(attempt.evaluacion.completada?100:80);setXpGanado(attempt.xp_obtenido);
  },[pilot.receipt]);

  const handleEnviarPrediccion = async () => {
    if(pilot.busy)return;
    setCargando(true);
    try {await pilot.finish(Math.max(1,Math.floor((Date.now()-inicioActividadRef.current)/1000)),60);}
    catch(error){setAvisoActividad(error instanceof Error?error.message:"No se pudo guardar; conserva esta pestaña.");}
    finally{setCargando(false);}
  };

  // ==========================================
  // VERIFICAR PUNTOS EN LA GRÁFICA
  // ==========================================

  const handleVerificarPuntos = () => {
    pilot.recordAll();
    const puntosEsperados = [
      { x: 1, y: 12 },
      { x: 2, y: 6 },
      { x: 3, y: 4 },
      { x: 4, y: 3 },
      { x: 6, y: 2 },
      { x: 12, y: 1 },
    ];

    const todosLosPuntos = puntosEsperados.every(pEsperado =>
      puntos.some(p => p.x === pEsperado.x && p.y === pEsperado.y) ||
      puntosAsistidos.some(p => p.x === pEsperado.x && p.y === pEsperado.y)
    );

    if (todosLosPuntos && [...puntos,...puntosAsistidos].every(p=>puntosEsperados.some(e=>e.x===p.x&&e.y===p.y))) {
      setMensajeFeedback("✅ ¡Todos los puntos están correctos! Has completado la gráfica.");
      setGraficaCompleta(true);
      setProgresoPorcentaje(80);
      setAvisoActividad("🎉 ¡Gráfica completada correctamente!");
    } else {
      setGraficaCompleta(false);
      setMensajeFeedback("❌ Faltan puntos o algunos están incorrectos. Revisa la tabla.");
      setAvisoActividad("❌ Faltan puntos o algunos están incorrectos. Revisa la tabla.");
    }
  };

  // ==========================================
  // FUNCIONES EXISTENTES (NO MODIFICAR)
  // ==========================================

  const manejarClickGrafica = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = 1 - (e.clientY - rect.top) / rect.height;

    const x = Math.round(relX * EJE_X_MAX);
    const y = Math.round(relY * EJE_Y_MAX);

    if (x <= 0 || y <= 0) return;

    setPuntos((prev) => [...prev, { x, y }]);
  };

  const limpiarGrafica = () => {
    setPuntos(puntosIniciales);
    setPuntosIncorrectos([]);
    setGraficaCompleta(false);
  };

  // ==========================================
  // PANTALLA: ACTIVIDAD COMPLETADA
  // ==========================================

  // ==========================================

  // ==========================================
  // PANTALLA: PISTA (AYUDA)
  // ==========================================

 const missionNativeItems:MissionReviewItem[]=[{id:"tabla",title:"Tabla de reactores",answer:String(JSON.stringify(filas.filter(f=>f.editable).map(f=>({x:f.x,y:f.y})))),correct:filas.every(f=>Number(f.y)===12/f.x),hint:"El producto reactores × tiempo es 12; para 4, 6 y 12 reactores corresponden 3, 2 y 1.",target:'[data-review-target="native-tabla"]'},{id:"grafica",title:"Puntos de la gráfica",answer:String(JSON.stringify(puntos)),correct:graficaCompleta,hint:"Comprueba las coordenadas de cada par (reactores, tiempo).",target:'[data-review-target="native-grafica"]'},{id:"prediccion",title:"Predicción para recargar en 2 horas",answer:String(respuesta),correct:Number(respuesta)===6,hint:"Conserva el producto 12: reactores × 2 horas = 12; necesitas 6 reactores.",target:'[data-review-target="native-prediccion"]'}];
 const missionReviewScore=pilot.evaluation?.aciertos ?? (missionNativeItems.filter(item=>item.correct===true).length+mission.correctCount);
 const missionReviewPrecision=Math.round(missionReviewScore/mission.total*100);
 const resumeMission=(item?:MissionReviewItem)=>{if(Number(respuesta)!==6)setActividadCompletada(false);setResultado(null);mission.beginCorrection(item);};


  if (resultado === "pista") return (
    <div className="pista-page">

      {/* DECORACIÓN DE FONDO */}
      <span className="pista-decor pista-decor-1"><FaGem /></span>
      <span className="pista-decor pista-decor-2"><FiPieChart /></span>
      <span className="pista-decor pista-decor-3"><FiBarChart2 /></span>
      <span className="pista-decor pista-decor-4"><GiRingedPlanet /></span>

      {/* HEADER */}
      <header className="pista-header">
        <img src={logo} alt="MathNova" className="pista-logo" />
        <button className="pista-inicio-btn" onClick={() => navigate("/")}>
          <FiHome />
          Inicio
        </button>
      </header>

      <div className="pista-body">

        {/* COLUMNA IZQUIERDA */}
        <div className="pista-left">

          {/* TÍTULO */}
          <div className="pista-titulo-row">
            <div className="pista-icono-titulo">
              <FaLightbulb />
            </div>
            <div>
              <h1 className="pista-titulo">¡Aquí tienes una pista!</h1>
              <p className="pista-subtitulo">
                Observa con atención esta ayuda para avanzar en la misión de{" "}
                <span className="pista-brand">MathData</span>.
              </p>
            </div>
          </div>

          {/* CARD PRINCIPAL */}
          <div className="pista-card-principal">
            <div className="pista-hexagono">
              <img src={iconoHexagonoPiensa} alt="" />
            </div>
            <div>
              <strong>¡Piensa paso a paso, explorador!</strong>
              <p>
                Recuerda identificar primero el patrón entre reactores y
                tiempo. En esta misión, si aumentan los reactores, el tiempo
                disminuye. Si te atoras, vuelve a intentarlo: cada pista te
                acerca cada vez más a la meta.
              </p>
            </div>
          </div>

          {/* SECCIÓN: PISTA PARA RESOLVER */}
          <div className="pista-seccion-header">
            <FaLightbulb />
            <span>Pista para resolver</span>
          </div>

          <div className="pista-consejo-row">
            <div className="pista-consejo-card">
              <div className="pista-hexagono pista-hexagono-sm">
                <img src={iconoHexagonoConsejo} alt="" />
              </div>
              <div>
                <strong>Consejo de Divide</strong>
                <p>
                  En esta misión, reactores x tiempo siempre debe dar el
                  mismo número. Observa los ejemplos: 1 × 12, 2 × 6 y 3 × 4.
                  Si buscas otro valor, piensa qué otro número multiplicado
                  por el tiempo te da 12.
                </p>
              </div>
            </div>

            <div className="pista-tip-card">
              <div className="pista-tip-icono">
                <img src={iconoTipRapido} alt="" />
              </div>
              <div>
                <strong>Tip rápido:</strong>
                <p>
                  Si el tiempo es 2 horas, busca qué número multiplicado por
                  2 da 12.
                </p>
              </div>
            </div>
          </div>

          {/* RESUMEN DE LA ACTIVIDAD */}
          <div className="pista-resumen-card">
            <div className="pista-resumen-header">
              <FiBarChart2 />
              <span>Resumen de la actividad</span>
            </div>
            <hr className="pista-divider" />
            <div className="pista-stats">

              <div className="pista-stat">
                <img src={iconoIntentos} alt="" className="pista-stat-img" />
                <strong>3</strong>
                <small>Intentos</small>
                <em>Sigue así</em>
              </div>

              <div className="pista-stat-sep" />

              <div className="pista-stat">
                <img src={iconoAciertos} alt="" className="pista-stat-img" />
                <strong className="pista-azul">{missionReviewScore}/{mission.total}</strong>
                <small>Aciertos</small>
                <em>Puedes mejorar</em>
              </div>

              <div className="pista-stat-sep" />

              <div className="pista-stat">
                <img src={iconoTiempo} alt="" className="pista-stat-img" />
                <strong>{formatearTiempo(segundosTranscurridos)}</strong>
                <small>Tiempo</small>
                <em>Sigue practicando</em>
              </div>

              <div className="pista-stat-sep" />

              <div className="pista-stat">
                <img src={iconoPrecision} alt="" className="pista-stat-img" />
                <strong className="pista-verde">{missionReviewPrecision}%</strong>
                <small>Precisión</small>
                <em>¡Buen uso!</em>
              </div>

              <div className="pista-stat-sep" />

              <div className="pista-stat">
                <img src={iconoAyudaUsada} alt="" className="pista-stat-img" />
                <strong>1 pista</strong>
                <small>Ayuda usada</small>
                <em>¡Buen uso!</em>
              </div>

            </div>
          </div>

          {/* PROGRESO EN EL TEMA */}
          <div className="pista-progreso-card">
            <img src={iconoProgreso} alt="" className="pista-progreso-img" />
            <div className="pista-progreso-info">
              <small>Tu progreso en el tema:</small>
              <strong>Relaciones y Proporciones</strong>
              <div className="pista-barra-track">
                <div className="pista-barra-fill" style={{ width: "60%" }}>
                  <span>60%</span>
                </div>
              </div>
              <small>
                ¡Vas avanzando! Esta pista te ayudará a acercarte a la
                respuesta correcta.
              </small>
            </div>
            <div className="pista-hito-box">
              <img src={estrellaMision} alt="" className="pista-hito-estrella" />
              <div>
                <small>Siguiente hito</small>
                <strong className="pista-hito-pct">{missionReviewPrecision}%</strong>
                <small>Gran Analista</small>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: VILLANO + ACCIONES */}
        <div className="pista-right">
          <img
            src={villanoPista}
            alt="Villano retador"
            className="pista-villano-img"
          />

          <div className="pista-acciones">
            <button
              type="button"
              className="pista-btn pista-btn-azul"
              onClick={handleReiniciarActividad}
            >
              <FiRefreshCw /> Repetir actividad
            </button>
            <button
              type="button"
              className="pista-btn pista-btn-outline"
              onClick={() => setMostrarPistaModal(true)}
            >
              <FaLightbulb /> Ver Pista
            </button>
            <button
              type="button"
              className="pista-btn pista-btn-outline"
              onClick={() => navigate("/actividades-math-data")}
            >
              <FiArrowLeft /> Volver a actividades
            </button>
          </div>
        </div>

      </div>

      {mostrarPistaModal && (
        <PistaBaitModal
          contenido="¡No te dejes engañar por el mago! Recuerda que reactores ÷ tiempo siempre es igual a 12. Si te atoras, observa la tabla, identifica ese patrón y úsalo para encontrar la respuesta. ¡Tú puedes, agente!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaAudio}
          onClose={() => setMostrarPistaModal(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA: ACTIVIDAD INCOMPLETA
  // ==========================================

  if (resultado === "incompleto") return (
    <div className="inc-page">

      {/* CONFETI */}
      <div className="inc-confetti" aria-hidden="true">
        {["#3b82f6","#f97316","#22c55e","#a855f7","#eab308","#ef4444","#06b6d4","#f43f5e"].map((c,i)=>(
          <span key={i} className="inc-dot" style={{
            background: c,
            width: `${10+i%4*3}px`,
            height: `${10+i%4*3}px`,
            top: `${5+i*7}%`,
            left: i < 4 ? `${4+i*8}%` : undefined,
            right: i >= 4 ? `${4+(i-4)*9}%` : undefined,
          }} />
        ))}
      </div>

      {/* HEADER */}
      <header className="inc-header">
        <img src={logo} alt="MathNova" className="inc-logo" />
        <button className="inc-inicio-btn" onClick={() => navigate("/")}>
          Inicio
        </button>
      </header>

      {/* CONTENEDOR COMPARTIDO PARA EL EFECTO DE CAPAS (villano detrás de la tarjeta) */}
      <div className="inc-content-wrap">

        {/* VILLANO + MUNDO (una sola ilustración, va detrás de la tarjeta resumen) */}
        <img src={villanoMundo} alt="Villano con el mundo" className="inc-villano-mundo" />

        {/* HERO */}
        <div className="inc-hero">

          {/* IZQUIERDA */}
          <div className="inc-hero-left">

            {/* TÍTULO */}
            <div className="inc-titulo-row">
              <div className="inc-icono-titulo">
                <FiBarChart2 />
              </div>
              <div>
                <h1 className="inc-titulo">Actividad incompleta</h1>
                <p className="inc-subtitulo">
                  Aún no has terminado con éxito la misión de{" "}
                  <span className="inc-brand">MathData</span>.
                </p>
              </div>
            </div>

            {/* MENSAJE NARANJA */}
            <div className="inc-mensaje">
              <div className="inc-icono-mensaje">
                <FiBarChart2 />
              </div>
              <div>
                <strong>¡Puedes retomarla cuando quieras!</strong>
                <p>
                  Te quedaste a mitad del reto. Regresa para continuar
                  practicando tablas, gráficas y análisis de datos.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM */}
        <div className="inc-bottom">

          {/* COLUMNA IZQUIERDA */}
          <div className="inc-bottom-left">

            {/* CARD RESUMEN */}
            <div className="inc-resumen-card">
            <div className="inc-resumen-header">
              <FiBarChart2 className="inc-resumen-icono" />
              <span>Resumen de la actividad</span>
            </div>
            <hr className="inc-divider" />
            <div className="inc-stats">

              <div className="inc-stat">
                <img src={iconoAciertos} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Aciertos</span>
                  <strong className="inc-stat-val inc-azul">{missionReviewScore}/{mission.total}</strong>
                  <em>¡Buen trabajo!</em>
                </div>
              </div>

              <div className="inc-stat-sep" />

              <div className="inc-stat">
                <img src={iconoTiempo} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Tiempo</span>
                  <strong className="inc-stat-val">02:11</strong>
                  <em>min</em>
                </div>
              </div>

              <div className="inc-stat-sep" />

              <div className="inc-stat">
                <img src={iconoPrecision} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Precisión</span>
                  <strong className="inc-stat-val inc-azul">{missionReviewPrecision}%</strong>
                  <em>¡Buen avance!</em>
                </div>
              </div>

              <div className="inc-stat-sep" />

              <div className="inc-stat">
                <img src={iconoRecompensa} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Recompensa</span>
                  <strong className="inc-stat-val inc-naranja">{pilot.receipt?.intento_piloto?.xp_obtenido ?? 0} XP</strong>
                  <em>XP del intento</em>
                </div>
              </div>

              <div className="inc-stat-sep" />

              <div className="inc-stat">
                <img src={iconoInsignia} alt="" className="inc-stat-img" />
                <div className="inc-stat-text">
                  <span className="inc-stat-label">Estado</span>
                  <strong className="inc-stat-val inc-morado">En progreso</strong>
                  <em>¡Sigue así!</em>
                </div>
              </div>

            </div>
          </div>

          {/* CARD PROGRESO */}
          <div className="inc-progreso-card">
            <img src={iconoProgreso} alt="" className="inc-progreso-img" />
            <div className="inc-progreso-info">
              <small>Tu progreso en el tema:</small>
              <strong>Encuestas y Frecuencias</strong>
              <div className="inc-barra-track">
                <div className="inc-barra-fill" style={{ width: "67%" }}>
                  <span>67%</span>
                </div>
              </div>
              <small>¡Buen avance! Retoma la actividad para seguir creciendo.</small>
            </div>
            <div className="inc-hito-box">
              <img src={estrellaMision} alt="" className="inc-hito-estrella" />
              <div>
                <small>Siguiente hito</small>
                <strong className="inc-hito-pct">{missionReviewPrecision}%</strong>
                <small>Gran Analista</small>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: botones */}
        <div className="inc-bottom-right">
          <button className="inc-btn inc-btn-azul" onClick={() => setResultado(null)}>
            <FiRefreshCw /> Continuar actividad
          </button>
          <button className="inc-btn inc-btn-outline" onClick={() => setMostrarPistaModal(true)}>
            <FaLightbulb /> Ver Pista
          </button>
          <button className="inc-btn inc-btn-outline" onClick={() => navigate("/actividades-math-data")}>
            <FiArrowLeft /> Volver a actividades
          </button>
        </div>

      </div>

      </div>

      {mostrarPistaModal && (
        <PistaBaitModal
          contenido="¡No te dejes engañar por el mago! Recuerda que reactores ÷ tiempo siempre es igual a 12. Si te atoras, observa la tabla, identifica ese patrón y úsalo para encontrar la respuesta. ¡Tú puedes, agente!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaAudio}
          onClose={() => setMostrarPistaModal(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA DE CARGA INICIAL (evita mostrar el
  // tablero antes de saber si ya estaba completada)
  // ==========================================

  if (cargandoInicial) {
  
  return (
      <div className="gen1-loading-screen">
        <img src={logo} alt="MathNova" className="gen1-loading-logo" />
        <p>Cargando actividad...</p>
      </div>
    );
  }

  // ==========================================
  // RENDER (NO MODIFICAR ESTRUCTURA)
  // ==========================================

  return (
    <main className="gen1-page mn-activity">
      {avisoActividad && <AvisoActividad message={avisoActividad} onClose={() => setAvisoActividad(null)} />}
      {/* TRANSMISIÓN DEL VILLANO: aparece antes de comenzar el desafío */}
      {mostrarIntroVillano && (
        <PistaBaitModal
          tema="rojo"
          titulo="Transmisión interceptada"
          contenido="¡Ja! He bloqueado los reactores de tu base. Sin embargo, sin energía el escudo caerá antes del amanecer y la base quedará expuesta. Pero te haré un trato: si logras descubrir cuántos reactores necesitas para recargar el escudo a tiempo, quizás te deje intentarlo. ¿Crees que puedes con eso?"
          videoSrc={villanoHablandoVideo}
          audioSrc={audioVillanoDesafio}
          botonTexto="Aceptar el desafío ⚡"
          onClose={() => setMostrarIntroVillano(false)}
        />
      )}

      {/* PISTA DE BAIT: aparece al presionar el botón de pista en "Predice y responde" */}
      {mostrarPistaModal && (
        <PistaBaitModal
          contenido="¡No te dejes engañar por el mago! Recuerda que reactores ÷ tiempo siempre es igual a 12. Si te atoras, observa la tabla, identifica ese patrón y úsalo para encontrar la respuesta. ¡Tú puedes, agente!"
          videoSrc={baitHablandoVideo}
          audioSrc={pistaAudio}
          onClose={() => setMostrarPistaModal(false)}
        />
      )}

      {/* VENTANA EMERGENTE: ACTIVIDAD COMPLETADA (estilo ResultModal de MathNumbers) */}
      {resultado === "exito" && (
        <div className="gen1r-modal-overlay gen1r-modal-overlay--completed" role="presentation">
          <section
            className="gen1r-modal gen1r-modal--completed"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gen1-result-title"
          >
            <div className="gen1r-modal-decoration gen1r-modal-decoration--one" />
            <div className="gen1r-modal-decoration gen1r-modal-decoration--two" />

            <div className="gen1r-modal-main">
              <header className="gen1r-modal-header">
                <div className="gen1r-modal-status-icon">
                  <FiCheckCircle />
                </div>

                <div className="gen1r-modal-header-copy">
                  <span className="gen1r-modal-badge">
                    <FiCheckCircle />
                    Actividad completada
                  </span>

                  <h1 id="gen1-result-title">¡Actividad completada!</h1>

                  <p>
                    Has terminado con éxito la misión de{" "}
                    <span className="gen1r-mathnova-color">MathData</span>.
                  </p>
                </div>
              </header>

              <div className="gen1r-modal-content"><AudioRetroalimentacion/>
                <div className="gen1r-modal-character">
                  <img
                    src={villanoTrofeoCompleto}
                    alt="Villano celebrando con trofeo"
                    draggable={false}
                  />
                </div>

                <article className="gen1r-modal-message">
                  <span className="gen1r-modal-message-label">Resultado de la misión</span>
                  <h2>¡Excelente trabajo, explorador!</h2>
                  <p>
                    Cada reto superado fortalece tus habilidades para analizar
                    datos. Sigue así y conquista la siguiente misión.
                  </p>
                </article>
              </div>

              <ResultAudioPlayer src={audioVillanoDerrotado} />

              <article className="gen1r-modal-summary">
                <header>
                  <FiBarChart2 />
                  <h2>Resumen de la actividad</h2>
                </header>

                <div className="gen1r-modal-stats">
                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
                      <img src={iconoAciertos} alt="" aria-hidden="true" />
                    </div>
                    <div>
                      <span>Aciertos</span>
                      <strong>{missionReviewScore}/{mission.total}</strong>
                      <small>¡Perfecto!</small>
                    </div>
                  </article>

                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
                      <img src={iconoTiempo} alt="" aria-hidden="true" />
                    </div>
                    <div>
                      <span>Tiempo</span>
                      <strong>{formatearTiempo(segundosTranscurridos)}</strong>
                      <small>min</small>
                    </div>
                  </article>

                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
                      <img src={iconoPrecision} alt="" aria-hidden="true" />
                    </div>
                    <div>
                      <span>Precisión</span>
                      <strong>{missionReviewPrecision}%</strong>
                      <small>¡Impecable!</small>
                    </div>
                  </article>

                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
                      <img src={iconoRecompensa} alt="" aria-hidden="true" />
                    </div>
                    <div>
                      <span>Recompensa</span>
                      <strong>{pilot.receipt?.intento_piloto?.xp_obtenido ?? 0} XP</strong>
                      <small>XP del intento</small>
                    </div>
                  </article>

                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
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

            <aside className="gen1r-modal-side">
              <article className="gen1r-modal-side-message">
                <span>¡Misión completada!</span>
                <strong>Sigue avanzando por MathData</strong>
                <p>Cada actividad superada fortalece tus habilidades matemáticas.</p>
              </article>

              <div className="gen1r-modal-progress">
                <div>
                  <span>Progreso del tema</span>
                  <strong>{progresoPorcentaje}%</strong>
                </div>
                <div className="gen1r-modal-progress-bar">
                  <span style={{ width: `${progresoPorcentaje}%` }} />
                </div>
              </div>

              <div className="gen1r-modal-actions">
                <button
                  type="button"
                  className="gen1r-modal-action gen1r-modal-action--primary"
                  onClick={() => navigate("/actividades-math-data/rampas-lanzamiento")}
                >
                  <FiArrowRight />
                  <span>Siguiente actividad</span>
                </button>

                <button
                  type="button"
                  className="gen1r-modal-action gen1r-modal-action--secondary"
                  onClick={handleReiniciarActividad}
                >
                  <FiRefreshCw />
                  <span>Repetir actividad</span>
                </button>

                <button
                  type="button"
                  className="gen1r-modal-action gen1r-modal-action--secondary"
                  onClick={() => navigate("/actividades-math-data")}
                >
                  <FiGrid />
                  <span>Volver a actividades</span>
                </button>
              </div>
            </aside>
          </section>
        </div>
      )}

      {/* VENTANA EMERGENTE: VUELVE A INTENTARLO (estilo ResultModal de MathNumbers) */}
      {resultado === "fallo" && (
        <div className="gen1r-modal-overlay gen1r-modal-overlay--retry" role="presentation">
          <section
            className="gen1r-modal gen1r-modal--retry"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gen1-result-title-fallo"
          >
            <div className="gen1r-modal-decoration gen1r-modal-decoration--one" />
            <div className="gen1r-modal-decoration gen1r-modal-decoration--two" />

            <div className="gen1r-modal-main"><DetalleErroresDeMision items={pilot.reviewItems([...missionNativeItems,...mission.items])} onCorrect={resumeMission} onRestart={handleReiniciarActividad}/>
              <header className="gen1r-modal-header">
                <div className="gen1r-modal-status-icon">
                  <FiRefreshCw />
                </div>

                <div className="gen1r-modal-header-copy">
                  <span className="gen1r-modal-badge">
                    <FiRefreshCw />
                    Vuelve a intentarlo
                  </span>

                  <h1 id="gen1-result-title-fallo">¡Vuelve a intentarlo!</h1>

                  <p>
                    Aún no completas con éxito la misión de{" "}
                    <span className="gen1r-mathnova-color">MathData</span>.
                  </p>
                </div>
              </header>

              <div className="gen1r-modal-content"><AudioRetroalimentacion/>
                <div className="gen1r-modal-character">
                  <img src={villanoIntentar} alt="Villano retando" draggable={false} />
                </div>

                <article className="gen1r-modal-message">
                  <span className="gen1r-modal-message-label">Resultado de la misión</span>
                  <h2>¡No te rindas, explorador!</h2>
                  <p>
                    Los errores también enseñan. Revisa tus respuestas,
                    inténtalo de nuevo y sigue fortaleciendo tus habilidades
                    para analizar datos, tablas y frecuencias.
                  </p>
                </article>
              </div>

              <ResultAudioPlayer src={audioVillanoDesafio} />

              <article className="gen1r-modal-summary">
                <header>
                  <FiBarChart2 />
                  <h2>Resumen de la actividad</h2>
                </header>

                <div className="gen1r-modal-stats">
                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
                      <img src={iconoAciertos} alt="" aria-hidden="true" />
                    </div>
                    <div>
                      <span>Aciertos</span>
                      <strong>{missionReviewScore}/{mission.total}</strong>
                      <small>¡Sigue así!</small>
                    </div>
                  </article>

                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
                      <img src={iconoTiempo} alt="" aria-hidden="true" />
                    </div>
                    <div>
                      <span>Tiempo</span>
                      <strong>{formatearTiempo(segundosTranscurridos)}</strong>
                      <small>min</small>
                    </div>
                  </article>

                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
                      <img src={iconoPrecision} alt="" aria-hidden="true" />
                    </div>
                    <div>
                      <span>Precisión</span>
                      <strong>{missionReviewPrecision}%</strong>
                      <small>Puedes mejorar</small>
                    </div>
                  </article>

                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
                      <img src={iconoRecompensa} alt="" aria-hidden="true" />
                    </div>
                    <div>
                      <span>Recompensa</span>
                      <strong>{pilot.receipt?.intento_piloto?.xp_obtenido ?? 0} XP</strong>
                      <small>XP del intento</small>
                    </div>
                  </article>

                  <article className="gen1r-modal-stat">
                    <div className="gen1r-modal-stat-icon">
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

            <aside className="gen1r-modal-side">
              <article className="gen1r-modal-side-message">
                <span>¡No te rindas!</span>
                <strong>Cada intento te ayuda a mejorar</strong>
                <p>Usa la pista, revisa el procedimiento y vuelve a resolver la actividad.</p>
              </article>

              <div className="gen1r-modal-progress">
                <div>
                  <span>Progreso del tema</span>
                  <strong>{progresoPorcentaje}%</strong>
                </div>
                <div className="gen1r-modal-progress-bar">
                  <span style={{ width: `${progresoPorcentaje}%` }} />
                </div>
              </div>

              <div className="gen1r-modal-actions">
                <button
                  type="button"
                  className="gen1r-modal-action gen1r-modal-action--primary"
                  onClick={()=>resumeMission(missionNativeItems.find(item=>item.correct===false))}
                >
                  <FiRefreshCw />
                  <span>Corregir errores</span>
                </button>

                <button
                  type="button"
                  className="gen1r-modal-action gen1r-modal-action--secondary"
                  onClick={() => setMostrarPistaModal(true)}
                >
                  <FaLightbulb />
                  <span>Ver pista</span>
                </button>

                <button
                  type="button"
                  className="gen1r-modal-action gen1r-modal-action--secondary"
                  onClick={() => navigate("/actividades-math-data")}
                >
                  <FiGrid />
                  <span>Volver a actividades</span>
                </button>
              </div>
            </aside>
          </section>
        </div>
      )}

      <button
        type="button"
        className={`gen1-hamburger-btn ${menuOpen ? "gen1-hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div className="gen1-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside className={`gen1-sidebar ${menuOpen ? "gen1-sidebar-open" : ""}`}>
        <img src={logo} alt="MathNova" className="gen1-sidebar-logo" />

        <nav className="gen1-sidebar-menu">
          <button type="button" className="gen1-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item gen1-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="gen1-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="gen1-sidebar-bottom">
          <div className="gen1-character-box">
            <img src={personajeAyuda} alt="Explorador" />
            <div>
              <strong>¡Tú puedes!</strong>
              <p>La base cuenta contigo.</p>
            </div>
          </div>

          <div className="gen1-topic-progress">
            <strong>Progreso del tema</strong>
            <span>0/2 actividades</span>
            <div className="gen1-progress-track">
              <i style={{ width: `${progresoPorcentaje}%` }} />
            </div>
          </div>

          <div className="gen1-tiempo-box">
            <span>Tiempo transcurrido</span>
            <strong>{formatearTiempo(segundosTranscurridos)}</strong>
          </div>

          <div className="gen1-xp-box">
            <span>XP del último intento</span>
            <strong>
              {pilot.receipt?.intento_piloto?.xp_obtenido ?? "—"} XP <FaStar />
            </strong>
          </div>
        </div>

        <div className="gen1-sidebar-icons">
          <button type="button" onClick={() => irARuta("/ajustes")} aria-label="Ajustes">
            <FiSettings />
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setMostrarAyudaActividad(true);
            }}
            aria-label="Ayuda de la actividad"
          >
            <FiHelpCircle />
          </button>
          <button type="button" onClick={() => irARuta("/login")} aria-label="Salir">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* ===================== CONTENIDO ===================== */}
      <section className="gen1-content">
        <CabeceraCurricular curriculum={activityCurriculum["mathdata-generador-energia"]} />
        

        <div className="gen1-topbar">


          <span className="gen1-step-pill">Actividad 1 de 2</span>

          <button
            type="button"
            className="gen1-help-circle"
            onClick={() => setMostrarAyudaActividad(true)}
            aria-label="Ayuda de la actividad"
          >
            <FiHelpCircle />
          </button>
        </div>

        {mostrarAyudaActividad && (
          <AyudaActividadModal onClose={() => setMostrarAyudaActividad(false)} />
        )}

        <div className="gen1-hero">
          <div className="gen1-hero-text">
            <h1>
              Generador de Energía Inversa⚡ <span></span>
            </h1>
            <p>
              La base MathNova necesita recargar su escudo de protección
              antes del amanecer. Activa el panel de control de los
              reactores y completa la tabla y la gráfica para descubrir el
              patrón de proporcionalidad inversa.
            </p>

            <button
              type="button"
              className="gen1-villano-trigger"
              onClick={() => setMostrarIntroVillano(true)}
              aria-label="Abrir mensaje interceptado del villano"
            >
              <span className="gen1-villano-trigger-dot" />
              <FaBroadcastTower />
              Mensaje interceptado
            </button>
          </div>

          <div className="gen1-hero-imagen-wrap">
            <img src={heroBanner} alt="" className="gen1-hero-bg" />
          </div>
        </div>
<EnsayoOtrosMundos activityId="mathdata-generador-energia"/>


        {/* MENSAJE DE FEEDBACK */}
        {mensajeFeedback && (
          <div className={
            mensajeFeedback.includes("✅") || mensajeFeedback.includes("🎉")
              ? "gen1-feedback-success"
              : "gen1-feedback-error"
          }>
            {mensajeFeedback}
          </div>
        )}

        {/* MENSAJE DE ACTIVIDAD COMPLETADA */}
        {actividadCompletada && (
          <div className="gen1-completada-box">
            🎉 ¡Misión completada! Resultado del intento: {xpGanado} XP.
          </div>
        )}

        <div className="gen1-board">
          {/* PASO 1: TABLA */}
          <section className="gen1-card gen1-card-table">
            <header className="gen1-card-header">
              <span className="gen1-step-number">1</span>
              <h2>Completa la tabla de valores.</h2>
            </header>
            <p className="gen1-card-subtext">
              Observa los datos iniciales y completa los espacios en blanco.
            </p>

            <table className="gen1-table">
              <thead>
                <tr>
                  <th className="gen1-th-blue">Reactores conectados (x)</th>
                  <th className="gen1-th-green">Tiempo de recarga (horas) (y)</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, index) => (
                  <tr key={fila.x}>
                    <td>{fila.x}</td>
                    <td>
                      {fila.editable ? (
                        <input
                          className="gen1-table-input"
                          type="number"
                          data-review-target="native-tabla" value={fila.y}
                          placeholder=""
                          aria-label={`Tiempo para ${fila.x} reactores`}
                          onChange={(e) => actualizarFila(index, e.target.value)}
                          style={{
                            borderColor: fila.asistida ? "#fd7e14" : fila.correcto === true ? "#28a745" : fila.correcto === false ? "#dc3545" : undefined,
                            backgroundColor: fila.asistida ? "#fff3e0" : fila.correcto === true ? "#d4edda" : fila.correcto === false ? "#f8d7da" : undefined
                          }}
                          disabled={cargando || fila.correcto === true || fila.bloqueada || actividadCompletada}
                        />
                      ) : (
                        fila.y
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <header className="gen1-card-header gen1-card-header-spaced">
              <span className="gen1-step-number">2</span>
              <h2>Traza la gráfica en el plano cartesiano.</h2>
            </header>
            <p className="gen1-card-subtext">
              Marca los puntos de la tabla en la gráfica y une con una curva
              suave.
            </p>

            <div className="gen1-tip-box">
              <FaLightbulb />
              <span>
                Recuerda: Proporcionalidad inversa &rarr; y = k/x
              </span>
            </div>

            <div className="gen1-table-actions">
              <button type="button" className="gen1-btn-outline" onClick={limpiarGrafica}>
                <FiRotateCcw />
                Limpiar gráfica
              </button>
              <button type="button" className="gen1-btn-primary" onClick={handleVerificarPuntos}>
                <FiCheck />
                Verificar puntos
              </button>
            </div>
          </section>

          {/* GRAFICA */}
          <section data-review-target="native-grafica" className="gen1-card gen1-card-graph">
            <h3 className="gen1-graph-title">Tiempo de recarga (horas)</h3>

            <div
              className="gen1-graph-area"
              onClick={(event) => {
                if (
                  cargando ||
                  actividadCompletada
                ) {
                  return;
                }

                manejarClickGrafica(
                  event,
                );
              }}
            >
              <div className="gen1-graph-grid">
                {Array.from({ length: EJE_X_MAX }).map((_, i) => (
                  <i key={`v-${i}`} className="gen1-grid-line-v" />
                ))}
                {Array.from({ length: EJE_Y_MAX / 2 }).map((_, i) => (
                  <i key={`h-${i}`} className="gen1-grid-line-h" />
                ))}
              </div>

              {puntos.map((p, i) => (
                <span
                  key={i}
                  className="gen1-graph-point"
                  style={{
                    left: `${(p.x / EJE_X_MAX) * 100}%`,
                    bottom: `${(p.y / EJE_Y_MAX) * 100}%`,
                  }}
                />
              ))}

              {puntosIncorrectos.map((p, i) => (
                <span
                  key={`err-${i}`}
                  className="gen1-graph-point gen1-graph-point-error"
                  style={{
                    left: `${(p.x / EJE_X_MAX) * 100}%`,
                    bottom: `${(p.y / EJE_Y_MAX) * 100}%`,
                  }}
                />
              ))}

              {puntosAsistidos.map((p, i) => (
                <span
                  key={`asist-${i}`}
                  className="gen1-graph-point gen1-graph-point-asistido"
                  style={{
                    left: `${(p.x / EJE_X_MAX) * 100}%`,
                    bottom: `${(p.y / EJE_Y_MAX) * 100}%`,
                  }}
                />
              ))}

              <div className="gen1-graph-y-labels">
                {[14, 12, 10, 8, 6, 4, 2, 0].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>

            <div className="gen1-graph-x-labels">
              {Array.from({ length: EJE_X_MAX + 1 }).map((_, i) => (
                <span key={i}>{i}</span>
              ))}
            </div>
            <span className="gen1-graph-x-title">Reactores conectados</span>

            <div className="gen1-hint-bar">
              <FaHandPointUp />
              <p>
                Haz clic en la cuadrícula para colocar un punto. Puedes
                arrastrarlo para ajustarlo.
              </p>
            </div>
          </section>

          {/* PASO 3: PREDICCION */}
          <section className="gen1-card gen1-card-predict">
            <header className="gen1-card-header">
              <span className="gen1-step-number">3</span>
              <h2>Predice y responde.</h2>
            </header>

            <p className="gen1-card-subtext">
              Si el escudo debe recargarse en solo 2 horas, ¿cuántos
              reactores se necesitan?
            </p>

            <div className="gen1-answer-row">
              <input
                className="gen1-answer-input"
                type="number"
                placeholder="Escribe tu respuesta"
                aria-label="Respuesta de predicción"
                data-review-target="native-prediccion" value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                disabled={actividadCompletada}
              />
              <span>reactores</span>
            </div>

            <button
              type="button"
              className="gen1-pista-box"
              onClick={() => setMostrarPistaModal(true)}
            >
              <img src={baitPistaImg} alt="" className="gen1-pista-icono" />
              <div>
                <strong>Pista de Bait</strong>
                <p>Usa el patrón que encontraste en la tabla o en la gráfica.</p>
              </div>
            </button>

            <p className="mn-finish-direction">Cuando completes los retos, usa «Terminar misión» al final de la actividad.</p>

            <div className="gen1-mission-box">
              <div>
                <strong>Tu misión</strong>
                <p>
                  Completa la tabla, traza la gráfica y predice cuántos
                  reactores se necesitan para recargar el escudo en 2 horas.
                </p>
              </div>
              <FaShieldAlt className="gen1-mission-icon" />
            </div>
          </section>
        </div>

        <PilotEvidenceStatus pilot={pilot}/>
<RetosDeMision expansion={mission}/><CierreDeMision onFinish={()=>void handleEnviarPrediccion()} busy={pilot.busy}/>
<footer className="gen1-bottom-bar">
          <div className="gen1-bottom-progress">
            <span>Progreso de la actividad</span>
            <div className="gen1-progress-track">
              <i style={{ width: `${progresoPorcentaje}%` }} />
            </div>
            <strong>{progresoPorcentaje}%</strong>
          </div>

          <div className="gen1-bottom-reward">
            <span>Recompensa por completar</span>
            <strong>
              <FaStar /> Hasta 60 XP
            </strong>
            <strong>
              <FaGem /> +1
            </strong>
            <strong>
              <FaShieldAlt /> +1
            </strong>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default GeneradorEnergiaInversa;
