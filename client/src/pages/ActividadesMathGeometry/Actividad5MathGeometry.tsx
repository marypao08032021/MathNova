import {useLiveEvidence} from '../../utils/livePresence';
import usePilotEvidence from "../../hooks/usePilotEvidence";
import PilotEvidenceStatus from "../../components/PilotEvidenceStatus";
import {resetPilotSession} from "../../utils/pilotEvidence";
import AudioRetroalimentacion from "../../components/AudioRetroalimentacion";
import useMissionExpansion from "../../hooks/useMissionExpansion";
import EnsayoOtrosMundos from "../../components/EnsayoOtrosMundos";
import ContinuacionDeMision from "../../components/ContinuacionDeMision";
import DetalleErroresDeMision from "../../components/DetalleErroresDeMision";
import CabeceraCurricular from "../../components/CabeceraCurricular";
import { activityCurriculum } from "../../curriculum/activityCurriculum";
import "../../styles/activityExperience.css";
import { useAutoProgreso } from "../../hooks/useAutoProgreso";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  getSessionUser,
  hasAuthSession,
  isGuestSession,
} from "../../utils/authSession";

import "./Actividad5MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividad5/banner_act5_MathGeometry.png";
import reto1 from "../../assets/mathGeometry/actividad5/reto1_primer_soporte_de_puente_MathGeometry.png";
import reto2 from "../../assets/mathGeometry/actividad5/reto2_segundo_soporte_de_puente_MathGeometry.png";
import reto3 from "../../assets/mathGeometry/actividad5/reto3_soporte_de_la_torre_MathGeometry.png";
import reto4 from "../../assets/mathGeometry/actividad5/reto4_puente_de_la_pendiente_MathGeometry.png";
import reto5 from "../../assets/mathGeometry/actividad5/reto5_puente_del_gran_barranco_MathGeometry.png";
import reto6 from "../../assets/mathGeometry/actividad5/reto6_ultimo_puente_MathGeometry.png";

import byteImagen from "../../assets/mathGeometry/actividad5/byte-act5-mathgeometry.png";
import profesorConsejoImagen from "../../assets/mathGeometry/actividad5/profesor_dando_consejo_actividad_5.png";
import sombraErrorImagen from "../../assets/mathGeometry/actividad5/sombra-error_act5.png";
import bannerCompletado from "../../assets/mathGeometry/actividad5/actividad_completada_5_banner_MathGeometry.png";

import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiClock,
  FiFlag,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMessageSquare,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSettings,
  FiTarget,
  FiUser,
  FiVolume2,
  FiX,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

type OpcionId = "A" | "B" | "C" | "D" | "E";
type EstadoRevision = "pendiente" | "correcto" | "incorrecto";
type ModalId = "profesor" | "byte" | "sombra" | "completado" | null;
type PistaAct5Id = "frente" | "linea" | "letras";
type PersonajePistaAct5 = "Nova" | "Profesor Astro" | "Byte";
type PersonajeAciertoAct5 = "Byte" | "Nova" | "Profesor Astro";

type AciertoEspecialAct5 = {
  personaje: PersonajeAciertoAct5;
  audio: string;
  video: string;
  titulo: string;
  mensaje: string;
  cierre: string;
  clase: "byte" | "nova" | "profesor";
};

type SessionUser = {
  rol?: string;
  role?: string;
  tipo_usuario?: string;
  role_id?: number | string;
  roleId?: number | string;
  id_rol?: number | string;
};

type Reto = {
  id: number;
  imagen: string;
  pregunta: string;
  opciones: Array<{ id: OpcionId; texto: string }>;
  correcta: OpcionId;
};

import videoNova from "../../assets/mathGeometry/actividad5/nova_explicando_act_5_MathGeometry.mp4";
import videoProfesor from "../../assets/mathGeometry/actividad5/instrucciones_profe_astro_act_5_MathGeometry.mp4";
import videoByte from "../../assets/mathGeometry/actividad5/byte_aciertos_y_pistas_act_5_MathGeometry.mp4";
import videoSombra from "../../assets/mathGeometry/actividad5/act_4_sombra_error_MathGeometry_.mp4";

/* AUDIOS NUEVOS DE BIENVENIDA E INSTRUCCIONES DE LA ACTIVIDAD 5 */
import audioNovaIntroduccion from "../../assets/mathGeometry/actividad5/act5_bienvenida_nova_MathGeometry.mp3";
import audioProfesorAstro from "../../assets/mathGeometry/actividad5/act5_instrucciones_profe_MathGeometry.mp3";
import audioPistaNova from "../../assets/mathGeometry/actividad5/act5_nova_Pista_1_Observa_los_extremos_MathGeometry.mp3";
import audioPistaProfesor from "../../assets/mathGeometry/actividad5/act5_profe_astro_Pista_2_Compara_los_dos_lados_MathGeometry.mp3";
import audioPistaByte from "../../assets/mathGeometry/actividad5/act5_byte_Pista_3_Segmento_inclinado_MathGeometry.mp3";
import audioSombraError from "../../assets/mathGeometry/actividad5/act5_cuando_se_equivoca_sombra_del_error_MathGeometry.mp3";
import audioNovaCierre from "../../assets/mathGeometry/actividad5/act5_nova_cierre_MathGeometry.mp3";

/*
  Audios de bienvenida, explicación, pistas, error y cierre ya integrados.
  Las felicitaciones flotantes permanecen desactivadas temporalmente.
*/
const audioByteAcierto = "";
const audioProfesorAcierto = "";
const audioNovaAcierto = "";

const RETOS: Reto[] = [
  {
    id: 1,
    imagen: reto1,
    pregunta: "Selecciona el punto que está justo en la mitad del segmento.",
    opciones: [
      { id: "B", texto: "Punto B" },
      { id: "A", texto: "Punto A" },
      { id: "C", texto: "Punto C" },
    ],
    correcta: "B",
  },
  {
    id: 2,
    imagen: reto2,
    pregunta: "¿Qué número está exactamente en el punto medio del segmento?",
    opciones: [
      { id: "A", texto: "Punto 1" },
      { id: "B", texto: "Punto 2" },
      { id: "D", texto: "Punto 4" },
      { id: "E", texto: "Punto 5" },
      { id: "C", texto: "Punto 3" },
    ],
    correcta: "C",
  },
  {
    id: 3,
    imagen: reto3,
    pregunta:
      "Observa el soporte vertical y elige la figura que está en el punto medio.",
    opciones: [
      { id: "A", texto: "Estrella" },
      { id: "C", texto: "Círculo" },
      { id: "B", texto: "Triángulo" },
    ],
    correcta: "B",
  },
  {
    id: 4,
    imagen: reto4,
    pregunta:
      "Selecciona el punto que queda más cerca de la mitad del puente inclinado.",
    opciones: [
      { id: "C", texto: "Punto R" },
      { id: "A", texto: "Punto P" },
      { id: "D", texto: "Punto S" },
      { id: "B", texto: "Punto Q" },
    ],
    correcta: "C",
  },
  {
    id: 5,
    imagen: reto5,
    pregunta: "Encuentra el punto medio del puente del gran barranco.",
    opciones: [
      { id: "A", texto: "Punto B" },
      { id: "C", texto: "Punto D" },
      { id: "B", texto: "Punto C" },
      { id: "D", texto: "Punto E" },
    ],
    correcta: "C",
  },
  {
    id: 6,
    imagen: reto6,
    pregunta:
      "Selecciona la figura que está exactamente en la mitad del último puente.",
    opciones: [
      { id: "A", texto: "Rombo" },
      { id: "C", texto: "Cuadrado" },
      { id: "E", texto: "Corazón" },
      { id: "B", texto: "Círculo" },
      { id: "D", texto: "Estrella" },
    ],
    correcta: "C",
  },
];

const GUION_NOVA_INTRODUCCION = [
  "¡Hola, explorador de MathNova!",
  "Hoy entraremos al Taller del Ingeniero.",
  "Necesitamos construir varios puentes para avanzar por el camino.",
  "Observa cada segmento y elige el punto que está justo en la mitad.",
  "¡Vamos a comenzar la misión!",
];

const GUION_PROFESOR_ASTRO = [
  "Un segmento es una línea que tiene dos extremos.",
  "El punto medio está exactamente entre esos dos extremos.",
  "Tu tarea será observar el segmento y elegir el punto que lo divide en dos partes iguales.",
  "Fíjate si queda el mismo espacio a la izquierda y a la derecha.",
  "Cuando elijas tu respuesta, comprobaremos si el soporte quedó justo en el centro del puente.",
];

const TEXTO_INICIAL_NOVA =
  "Presiona reproducir para escuchar la introducción de Nova.";
const TEXTO_FINAL_NOVA = "¡Vamos a comenzar la misión!";
const TEXTO_INICIAL_PROFESOR =
  "Presiona reproducir para escuchar la explicación del Profesor Astro.";
const TEXTO_FINAL_PROFESOR =
  "Comprobaremos si el soporte quedó justo en el centro del puente.";

const GUION_SOMBRA_ERROR = [
  "Casi lo logras.",
  "Observa otra vez los dos extremos del segmento.",
  "Compara el espacio que queda a cada lado del punto.",
  "Recuerda: el punto medio debe estar justo en el centro.",
  "¡Inténtalo una vez más!",
];

const TEXTO_INICIAL_SOMBRA =
  "Presiona reproducir para escuchar el mensaje de Sombra.";
const TEXTO_FINAL_SOMBRA = "¡Inténtalo una vez más!";

const GUION_NOVA_CIERRE = [
  "¡Misión completada!",
  "Construiste los puentes del Taller del Ingeniero.",
  "Hoy aprendiste que el punto medio divide un segmento en dos partes iguales.",
  "Cada puente completado quedó registrado como evidencia de tu avance.",
  "¡Muy buen trabajo, ingeniero de MathNova!",
];

const TEXTO_INICIAL_COMPLETADO =
  "Presiona reproducir para escuchar el mensaje final de Nova.";
const TEXTO_FINAL_COMPLETADO = "¡Muy buen trabajo, ingeniero de MathNova!";

const PISTAS_ACT5: Record<
  PistaAct5Id,
  {
    id: PistaAct5Id;
    titulo: string;
    subtitulo: string;
    personaje: PersonajePistaAct5;
    audio: string;
    video: string;
    guion: string[];
  }
> = {
  frente: {
    id: "frente",
    titulo: "Pista 1: Extremos",
    subtitulo: "Pista espacial",
    personaje: "Nova",
    audio: audioPistaNova,
    video: videoNova,
    guion: [
      "Pista espacial:",
      "Mira dónde comienza y dónde termina el segmento.",
      "Después busca el punto que queda justo entre los dos extremos.",
      "¡Ese puede ser el centro del puente!",
    ],
  },
  linea: {
    id: "linea",
    titulo: "Pista 2: Dos Lados",
    subtitulo: "Pista de ingeniero",
    personaje: "Profesor Astro",
    audio: audioPistaProfesor,
    video: videoProfesor,
    guion: [
      "Pista de ingeniero:",
      "Imagina que el punto divide el puente en dos partes.",
      "Elige el punto donde ambos lados se vean del mismo tamaño.",
      "Si las dos partes son iguales, encontraste el punto medio.",
    ],
  },
  letras: {
    id: "letras",
    titulo: "Pista 3: Inclinado",
    subtitulo: "Pista de análisis",
    personaje: "Byte",
    audio: audioPistaByte,
    video: videoByte,
    guion: [
      "Pista de análisis:",
      "Aunque el segmento esté inclinado, el punto medio sigue estando en la mitad.",
      "No importa si va horizontal, vertical o diagonal.",
      "Observa los extremos y busca el centro.",
    ],
  },
};

const ORDEN_PISTAS_ACT5: PistaAct5Id[] = ["frente", "linea", "letras"];
const TEXTO_INICIAL_PISTA = "Elige una de las tres pistas para escucharla.";

/*
  Las felicitaciones flotantes quedan desactivadas temporalmente.
  Así, al acertar, el botón "Siguiente" se habilita inmediatamente y
  permite avanzar sin esperar una animación o audio que todavía no existe.
*/
const ACIERTOS_ESPECIALES_ACT5: Partial<Record<number, AciertoEspecialAct5>> =
  {};

function obtenerTextoSincronizado(
  tiempo: number,
  duracion: number,
  guion: string[],
) {
  const duracionSegura =
    Number.isFinite(duracion) && duracion > 0 ? duracion : guion.length * 2.5;
  const pesos = guion.map((linea) => Math.max(1, linea.length));
  const totalPesos = pesos.reduce((total, peso) => total + peso, 0) || 1;
  let inicio = 0;

  for (let indice = 0; indice < guion.length; indice += 1) {
    const duracionLinea = (pesos[indice] / totalPesos) * duracionSegura;
    const fin = inicio + duracionLinea;

    if (tiempo >= inicio && tiempo < fin) {
      const progreso = Math.min(
        1,
        Math.max(0, (tiempo - inicio) / duracionLinea),
      );
      const texto = guion[indice];
      const letras = Math.max(
        1,
        Math.ceil(texto.length * Math.min(1, progreso * 1.55)),
      );

      return {
        texto: texto.slice(0, letras),
        indice,
        progresoLinea: Math.round(progreso * 100),
      };
    }

    inicio = fin;
  }

  return {
    texto: guion[guion.length - 1],
    indice: guion.length - 1,
    progresoLinea: 100,
  };
}

function limpiarFondoBlancoDeBordes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const total = width * height;
  const visitado = new Uint8Array(total);
  const pila: number[] = [];

  const esFondoClaro = (index: number) => {
    const pixel = index * 4;
    const r = data[pixel];
    const g = data[pixel + 1];
    const b = data[pixel + 2];

    const esClaro = r > 218 && g > 218 && b > 218;
    const casiSinColor =
      Math.abs(r - g) < 38 && Math.abs(r - b) < 38 && Math.abs(g - b) < 38;

    return esClaro && casiSinColor;
  };

  const agregar = (index: number) => {
    if (
      index < 0 ||
      index >= total ||
      visitado[index] ||
      !esFondoClaro(index)
    ) {
      return;
    }

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

function dibujarVideoSinEstirar(
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

type VideoCanvasProps = {
  src: string;
  className?: string;
  canvasClassName?: string;
  width?: number;
  height?: number;
  playing?: boolean;
  restartSignal?: number;
  loopWhenPlaying?: boolean;
  onEnded?: () => void;
  label: string;
};

function VideoCanvasTransparente({
  src,
  className = "",
  canvasClassName = "",
  width = 360,
  height = 640,
  playing = true,
  restartSignal = 0,
  loopWhenPlaying = false,
  onEnded,
  label,
}: VideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoListo, setVideoListo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let frame = 0;
    let ultimoDibujo = 0;

    const dibujar = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, width, height);
        dibujarVideoSinEstirar(ctx, video, width, height);
        limpiarFondoBlancoDeBordes(ctx, width, height);
        ultimoDibujo = tiempo;
      }

      frame = window.requestAnimationFrame(dibujar);
    };

    const primerFrame = () => {
      if (video.readyState < 2) return;
      setVideoListo(true);
      setVideoError(false);
      ctx.clearRect(0, 0, width, height);
      dibujarVideoSinEstirar(ctx, video, width, height);
      limpiarFondoBlancoDeBordes(ctx, width, height);

      if (playing) {
        void video.play().catch(() => undefined);
      }
    };

    const manejarError = () => {
      setVideoError(true);
      setVideoListo(false);
    };

    video.addEventListener("loadeddata", primerFrame);
    video.addEventListener("canplay", primerFrame);
    video.addEventListener("error", manejarError);
    frame = window.requestAnimationFrame(dibujar);

    return () => {
      video.removeEventListener("loadeddata", primerFrame);
      video.removeEventListener("canplay", primerFrame);
      video.removeEventListener("error", manejarError);
      window.cancelAnimationFrame(frame);
    };
  }, [height, src, width]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = loopWhenPlaying;
    video.playsInline = true;

    if (playing) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [loopWhenPlaying, playing, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;

    if (playing) {
      void video.play().catch(() => undefined);
    }
  }, [restartSignal]);

  return (
    <div className={`act5geo-transparent-video ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="act5geo-source-video"
        muted
        playsInline
        aria-label={label}
        onEnded={onEnded}
      />
      <canvas
        ref={canvasRef}
        className={`${canvasClassName} ${videoListo ? "act5geo-canvas-visible" : ""}`}
        aria-label={label}
      />

      {!videoListo && !videoError && (
        <div className="act5geo-video-loading" aria-hidden="true">
          <span />
        </div>
      )}

      {videoError && (
        <div className="act5geo-video-error">
          No se pudo cargar la animación.
        </div>
      )}
    </div>
  );
}

function Actividad5MathGeometry() {
 const mission=useMissionExpansion("mathgeometry-actividad-5");
 const pilot=usePilotEvidence("mathgeometry-actividad-5");
 const nativeAnswers=useRef<Record<string,string>>({});
 const hintUsed=useRef(false);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [retoActual, setRetoActual] = useState(0);
  const [seleccion, setSeleccion] = useState<OpcionId | null>(null);
  const [revision, setRevision] = useState<EstadoRevision>("pendiente");
  const [errores, setErrores] = useState(0);
  const [completados, setCompletados] = useState(0);
  const [modal, setModal] = useState<ModalId>(null);
  const [pausado, setPausado] = useState(false);
  const [segundos, setSegundos] = useState(0);

  /* La animación de Nova solo se reproduce al presionar Play. */
  const [novaReproduciendo, setNovaReproduciendo] = useState(false);
  const [reinicioNova, setReinicioNova] = useState(0);
  const audioNovaRef = useRef<HTMLAudioElement | null>(null);
  const [textoNova, setTextoNova] = useState(TEXTO_INICIAL_NOVA);
  const [indiceNovaActivo, setIndiceNovaActivo] = useState(-1);

  /* Animaciones de los modales: detenidas hasta presionar Play. */
  const [modalReproduciendo, setModalReproduciendo] = useState(false);
  const [reinicioModal, setReinicioModal] = useState(0);
  const audioProfesorRef = useRef<HTMLAudioElement | null>(null);
  const [textoProfesor, setTextoProfesor] = useState(TEXTO_INICIAL_PROFESOR);
  const [indiceProfesorActivo, setIndiceProfesorActivo] = useState(-1);
  const [progresoProfesorActivo, setProgresoProfesorActivo] = useState(0);

  /* Modal de respuesta incorrecta con Sombra. */
  const audioSombraRef = useRef<HTMLAudioElement | null>(null);
  const [textoSombra, setTextoSombra] = useState(TEXTO_INICIAL_SOMBRA);
  const [indiceSombraActivo, setIndiceSombraActivo] = useState(-1);
  const [progresoSombraActivo, setProgresoSombraActivo] = useState(0);

  /* Pistas de Nova, Profesor Astro y Byte. */
  const [pistaSeleccionada, setPistaSeleccionada] =
    useState<PistaAct5Id>("frente");
  const [textoPista, setTextoPista] = useState(TEXTO_INICIAL_PISTA);
  const [indicePistaActivo, setIndicePistaActivo] = useState(-1);
  const [progresoPistaActivo, setProgresoPistaActivo] = useState(0);
  const audioPistaRef = useRef<HTMLAudioElement | null>(null);

  /* Animación, audio y texto de Nova en misión completada. */
  const [completadoReproduciendo, setCompletadoReproduciendo] = useState(false);
  const [reinicioCompletado, setReinicioCompletado] = useState(0);
  const audioCompletadoRef = useRef<HTMLAudioElement | null>(null);
  const [textoCompletado, setTextoCompletado] = useState(
    TEXTO_INICIAL_COMPLETADO,
  );
  const [indiceCompletadoActivo, setIndiceCompletadoActivo] = useState(-1);
  const [progresoCompletadoActivo, setProgresoCompletadoActivo] = useState(0);

  /* Tres felicitaciones automáticas: Byte, Nova y Profesor Astro. */
  const [aciertoEspecial, setAciertoEspecial] =
    useState<AciertoEspecialAct5 | null>(null);
  const [aciertoEspecialReproduciendo, setAciertoEspecialReproduciendo] =
    useState(false);
  const [reinicioAciertoEspecial, setReinicioAciertoEspecial] = useState(0);
  const audioAciertoEspecialRef = useRef<HTMLAudioElement | null>(null);
  const aciertoEspecialFallbackRef = useRef<number | null>(null);
  const retoAciertoEspecialRef = useRef<number | null>(null);

  const reto = RETOS[retoActual];
  const pistaActiva = PISTAS_ACT5[pistaSeleccionada];
  const progreso = Math.round((completados / RETOS.length) * 100);

  useAutoProgreso({
    completada: modal === "completado",
    codigo: "mathgeometry-actividad-5",
    mundo: "MathGeometry",
    tema: "Punto medio de un segmento",
    titulo: "El Taller del Ingeniero",
    aciertos: RETOS.length + mission.correctCount,
    totalPreguntas: mission.total,
    tiempoSegundos: segundos,
    xpBase: 240,
    respuestas: {
      mission_expansion: mission.evidence,
      piloto_nativas: {...nativeAnswers.current},
      piloto: {retroalimentacion_vista:errores>0||mission.correctOnly,pista_declarada:hintUsed.current},
      errores,
      puentes_completados: RETOS.length,
    },
  });

  useEffect(()=>{if(mission.reviewSequence>0)void pilot.record({piloto_nativas:{...nativeAnswers.current},mission_expansion:mission.evidence},{retroalimentacion_vista:errores>0||mission.correctOnly,pista_declarada:hintUsed.current});},[mission.reviewSequence]);

 useLiveEvidence("mathgeometry-actividad-5",()=>({piloto_nativas:{...nativeAnswers.current},mission_expansion:mission.evidence}));
  const tiempo = useMemo(() => {
    const minutos = Math.floor(segundos / 60)
      .toString()
      .padStart(2, "0");
    const segundosRestantes = (segundos % 60).toString().padStart(2, "0");
    return `${minutos}:${segundosRestantes}`;
  }, [segundos]);

  useEffect(() => {
    if (pausado || modal !== null || aciertoEspecial !== null) return;

    const timer = window.setInterval(() => {
      setSegundos((valor) => valor + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [pausado, modal, aciertoEspecial !== null]);

  useEffect(() => {
    if (pausado || modal !== null || aciertoEspecial !== null) {
      audioNovaRef.current?.pause();
      setNovaReproduciendo(false);
    }
  }, [pausado, modal, aciertoEspecial !== null]);

  useEffect(() => {
    audioProfesorRef.current?.pause();
    audioPistaRef.current?.pause();
    audioSombraRef.current?.pause();
    audioCompletadoRef.current?.pause();
    setModalReproduciendo(false);

    if (modal === "profesor") {
      setTextoProfesor(TEXTO_INICIAL_PROFESOR);
      setIndiceProfesorActivo(-1);
      setProgresoProfesorActivo(0);
    }

    if (modal === "byte") {
      setTextoPista(TEXTO_INICIAL_PISTA);
      setIndicePistaActivo(-1);
      setProgresoPistaActivo(0);
      setPistaSeleccionada("frente");
    }

    if (modal === "sombra") {
      setTextoSombra(TEXTO_INICIAL_SOMBRA);
      setIndiceSombraActivo(-1);
      setProgresoSombraActivo(0);
    }

    if (modal === "completado") {
      setTextoCompletado(TEXTO_INICIAL_COMPLETADO);
      setIndiceCompletadoActivo(-1);
      setProgresoCompletadoActivo(0);
    } else {
      setCompletadoReproduciendo(false);
    }
  }, [modal]);

  /*
    Cuando la respuesta es incorrecta, el modal de Sombra se abre y comienza
    automáticamente. No es necesario presionar Reproducir.
  */
  useEffect(() => {
    if (modal !== "sombra") return;

    const temporizador = window.setTimeout(() => {
      const audio = audioSombraRef.current;
      if (!audio || !audio.src) return;

      audio.currentTime = 0;
      setTextoSombra("");
      setIndiceSombraActivo(0);
      setProgresoSombraActivo(0);
      setReinicioModal((valor) => valor + 1);
      setModalReproduciendo(true);

      void audio.play().catch(() => {
        setModalReproduciendo(false);
        setTextoSombra(TEXTO_INICIAL_SOMBRA);
      });
    }, 120);

    return () => window.clearTimeout(temporizador);
  }, [modal]);

  /*
    Cuando se completa la actividad, el modal final se abre y Nova comienza
    automáticamente. No es necesario presionar el botón Reproducir.
  */
  useEffect(() => {
    if (modal !== "completado") return;

    const temporizador = window.setTimeout(() => {
      const audio = audioCompletadoRef.current;
      if (!audio || !audio.src) return;

      audio.currentTime = 0;
      setTextoCompletado("");
      setIndiceCompletadoActivo(0);
      setProgresoCompletadoActivo(0);
      setReinicioCompletado((valor) => valor + 1);
      setCompletadoReproduciendo(true);

      void audio.play().catch(() => {
        setCompletadoReproduciendo(false);
        setTextoCompletado(TEXTO_INICIAL_COMPLETADO);
      });
    }, 140);

    return () => window.clearTimeout(temporizador);
  }, [modal]);

  useEffect(() => {
    const bloquear = menuOpen || modal !== null;
    const body = document.body;
    const html = document.documentElement;

    body.classList.toggle("act5geo-body-locked", bloquear);
    html.classList.toggle("act5geo-html-locked", bloquear);

    return () => {
      body.classList.remove("act5geo-body-locked");
      html.classList.remove("act5geo-html-locked");
    };
  }, [menuOpen, modal]);

  const reproducirNova = () => {
    if (pausado || modal !== null || aciertoEspecial !== null) return;
    const audio = audioNovaRef.current;
    if (!audio || !audio.src) return;

    if (audio.ended || audio.currentTime >= audio.duration) {
      audio.currentTime = 0;
      setReinicioNova((valor) => valor + 1);
    }

    setNovaReproduciendo(true);
    void audio.play().catch(() => setNovaReproduciendo(false));
  };

  const pausarNova = () => {
    audioNovaRef.current?.pause();
    setNovaReproduciendo(false);
  };

  const reiniciarIntroduccionNova = () => {
    const audio = audioNovaRef.current;
    if (!audio || pausado || modal !== null || aciertoEspecial !== null) return;
    audio.currentTime = 0;
    setTextoNova("");
    setIndiceNovaActivo(0);
    setReinicioNova((valor) => valor + 1);
    setNovaReproduciendo(true);
    void audio.play().catch(() => setNovaReproduciendo(false));
  };

  const actualizarTextoNova = () => {
    const audio = audioNovaRef.current;
    if (!audio || !audio.src) return;
    const estado = obtenerTextoSincronizado(
      audio.currentTime,
      audio.duration,
      GUION_NOVA_INTRODUCCION,
    );
    setTextoNova(estado.texto);
    setIndiceNovaActivo(estado.indice);
  };

  const reproducirProfesor = () => {
    const audio = audioProfesorRef.current;
    if (!audio || !audio.src || modal !== "profesor") return;

    if (audio.ended || audio.currentTime >= audio.duration) {
      audio.currentTime = 0;
      setReinicioModal((valor) => valor + 1);
    }

    setModalReproduciendo(true);
    void audio.play().catch(() => setModalReproduciendo(false));
  };

  const pausarProfesor = () => {
    audioProfesorRef.current?.pause();
    setModalReproduciendo(false);
  };

  const reiniciarProfesor = () => {
    const audio = audioProfesorRef.current;
    if (!audio || !audio.src || modal !== "profesor") return;
    audio.currentTime = 0;
    setTextoProfesor("");
    setIndiceProfesorActivo(0);
    setProgresoProfesorActivo(0);
    setReinicioModal((valor) => valor + 1);
    setModalReproduciendo(true);
    void audio.play().catch(() => setModalReproduciendo(false));
  };

  const actualizarTextoProfesor = () => {
    const audio = audioProfesorRef.current;
    if (!audio || !audio.src) return;
    const estado = obtenerTextoSincronizado(
      audio.currentTime,
      audio.duration,
      GUION_PROFESOR_ASTRO,
    );
    setTextoProfesor(estado.texto);
    setIndiceProfesorActivo(estado.indice);
    setProgresoProfesorActivo(estado.progresoLinea);
  };

  const seleccionarPista = (id: PistaAct5Id) => {
    audioPistaRef.current?.pause();
    if (audioPistaRef.current) audioPistaRef.current.currentTime = 0;
    setPistaSeleccionada(id);
    setTextoPista(TEXTO_INICIAL_PISTA);
    setIndicePistaActivo(-1);
    setProgresoPistaActivo(0);
    setModalReproduciendo(false);
    setReinicioModal((valor) => valor + 1);
  };

  const reproducirPista = () => {hintUsed.current=true;
    const audio = audioPistaRef.current;
    if (!audio || !audio.src || modal !== "byte") return;

    if (audio.ended || audio.currentTime >= audio.duration) {
      audio.currentTime = 0;
      setReinicioModal((valor) => valor + 1);
    }

    setModalReproduciendo(true);
    void audio.play().catch(() => setModalReproduciendo(false));
  };

  const pausarPista = () => {
    audioPistaRef.current?.pause();
    setModalReproduciendo(false);
  };

  const reiniciarPista = () => {
    const audio = audioPistaRef.current;
    if (!audio || !audio.src || modal !== "byte") return;
    audio.currentTime = 0;
    setTextoPista("");
    setIndicePistaActivo(0);
    setProgresoPistaActivo(0);
    setReinicioModal((valor) => valor + 1);
    setModalReproduciendo(true);
    void audio.play().catch(() => setModalReproduciendo(false));
  };

  const actualizarTextoPista = () => {
    const audio = audioPistaRef.current;
    if (!audio || !audio.src) return;
    const estado = obtenerTextoSincronizado(
      audio.currentTime,
      audio.duration,
      pistaActiva.guion,
    );
    setTextoPista(estado.texto);
    setIndicePistaActivo(estado.indice);
    setProgresoPistaActivo(estado.progresoLinea);
  };

  const reproducirSombra = () => {
    const audio = audioSombraRef.current;
    if (!audio || !audio.src || modal !== "sombra") return;

    if (audio.ended || audio.currentTime >= audio.duration) {
      audio.currentTime = 0;
      setReinicioModal((valor) => valor + 1);
    }

    setModalReproduciendo(true);
    void audio.play().catch(() => setModalReproduciendo(false));
  };

  const pausarSombra = () => {
    audioSombraRef.current?.pause();
    setModalReproduciendo(false);
  };

  const reiniciarSombra = () => {
    const audio = audioSombraRef.current;
    if (!audio || !audio.src || modal !== "sombra") return;

    audio.currentTime = 0;
    setTextoSombra("");
    setIndiceSombraActivo(0);
    setProgresoSombraActivo(0);
    setReinicioModal((valor) => valor + 1);
    setModalReproduciendo(true);
    void audio.play().catch(() => setModalReproduciendo(false));
  };

  const actualizarTextoSombra = () => {
    const audio = audioSombraRef.current;
    if (!audio || !audio.src) return;

    const estado = obtenerTextoSincronizado(
      audio.currentTime,
      audio.duration,
      GUION_SOMBRA_ERROR,
    );

    setTextoSombra(estado.texto);
    setIndiceSombraActivo(estado.indice);
    setProgresoSombraActivo(estado.progresoLinea);
  };

  const reproducirCompletado = () => {
    const audio = audioCompletadoRef.current;
    if (!audio || !audio.src || modal !== "completado") return;

    if (audio.ended || audio.currentTime >= audio.duration) {
      audio.currentTime = 0;
      setReinicioCompletado((valor) => valor + 1);
    }

    setCompletadoReproduciendo(true);
    void audio.play().catch(() => setCompletadoReproduciendo(false));
  };

  const pausarCompletado = () => {
    audioCompletadoRef.current?.pause();
    setCompletadoReproduciendo(false);
  };

  const reiniciarCompletado = () => {
    const audio = audioCompletadoRef.current;
    if (!audio || !audio.src || modal !== "completado") return;

    audio.currentTime = 0;
    setTextoCompletado("");
    setIndiceCompletadoActivo(0);
    setProgresoCompletadoActivo(0);
    setReinicioCompletado((valor) => valor + 1);
    setCompletadoReproduciendo(true);
    void audio.play().catch(() => setCompletadoReproduciendo(false));
  };

  const actualizarTextoCompletado = () => {
    const audio = audioCompletadoRef.current;
    if (!audio || !audio.src) return;

    const estado = obtenerTextoSincronizado(
      audio.currentTime,
      audio.duration,
      GUION_NOVA_CIERRE,
    );

    setTextoCompletado(estado.texto);
    setIndiceCompletadoActivo(estado.indice);
    setProgresoCompletadoActivo(estado.progresoLinea);
  };

  /*
    Igual que en la Actividad 1, el texto se actualiza de forma continua.
    No dependemos únicamente de onTimeUpdate porque ese evento avanza muy lento
    en algunos navegadores y puede hacer que el texto parezca detenerse.
  */
  useEffect(() => {
    if (!novaReproduciendo) return;

    const intervalo = window.setInterval(() => {
      actualizarTextoNova();
    }, 25);

    return () => window.clearInterval(intervalo);
  }, [novaReproduciendo]);

  useEffect(() => {
    if (modal !== "profesor" || !modalReproduciendo) return;

    const intervalo = window.setInterval(() => {
      actualizarTextoProfesor();
    }, 25);

    return () => window.clearInterval(intervalo);
  }, [modal, modalReproduciendo]);

  useEffect(() => {
    if (modal !== "byte" || !modalReproduciendo) return;

    const intervalo = window.setInterval(() => {
      actualizarTextoPista();
    }, 30);

    return () => window.clearInterval(intervalo);
  }, [modal, modalReproduciendo, pistaSeleccionada]);

  useEffect(() => {
    if (modal !== "sombra" || !modalReproduciendo) return;

    const intervalo = window.setInterval(() => {
      actualizarTextoSombra();
    }, 25);

    return () => window.clearInterval(intervalo);
  }, [modal, modalReproduciendo]);

  useEffect(() => {
    if (modal !== "completado" || !completadoReproduciendo) return;

    const intervalo = window.setInterval(() => {
      actualizarTextoCompletado();
    }, 25);

    return () => window.clearInterval(intervalo);
  }, [modal, completadoReproduciendo]);

  useEffect(() => {
    return () => {
      audioAciertoEspecialRef.current?.pause();

      if (aciertoEspecialFallbackRef.current !== null) {
        window.clearTimeout(aciertoEspecialFallbackRef.current);
      }
    };
  }, []);

  const finalizarAciertoEspecial = () => {
    if (aciertoEspecialFallbackRef.current !== null) {
      window.clearTimeout(aciertoEspecialFallbackRef.current);
      aciertoEspecialFallbackRef.current = null;
    }

    const retoCelebrado = retoAciertoEspecialRef.current;
    retoAciertoEspecialRef.current = null;

    audioAciertoEspecialRef.current?.pause();
    setAciertoEspecialReproduciendo(false);
    setAciertoEspecial(null);

    if (retoCelebrado === null) return;

    const nuevosCompletados = Math.max(completados, retoCelebrado + 1);
    setCompletados(nuevosCompletados);

    if (retoCelebrado >= RETOS.length - 1) {
      setCompletados(RETOS.length);
      mission.finishNative();
      if(mission.ready && mission.allCorrect) setModal("completado"); else mission.review();
      return;
    }

    setRetoActual(retoCelebrado + 1);
    setSeleccion(null);
    setRevision("pendiente");
  };

  const iniciarAciertoEspecial = (
    configuracion: AciertoEspecialAct5,
    indiceReto: number,
  ) => {
    retoAciertoEspecialRef.current = indiceReto;
    setAciertoEspecial(configuracion);
    setAciertoEspecialReproduciendo(true);
    setReinicioAciertoEspecial((valor) => valor + 1);
  };

  useEffect(() => {
    if (!aciertoEspecial) return;

    const audio = audioAciertoEspecialRef.current;

    if (aciertoEspecialFallbackRef.current !== null) {
      window.clearTimeout(aciertoEspecialFallbackRef.current);
      aciertoEspecialFallbackRef.current = null;
    }

    if (!audio) {
      aciertoEspecialFallbackRef.current = window.setTimeout(
        finalizarAciertoEspecial,
        5200,
      );
      return;
    }

    audio.currentTime = 0;

    void audio.play().catch(() => {
      setAciertoEspecialReproduciendo(false);
      aciertoEspecialFallbackRef.current = window.setTimeout(
        finalizarAciertoEspecial,
        5200,
      );
    });
  }, [aciertoEspecial]);

  const obtenerDashboardPrincipal = () => {
    if (isGuestSession() && !hasAuthSession()) return "/dashboard";

    const usuario = getSessionUser() as SessionUser | null;
    const rol = String(
      usuario?.rol || usuario?.role || usuario?.tipo_usuario || "",
    )
      .toLowerCase()
      .trim();

    const roleId = Number(
      usuario?.role_id || usuario?.roleId || usuario?.id_rol || 0,
    );

    if (rol === "admin" || rol === "administrador" || roleId === 3) {
      return "/dashboard-admin";
    }

    if (
      [
        "docente",
        "profesor",
        "maestro",
        "docente_estudiante",
        "docente-estudiante",
        "docente_alumno",
        "docente-alumno",
        "maestro_estudiante",
        "maestro-estudiante",
        "mixto",
      ].includes(rol) ||
      roleId === 1 ||
      roleId === 4
    ) {
      return "/dashboard-docente";
    }

    return "/dashboard";
  };

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    setModal(null);
    navigate(ruta);
  };

  const seleccionarOpcion = (opcion: OpcionId) => {
    if (revision === "correcto" || pausado || aciertoEspecial !== null) return;
    setSeleccion(opcion);
    setRevision("pendiente");
  };

  const comprobar = () => {
    if (!seleccion || pausado || aciertoEspecial !== null) return;
    nativeAnswers.current['native-'+retoActual]=seleccion;
    void pilot.record({piloto_nativas:{...nativeAnswers.current},mission_expansion:mission.evidence},{retroalimentacion_vista:errores>0||mission.correctOnly,pista_declarada:hintUsed.current});

    if (seleccion === reto.correcta) {
      setRevision("correcto");

      const configuracionAcierto = ACIERTOS_ESPECIALES_ACT5[retoActual];

      if (configuracionAcierto) {
        iniciarAciertoEspecial(configuracionAcierto, retoActual);
      }

      return;
    }

    setErrores((valor) => valor + 1);
    setRevision("incorrecto");
    setModal("sombra");
  };

  const siguiente = () => {
    if (revision !== "correcto" || aciertoEspecial !== null) return;

    const nuevosCompletados = Math.max(completados, retoActual + 1);
    setCompletados(nuevosCompletados);

    if (retoActual === RETOS.length - 1) {
      setCompletados(RETOS.length);
      mission.finishNative();
      if(mission.ready && mission.allCorrect) setModal("completado"); else mission.review();
      return;
    }

    setRetoActual((valor) => valor + 1);
    setSeleccion(null);
    setRevision("pendiente");
  };

  const reiniciar = () => {
    nativeAnswers.current={};hintUsed.current=false;resetPilotSession("mathgeometry-actividad-5");
    mission.reset();
    setRetoActual(0);
    setSeleccion(null);
    setRevision("pendiente");
    setErrores(0);
    setCompletados(0);
    setSegundos(0);
    setModal(null);
    setPausado(false);
    audioNovaRef.current?.pause();
    if (audioNovaRef.current) audioNovaRef.current.currentTime = 0;
    setTextoNova(TEXTO_INICIAL_NOVA);
    setIndiceNovaActivo(-1);
    setNovaReproduciendo(false);
    setReinicioNova((valor) => valor + 1);
    audioProfesorRef.current?.pause();
    if (audioProfesorRef.current) audioProfesorRef.current.currentTime = 0;
    setTextoProfesor(TEXTO_INICIAL_PROFESOR);
    setIndiceProfesorActivo(-1);
    setProgresoProfesorActivo(0);
    audioPistaRef.current?.pause();
    if (audioPistaRef.current) audioPistaRef.current.currentTime = 0;
    setPistaSeleccionada("frente");
    setTextoPista(TEXTO_INICIAL_PISTA);
    setIndicePistaActivo(-1);
    setProgresoPistaActivo(0);
    setModalReproduciendo(false);
    setReinicioModal((valor) => valor + 1);
    audioSombraRef.current?.pause();
    if (audioSombraRef.current) audioSombraRef.current.currentTime = 0;
    setTextoSombra(TEXTO_INICIAL_SOMBRA);
    setIndiceSombraActivo(-1);
    setProgresoSombraActivo(0);
    audioCompletadoRef.current?.pause();
    if (audioCompletadoRef.current) {
      audioCompletadoRef.current.currentTime = 0;
    }
    setTextoCompletado(TEXTO_INICIAL_COMPLETADO);
    setIndiceCompletadoActivo(-1);
    setProgresoCompletadoActivo(0);
    setCompletadoReproduciendo(false);
    setReinicioCompletado((valor) => valor + 1);
    audioAciertoEspecialRef.current?.pause();
    if (audioAciertoEspecialRef.current) {
      audioAciertoEspecialRef.current.currentTime = 0;
    }
    if (aciertoEspecialFallbackRef.current !== null) {
      window.clearTimeout(aciertoEspecialFallbackRef.current);
      aciertoEspecialFallbackRef.current = null;
    }
    retoAciertoEspecialRef.current = null;
    setAciertoEspecial(null);
    setAciertoEspecialReproduciendo(false);
    setReinicioAciertoEspecial((valor) => valor + 1);
  };

  const volverAIntentarlo = () => {
    audioSombraRef.current?.pause();

    if (audioSombraRef.current) {
      audioSombraRef.current.currentTime = 0;
    }

    setModalReproduciendo(false);
    setModal(null);
    setRevision("pendiente");
    setTextoSombra(TEXTO_INICIAL_SOMBRA);
    setIndiceSombraActivo(-1);
    setProgresoSombraActivo(0);
    setReinicioModal((valor) => valor + 1);
  
 mission.beginCorrection();
};

  const videoModal =
    modal === "profesor"
      ? videoProfesor
      : modal === "byte"
        ? pistaActiva.video
        : videoSombra;

  const tituloModal =
    modal === "profesor"
      ? "Consejo del Profesor Astro"
      : modal === "byte"
        ? pistaActiva.titulo
        : "Mensaje de Sombra";

  return (
    <main className="act5geo-page mn-activity">
      <button
        type="button"
        className={`act5geo-hamburger-btn ${
          menuOpen ? "act5geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen((valor) => !valor)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <button
          type="button"
          className="act5geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`act5geo-sidebar ${menuOpen ? "act5geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act5geo-sidebar-logo" />

        <nav className="act5geo-sidebar-menu">
          <button
            type="button"
            className="act5geo-menu-item"
            onClick={() => irARuta(obtenerDashboardPrincipal())}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="act5geo-menu-item act5geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="act5geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="act5geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="act5geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="act5geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mn-sidebar-mission"><span>Tu misión</span><strong>{activityCurriculum["mathgeometry-actividad-5"].objective}</strong></div>
      </aside>

      <section className="act5geo-content">
        <img
          src={heroBanner}
          alt="Banner Actividad 5: El Taller del Ingeniero"
          className="act5geo-bg"
        />

        <section className="act5geo-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathgeometry-actividad-5"]} />
        


          <header className="act5geo-topbar">
            <div className="act5geo-title-area">
              <h1>Actividad 5: El Taller del Ingeniero</h1>
              <p className="act5geo-subtitle">
                Observa cada segmento y selecciona el punto que está exactamente
                en la mitad para construir el puente correctamente.
              </p>

              <div className="act5geo-pills">
                <span>▣ Introducción</span>
                <span>
                  <FiClock /> 8–12 min
                </span>
                <span>
                  <FiTarget /> Conteo de errores
                </span>
              </div>
            </div>

            <div className="act5geo-actions-top">
              <button
                type="button"
                onClick={() => setPausado((valor) => !valor)}
              >
                {pausado ? <FiPlay /> : <FiPause />}
                {pausado ? "Continuar" : "Pausar"}
              </button>

              <button
                type="button"
                onClick={() => irARuta("/actividades/geometria")}
              >
                <FiLogOut />
                Salir
              </button>
            </div>
          </header>

          <section
            className={`act5geo-intro-row ${
              novaReproduciendo && !pausado ? "act5geo-intro-playing" : ""
            }`}
          >
            <div className="act5geo-nova-stage">
              <VideoCanvasTransparente
                src={videoNova}
                className="act5geo-nova-transparent-wrap"
                canvasClassName="act5geo-nova-canvas"
                width={360}
                height={640}
                playing={novaReproduciendo && !pausado && modal === null}
                restartSignal={reinicioNova}
                loopWhenPlaying
                onEnded={() => undefined}
                label="Nova explicando la actividad"
              />
            </div>

            <audio
              ref={audioNovaRef}
              src={audioNovaIntroduccion || undefined}
              preload="auto"
              onTimeUpdate={actualizarTextoNova}
              onEnded={() => {
                setNovaReproduciendo(false);
                setTextoNova(TEXTO_FINAL_NOVA);
                setIndiceNovaActivo(GUION_NOVA_INTRODUCCION.length - 1);
                // Regresa la animación al primer fotograma para que no quede trabada.
                setReinicioNova((valor) => valor + 1);
              }}
            />

            <div className="act5geo-speech-cloud">
              <div className="act5geo-speech-main">
                <span className="act5geo-cloud-label">
                  Introducción de Nova
                </span>
                <p>
                  {textoNova}
                  {novaReproduciendo && (
                    <span
                      className="act5geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act5geo-nova-mini-controls">
                <button
                  type="button"
                  className="act5geo-nova-control-btn act5geo-nova-control-play"
                  onClick={reproducirNova}
                  disabled={pausado || modal !== null}
                  title="Reproducir animación de Nova"
                  aria-label="Reproducir animación de Nova"
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  className="act5geo-nova-control-btn"
                  onClick={pausarNova}
                  disabled={!novaReproduciendo}
                  title="Pausar animación de Nova"
                  aria-label="Pausar animación de Nova"
                >
                  <FiPause />
                </button>

                <button
                  type="button"
                  className="act5geo-nova-control-btn act5geo-nova-control-repeat"
                  onClick={reiniciarIntroduccionNova}
                  disabled={pausado || modal !== null}
                  title="Reiniciar animación de Nova"
                  aria-label="Reiniciar animación de Nova"
                >
                  <FiRotateCcw />
                </button>
              </div>
            </div>
          </section>

          <EnsayoOtrosMundos activityId="mathgeometry-actividad-5"/>
<div className="act5geo-layout">
            <section className="act5geo-game-card">
              <div className="act5geo-challenge-head">
                <span>
                  <FiFlag /> Reto {retoActual + 1} de {RETOS.length}
                </span>
              </div>

              <div className="act5geo-laser-frame">
                <img
                  src={reto.imagen}
                  alt={`Reto ${reto.id}: identifica el punto medio del puente`}
                />

                {pausado && (
                  <div className="act5geo-pause-layer">
                    <FiPause />
                    <strong>Actividad pausada</strong>
                  </div>
                )}
              </div>

              <h2>{reto.pregunta}</h2>

              <div
                className="act5geo-options"
                style={
                  {
                    "--act5geo-option-count": reto.opciones.length,
                  } as CSSProperties
                }
              >
                {reto.opciones.map((opcion, index) => {
                  const seleccionada = seleccion === opcion.id;
                  const correcta =
                    revision === "correcto" && opcion.id === reto.correcta;

                  return (
                    <button
                      type="button"
                      key={opcion.id}
                      className={[
                        "act5geo-option",
                        `act5geo-option-color-${index + 1}`,
                        seleccionada ? "act5geo-option-selected" : "",
                        correcta ? "act5geo-option-correct" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => seleccionarOpcion(opcion.id)}
                    >
                      <span>{opcion.id}</span>
                      <strong>{opcion.texto}</strong>
                      {correcta && <FiCheck />}
                    </button>
                  );
                })}
              </div>

              <div className="act5geo-game-actions">
                <button
                  type="button"
                  className="act5geo-check-btn"
                  onClick={comprobar}
                  disabled={
                    !seleccion ||
                    revision === "correcto" ||
                    pausado ||
                    aciertoEspecial !== null
                  }
                >
                  <FiCheck />
                  Comprobar
                </button>

                <button
                  type="button"
                  className="act5geo-next-btn"
                  onClick={siguiente}
                  disabled={revision !== "correcto" || aciertoEspecial !== null}
                >
                  Siguiente
                  <FiArrowRight />
                </button>
              </div>
            </section>

            <aside className="act5geo-right-panel">
              <button
                type="button"
                className="act5geo-guide-card act5geo-profe-card"
                onClick={() => setModal("profesor")}
              >
                <img
                  src={profesorConsejoImagen}
                  alt="Profesor Astro dando un consejo"
                  className="act5geo-guide-static-image"
                />
                <div>
                  <h3>💡 Consejo del Profesor Astro</h3>
                  <p>
                    Observa la distancia del punto a ambos extremos: si es
                    igual, encontraste el punto medio.
                  </p>
                  <span className="act5geo-guide-cta">
                    <FiVolume2 />
                    Ver explicación
                  </span>
                </div>
              </button>

              <article className="act5geo-guide-card act5geo-sombra-card act5geo-sombra-static-card">
                <img
                  src={sombraErrorImagen}
                  alt="Sombra dando un aviso"
                  className="act5geo-guide-static-image"
                />
                <div>
                  <h3>✦ ¡Aviso de Sombra!</h3>
                  <p>
                    No elijas un punto solo porque se ve cerca del centro;
                    compara siempre ambos lados.
                  </p>
                </div>
              </article>

              <button
                type="button"
                className="act5geo-guide-card act5geo-byte-card"
                onClick={() => setModal("byte")}
              >
                <img
                  src={byteImagen}
                  alt="Byte"
                  className="act5geo-guide-static-image"
                />
                <div>
                  <h3>Pista de Byte</h3>
                  <p>
                    Abre una pista para identificar el punto medio del reto
                    actual.
                  </p>
                  <span className="act5geo-guide-cta act5geo-guide-cta-byte">
                    <FiHelpCircle />
                    Ver pista
                  </span>
                </div>
              </button>

              <article className="act5geo-progress-card">
                <strong>Progreso de la actividad</strong>
                <div>
                  <b style={{ width: `${progreso}%` }} />
                </div>
                <span>
                  {progreso}% ({completados}/{RETOS.length})
                </span>
              </article>
            </aside>
          </div>
 


          <section className="act5geo-bottom-stats">
            <article>
              <FiFlag />
              <div>
                <span>Puentes completados</span>
                <strong>
                  {completados}/{RETOS.length}
                </strong>
              </div>
            </article>

            <article>
              <FiTarget />
              <div>
                <span>Errores</span>
                <strong>{errores}</strong>
              </div>
            </article>

            <article>
              <FiClock />
              <div>
                <span>Tiempo</span>
                <strong>{tiempo}</strong>
              </div>
            </article>

            <article className="act5geo-xp-card">
              <span className="act5geo-star">★</span>
              <div>
                <span>XP</span>
                <strong>{completados * 40}</strong>
              </div>
            </article>
          </section>
        <PilotEvidenceStatus pilot={pilot}/><ContinuacionDeMision expansion={mission} onComplete={()=>{setModal("completado");}} onRestart={reiniciar}/>
</section>

        <footer className="act5geo-footer">
          <div className="act5geo-footer-icons">
            <button type="button" onClick={() => navigate("/login")}>
              <FiLogOut />
            </button>
            <FiHelpCircle />
            <FiSettings />
          </div>
        </footer>
      </section>

      <audio
        key={aciertoEspecial?.audio ?? "sin-acierto"}
        ref={audioAciertoEspecialRef}
        src={aciertoEspecial?.audio || undefined}
        preload="auto"
        onEnded={finalizarAciertoEspecial}
      />

      {aciertoEspecial && (
        <aside
          className={`act5geo-success-toast act5geo-success-${aciertoEspecial.clase}`}
          role="status"
          aria-live="assertive"
          aria-label={`Respuesta correcta. Habla ${aciertoEspecial.personaje}`}
        >
          <div className="act5geo-success-aura" aria-hidden="true" />

          <div className="act5geo-success-character">
            <VideoCanvasTransparente
              src={aciertoEspecial.video}
              className="act5geo-success-video-wrap"
              canvasClassName="act5geo-success-canvas"
              width={360}
              height={640}
              playing={aciertoEspecialReproduciendo}
              restartSignal={reinicioAciertoEspecial}
              loopWhenPlaying
              onEnded={() => undefined}
              label={`${aciertoEspecial.personaje} celebrando la respuesta correcta`}
            />
          </div>

          <div className="act5geo-success-message">
            <span className="act5geo-success-badge">
              <FiCheck />
              {aciertoEspecial.personaje}
            </span>

            <strong>{aciertoEspecial.titulo}</strong>
            <p>{aciertoEspecial.mensaje}</p>
            <small>{aciertoEspecial.cierre}</small>

            <div className="act5geo-success-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </aside>
      )}

      {modal && modal !== "completado" && (
        <div
          className="act5geo-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              pausarProfesor();
              pausarPista();
              pausarSombra();
              setModal(null);
            }
          }}
        >
          <section
            className={`act5geo-character-modal ${
              modalReproduciendo ? "act5geo-profe-modal-playing" : ""
            } ${modal === "byte" ? "act5geo-hints-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={tituloModal}
          >
            <button
              type="button"
              className="act5geo-modal-close"
              onClick={() => {
                pausarProfesor();
                pausarPista();
                pausarSombra();
                setModal(null);
              }}
              aria-label="Cerrar modal"
            >
              <FiX />
            </button>

            <div className="act5geo-modal-character">
              <VideoCanvasTransparente
                src={videoModal}
                className="act5geo-modal-video-wrap"
                canvasClassName="act5geo-modal-canvas"
                width={360}
                height={640}
                playing={modalReproduciendo}
                restartSignal={reinicioModal}
                loopWhenPlaying={
                  modal === "profesor" || modal === "byte" || modal === "sombra"
                }
                onEnded={() => undefined}
                label={tituloModal}
              />
            </div>

            {modal === "profesor" && (
              <audio
                ref={audioProfesorRef}
                src={audioProfesorAstro || undefined}
                preload="auto"
                onTimeUpdate={actualizarTextoProfesor}
                onEnded={() => {
                  setModalReproduciendo(false);
                  setTextoProfesor(TEXTO_FINAL_PROFESOR);
                  setIndiceProfesorActivo(GUION_PROFESOR_ASTRO.length - 1);
                  setProgresoProfesorActivo(100);
                  setReinicioModal((valor) => valor + 1);
                }}
              />
            )}

            {modal === "byte" && (
              <audio
                key={pistaActiva.id}
                ref={audioPistaRef}
                src={pistaActiva.audio}
                preload="auto"
                onTimeUpdate={actualizarTextoPista}
                onEnded={() => {
                  setModalReproduciendo(false);
                  setTextoPista(
                    pistaActiva.guion[pistaActiva.guion.length - 1],
                  );
                  setIndicePistaActivo(pistaActiva.guion.length - 1);
                  setProgresoPistaActivo(100);
                  setReinicioModal((valor) => valor + 1);
                }}
              />
            )}

            {modal === "sombra" && (
              <audio
                ref={audioSombraRef}
                src={audioSombraError || undefined}
                preload="auto"
                onTimeUpdate={actualizarTextoSombra}
                onEnded={() => {
                  setModalReproduciendo(false);
                  setTextoSombra(GUION_SOMBRA_ERROR.join(" "));
                  setIndiceSombraActivo(GUION_SOMBRA_ERROR.length - 1);
                  setProgresoSombraActivo(100);
                }}
              />
            )}

            <div className="act5geo-modal-content"><AudioRetroalimentacion/>
              <span className="act5geo-modal-badge">
                <FiVolume2 />
                {modal === "profesor"
                  ? "Profesor Astro"
                  : modal === "byte"
                    ? pistaActiva.personaje
                    : "Sombra"}
              </span>

              <h2>{tituloModal}</h2>

              {modal === "byte" && (
                <div
                  className="act5geo-hint-selector"
                  aria-label="Seleccionar pista"
                >
                  {ORDEN_PISTAS_ACT5.map((id, indice) => {
                    const pista = PISTAS_ACT5[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        className={
                          id === pistaSeleccionada
                            ? "act5geo-hint-tab-active"
                            : ""
                        }
                        onClick={() => seleccionarPista(id)}
                      >
                        <span>{indice + 1}</span>
                        <strong>{pista.personaje}</strong>
                        <small>{pista.subtitulo}</small>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="act5geo-modal-cloud">
                <p>
                  {modal === "profesor"
                    ? textoProfesor
                    : modal === "byte"
                      ? textoPista
                      : textoSombra}
                  {modalReproduciendo && (
                    <span
                      className="act5geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act5geo-modal-controls">
                <button
                  type="button"
                  className="act5geo-modal-play"
                  onClick={
                    modal === "profesor"
                      ? reproducirProfesor
                      : modal === "byte"
                        ? reproducirPista
                        : reproducirSombra
                  }
                >
                  <FiPlay /> Reproducir
                </button>

                <button
                  type="button"
                  onClick={
                    modal === "profesor"
                      ? pausarProfesor
                      : modal === "byte"
                        ? pausarPista
                        : pausarSombra
                  }
                  disabled={!modalReproduciendo}
                >
                  <FiPause /> Pausar
                </button>

                <button
                  type="button"
                  onClick={
                    modal === "profesor"
                      ? reiniciarProfesor
                      : modal === "byte"
                        ? reiniciarPista
                        : reiniciarSombra
                  }
                >
                  <FiRotateCcw /> Reiniciar
                </button>

                {modal === "sombra" && (
                  <button
                    type="button"
                    className="act5geo-try-again-btn"
                    onClick={volverAIntentarlo}
                  >
                    <FiRotateCcw />
                    Volver a intentarlo
                  </button>
                )}
              </div>
            </div>

            <aside className="act5geo-modal-script-panel">
              <h3>
                {modal === "byte"
                  ? "Texto de la pista"
                  : modal === "profesor"
                    ? "Texto del profesor"
                    : "Texto de Sombra"}
              </h3>

              {modal === "profesor" && (
                <div className="act5geo-modal-script-lines">
                  {GUION_PROFESOR_ASTRO.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceProfesorActivo
                          ? "act5geo-modal-script-line-active"
                          : indice < indiceProfesorActivo
                            ? "act5geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act5geo-line-progress":
                            indice < indiceProfesorActivo
                              ? 1
                              : indice === indiceProfesorActivo
                                ? progresoProfesorActivo / 100
                                : 0,
                        } as CSSProperties
                      }
                    >
                      <span>{linea}</span>
                    </p>
                  ))}
                </div>
              )}

              {modal === "byte" && (
                <div className="act5geo-modal-script-lines act5geo-hint-script-lines">
                  {pistaActiva.guion.map((linea, indice) => (
                    <p
                      key={`${pistaActiva.id}-${linea}`}
                      className={
                        indice === indicePistaActivo
                          ? "act5geo-modal-script-line-active"
                          : indice < indicePistaActivo
                            ? "act5geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act5geo-line-progress":
                            indice < indicePistaActivo
                              ? 1
                              : indice === indicePistaActivo
                                ? progresoPistaActivo / 100
                                : 0,
                        } as CSSProperties
                      }
                    >
                      <span>{linea}</span>
                    </p>
                  ))}
                </div>
              )}

              {modal === "sombra" && (
                <div className="act5geo-modal-script-lines act5geo-sombra-script-lines">
 <DetalleErroresDeMision items={[...(RETOS.map((r,i)=>({id:`native-${i}`,title:i===retoActual?reto.pregunta:`Reto geométrico ${i+1}`,answer:i===retoActual?(reto.opciones.find(o=>o.id===seleccion)?.texto||"Sin respuesta"):i<completados?"Validado en la misión":"",correct:i<completados?true:i===retoActual?Boolean(seleccion===reto.correcta):null,hint:i===retoActual?`Revisa la propiedad indicada en el reto. La opción que corresponde es: ${reto.opciones.find(o=>o.id===reto.correcta)?.texto}. Consulta la pista para justificarla.`:"Puedes consultar la pista del personaje cuando llegues a este reto.",target:".act5geo-layout"})).filter((_,i)=>i<=retoActual)),...mission.items]} onCorrect={(item)=>{setModal(null); setRevision("pendiente"); audioSombraRef.current?.pause(); mission.beginCorrection(item);}} onRestart={reiniciar}/>

                  {GUION_SOMBRA_ERROR.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceSombraActivo
                          ? "act5geo-modal-script-line-active"
                          : indice < indiceSombraActivo
                            ? "act5geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act5geo-line-progress":
                            indice < indiceSombraActivo
                              ? 1
                              : indice === indiceSombraActivo
                                ? progresoSombraActivo / 100
                                : 0,
                        } as CSSProperties
                      }
                    >
                      <span>{linea}</span>
                    </p>
                  ))}
                </div>
              )}
            </aside>
          </section>
        </div>
      )}

      {modal === "completado" && (
        <div className="act5geo-modal-overlay">
          <section
            className="act5geo-complete-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Actividad completada"
          >
            <button
              type="button"
              className="act5geo-modal-close"
              onClick={() => {
                pausarCompletado();
                setModal(null);
              }}
              aria-label="Cerrar modal"
            >
              <FiX />
            </button>

            <div className="act5geo-complete-hero">
              <img
                src={bannerCompletado}
                alt=""
                className="act5geo-complete-decoration"
                aria-hidden="true"
              />

              <VideoCanvasTransparente
                src={videoNova}
                className="act5geo-complete-video-wrap"
                canvasClassName="act5geo-complete-nova-canvas"
                width={360}
                height={640}
                playing={completadoReproduciendo}
                restartSignal={reinicioCompletado}
                loopWhenPlaying
                onEnded={() => undefined}
                label="Nova celebrando la actividad completada"
              />
            </div>

            <audio
              ref={audioCompletadoRef}
              src={audioNovaCierre || undefined}
              preload="auto"
              onTimeUpdate={actualizarTextoCompletado}
              onEnded={() => {
                setCompletadoReproduciendo(false);
                setTextoCompletado(GUION_NOVA_CIERRE.join(" "));
                setIndiceCompletadoActivo(GUION_NOVA_CIERRE.length - 1);
                setProgresoCompletadoActivo(100);
              }}
            />

            <div className="act5geo-complete-content"><AudioRetroalimentacion/>
              <span>🏆 Taller completado</span>
              <h2>¡Puentes completados!</h2>

              <div className="act5geo-complete-cloud">
                <p>
                  {textoCompletado}
                  {completadoReproduciendo && (
                    <span
                      className="act5geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act5geo-complete-controls">
                <button
                  type="button"
                  className="act5geo-complete-play"
                  onClick={reproducirCompletado}
                >
                  <FiPlay /> Reproducir
                </button>

                <button
                  type="button"
                  onClick={pausarCompletado}
                  disabled={!completadoReproduciendo}
                >
                  <FiPause /> Pausar
                </button>

                <button type="button" onClick={reiniciarCompletado}>
                  <FiRotateCcw /> Reiniciar
                </button>
              </div>

              <div className="act5geo-complete-summary">
                <article>
                  <FiCheck />
                  <span>Puentes</span>
                  <strong>{mission.total}/{mission.total}</strong>
                </article>
                <article>
                  <FiTarget />
                  <span>Precisión</span>
                  <strong>100%</strong>
                </article>
                <article>
                  <span className="act5geo-summary-star">★</span>
                  <span>Recompensa</span>
                  <strong>+240 XP</strong>
                </article>
              </div>
            </div>

            <aside className="act5geo-complete-side">
              <div className="act5geo-complete-transcript act5geo-complete-transcript-inline">
                <h3>Texto de Nova</h3>

                <div className="act5geo-modal-script-lines">
                  {GUION_NOVA_CIERRE.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceCompletadoActivo
                          ? "act5geo-modal-script-line-active"
                          : indice < indiceCompletadoActivo
                            ? "act5geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act5geo-line-progress":
                            indice < indiceCompletadoActivo
                              ? 1
                              : indice === indiceCompletadoActivo
                                ? progresoCompletadoActivo / 100
                                : 0,
                        } as CSSProperties
                      }
                    >
                      <span>{linea}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="act5geo-complete-actions">
                <button
                  type="button"
                  onClick={() => irARuta("/actividades/geometria/actividad-6")}
                >
                  <FiArrowRight />
                  Siguiente actividad
                </button>

                <button type="button" onClick={reiniciar}>
                  <FiRotateCcw />
                  Repetir actividad
                </button>

                <button
                  type="button"
                  onClick={() => irARuta("/actividades/geometria")}
                >
                  <FiLogOut />
                  Volver a actividades
                </button>
              </div>
            </aside>
          </section>
        </div>
      )}
    </main>
  );
}

export default Actividad5MathGeometry;
