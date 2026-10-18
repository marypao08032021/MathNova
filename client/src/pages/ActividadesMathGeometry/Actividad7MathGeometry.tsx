import useGeometryEvidence from "../../hooks/useGeometryEvidence";
import PilotEvidenceStatus from "../../components/PilotEvidenceStatus";
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

import "./Actividad7MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividad7/banner_act7_MathGeometry.png";
import reto1 from "../../assets/mathGeometry/actividad7/act7_reto1.png";
import reto2 from "../../assets/mathGeometry/actividad7/act7_reto2.png";
import reto3 from "../../assets/mathGeometry/actividad7/act7_reto3.png";
import reto4 from "../../assets/mathGeometry/actividad7/act7_reto4.png";
import reto5 from "../../assets/mathGeometry/actividad7/act7_reto5.png";
import reto6 from "../../assets/mathGeometry/actividad7/act7_reto6.png";

import byteImagen from "../../assets/mathGeometry/actividad7/byte-act7-mathgeometry.png";
import profesorConsejoImagen from "../../assets/mathGeometry/actividad7/profesor_dando_consejo_actividad_7.png";
import sombraErrorImagen from "../../assets/mathGeometry/actividad7/sombra-error_act7.png";
import bannerCompletado from "../../assets/mathGeometry/actividad7/actividad_completada_7_banner_MathGeometry.png";

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

type OpcionId = "A" | "B" | "C" | "D";
type EstadoRevision = "pendiente" | "correcto" | "incorrecto";
type ModalId = "profesor" | "byte" | "sombra" | "completado" | null;
type PistaAct7Id = "frente" | "linea" | "letras";
type PersonajePistaAct7 = "Nova" | "Profesor Astro" | "Byte";
type PersonajeAciertoAct7 = "Byte" | "Nova" | "Profesor Astro";

type AciertoEspecialAct7 = {
  personaje: PersonajeAciertoAct7;
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

import videoNova from "../../assets/mathGeometry/actividad7/nova_explicando_act_7_MathGeometry.mp4";
import videoProfesor from "../../assets/mathGeometry/actividad7/instrucciones_profe_astro_act_7_MathGeometry.mp4";
import videoByte from "../../assets/mathGeometry/actividad7/byte_aciertos_y_pistas_act_7_MathGeometry.mp4";
import videoSombra from "../../assets/mathGeometry/actividad7/act_6_sombra_error_MathGeometry_.mp4";

/* Audios de bienvenida, explicación y pistas de la Actividad 7. */
import audioNovaIntroduccion from "../../assets/mathGeometry/actividad7/act7_bienvenida_nova_MathGeometry.mp3";
import audioProfesorAstro from "../../assets/mathGeometry/actividad7/act7_instrucciones_profe_astro_MathGeometry.mp3";
import audioPistaNova from "../../assets/mathGeometry/actividad7/act7_pista_1_Nova_MathGeometry.mp3";
import audioPistaProfesor from "../../assets/mathGeometry/actividad7/act7_pista_2_Profesor_Astro_MathGeometry.mp3";
import audioPistaByte from "../../assets/mathGeometry/actividad7/act7_pista_3_Byte_MathGeometry.mp3";
import audioSombraError from "../../assets/mathGeometry/actividad7/act7_sombra_del_error_MathGeometry.mp3";
import audioNovaCierre from "../../assets/mathGeometry/actividad7/act7_nova_cierre_MathGeometry.mp3";

const audioByteAcierto = "";
const audioProfesorAcierto = "";
const audioNovaAcierto = "";

const RETOS: Reto[] = [
  {
    id: 1,
    imagen: reto1,
    pregunta:
      "Observa el triángulo y selecciona la línea que parte del vértice A y pasa por el centro de la figura.",
    opciones: [
      { id: "A", texto: "Línea roja" },
      { id: "B", texto: "Línea azul inclinada" },
      { id: "C", texto: "Línea verde" },
      { id: "D", texto: "Línea azul vertical" },
    ],
    correcta: "D",
  },
  {
    id: 2,
    imagen: reto2,
    pregunta:
      "Selecciona la línea que divide una esquina del triángulo en dos partes iguales.",
    opciones: [
      { id: "A", texto: "Línea verde lateral" },
      { id: "B", texto: "Línea blanca izquierda" },
      { id: "C", texto: "Línea verde central" },
      { id: "D", texto: "Línea blanca derecha" },
    ],
    correcta: "C",
  },
  {
    id: 3,
    imagen: reto3,
    pregunta:
      "Observa cuidadosamente y selecciona la línea que llega de manera perpendicular al lado del triángulo.",
    opciones: [
      { id: "A", texto: "Línea roja inclinada" },
      { id: "B", texto: "Línea amarilla" },
      { id: "C", texto: "Línea roja vertical" },
      { id: "D", texto: "Línea verde" },
    ],
    correcta: "C",
  },
  {
    id: 4,
    imagen: reto4,
    pregunta:
      "Selecciona la línea que une un vértice con el punto medio del lado contrario.",
    opciones: [
      { id: "A", texto: "Línea amarilla punteada" },
      { id: "B", texto: "Línea verde" },
      { id: "C", texto: "Línea morada" },
      { id: "D", texto: "Línea amarilla continua" },
    ],
    correcta: "D",
  },
  {
    id: 5,
    imagen: reto5,
    pregunta:
      "Observa el triángulo y elige la línea que divide el vértice en dos partes iguales.",
    opciones: [
      { id: "A", texto: "Línea roja" },
      { id: "B", texto: "Línea morada diagonal" },
      { id: "C", texto: "Línea amarilla" },
      { id: "D", texto: "Línea morada vertical" },
    ],
    correcta: "D",
  },
  {
    id: 6,
    imagen: reto6,
    pregunta:
      "Último reto: selecciona la línea marcada con una letra que parte del vértice P y llega al centro del triángulo.",
    opciones: [
      { id: "A", texto: "Línea A" },
      { id: "B", texto: "Línea D" },
      { id: "C", texto: "Línea B" },
      { id: "D", texto: "Línea C" },
    ],
    correcta: "D",
  },
];

const GUION_NOVA_INTRODUCCION = [
  "¡Hola, explorador de MathNova!",
  "Hoy entraremos a La Fortaleza Triangular.",
  "En cada reto verás un triángulo con varias líneas.",
  "Tu misión será observar bien y elegir la línea correcta.",
  "Fíjate desde dónde empieza, hacia dónde va y qué parte del triángulo toca.",
  "¡Vamos a comenzar la misión!",
];

const GUION_PROFESOR_ASTRO = [
  "En esta actividad aprenderás a reconocer algunas líneas importantes dentro de los triángulos.",
  "Verás líneas que pasan por el centro, líneas que dividen un ángulo en dos partes iguales, líneas que llegan rectas a un lado y líneas que unen un vértice con el punto medio del lado contrario.",
  "No necesitas medir ni dibujar.",
  "Solo observa con atención cada triángulo y selecciona la opción que cumpla con la instrucción.",
  "Cuando elijas tu respuesta, revisaremos juntos si fue correcta.",
];

const GUION_SOMBRA_ERROR = [
  "Casi lo logras.",
  "Observa otra vez el triángulo y revisa cada línea con calma.",
  "Fíjate desde dónde empieza y hacia dónde se dirige.",
  "Recuerda: equivocarse también es parte de aprender.",
  "En MathNova podemos volver a intentarlo.",
  "¡Vamos una vez más!",
];

const GUION_NOVA_CIERRE = [
  "¡Misión completada!",
  "Lograste superar La Fortaleza Triangular.",
  "Aprendiste a reconocer líneas importantes dentro de los triángulos, como la altura, la mediana, la bisectriz y las líneas que pasan por el centro.",
  "Cada reto completado quedó registrado como evidencia de tu avance.",
  "¡Muy buen trabajo, explorador de MathNova!",
  "Nos vemos en la siguiente misión.",
];

const TEXTO_INICIAL_NOVA =
  "Presiona reproducir para escuchar la introducción de Nova.";
const TEXTO_FINAL_NOVA = GUION_NOVA_INTRODUCCION.join(" ");
const TEXTO_INICIAL_PROFESOR = GUION_PROFESOR_ASTRO[0];
const TEXTO_FINAL_PROFESOR = GUION_PROFESOR_ASTRO.join(" ");
const TEXTO_INICIAL_SOMBRA = GUION_SOMBRA_ERROR[0];
const TEXTO_FINAL_SOMBRA = GUION_SOMBRA_ERROR.join(" ");
const TEXTO_INICIAL_COMPLETADO = GUION_NOVA_CIERRE[0];
const TEXTO_FINAL_COMPLETADO = GUION_NOVA_CIERRE.join(" ");

const PISTAS_ACT7: Record<
  PistaAct7Id,
  {
    id: PistaAct7Id;
    titulo: string;
    subtitulo: string;
    personaje: PersonajePistaAct7;
    audio: string;
    video: string;
    guion: string[];
  }
> = {
  frente: {
    id: "frente",
    titulo: "Pista 1",
    subtitulo: "Mira dónde comienza",
    personaje: "Nova",
    audio: audioPistaNova,
    video: videoNova,
    guion: [
      "Pista de explorador:",
      "Primero mira desde dónde comienza la línea.",
      "Algunas salen de una esquina del triángulo.",
      "Eso puede ayudarte a descartar opciones.",
      "¡Creo que ya casi lo tienes!",
    ],
  },
  linea: {
    id: "linea",
    titulo: "Pista 2",
    subtitulo: "Observa hacia dónde llega",
    personaje: "Profesor Astro",
    audio: audioPistaProfesor,
    video: videoProfesor,
    guion: [
      "Pista geométrica:",
      "Observa hacia dónde llega la línea.",
      "Puede llegar al centro de un lado, dividir una esquina o formar un ángulo recto.",
      "Compara todas las opciones antes de responder.",
    ],
  },
  letras: {
    id: "letras",
    titulo: "Pista 3",
    subtitulo: "No te fijes solo en la posición",
    personaje: "Byte",
    audio: audioPistaByte,
    video: videoByte,
    guion: [
      "Pista rápida:",
      "El triángulo puede estar derecho, inclinado o girado.",
      "No te fijes solo en su posición.",
      "Observa qué hace la línea dentro del triángulo.",
      "¡Esa es la clave!",
    ],
  },
};

const ORDEN_PISTAS_ACT7: PistaAct7Id[] = ["frente", "linea", "letras"];
const TEXTO_INICIAL_PISTA = "Elige una de las tres pistas para escucharla.";

/*
  Las felicitaciones flotantes quedan desactivadas temporalmente.
  Así, al acertar, el botón "Siguiente" se habilita inmediatamente y
  permite avanzar sin esperar una animación o audio que todavía no existe.
*/
const ACIERTOS_ESPECIALES_ACT7: Partial<Record<number, AciertoEspecialAct7>> =
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
    <div className={`act7geo-transparent-video ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="act7geo-source-video"
        muted
        playsInline
        aria-label={label}
        onEnded={onEnded}
      />
      <canvas
        ref={canvasRef}
        className={`${canvasClassName} ${videoListo ? "act7geo-canvas-visible" : ""}`}
        aria-label={label}
      />

      {!videoListo && !videoError && (
        <div className="act7geo-video-loading" aria-hidden="true">
          <span />
        </div>
      )}

      {videoError && (
        <div className="act7geo-video-error">
          No se pudo cargar la animación.
        </div>
      )}
    </div>
  );
}

function Actividad7MathGeometry() {
 const mission=useMissionExpansion("mathgeometry-actividad-7");
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
    useState<PistaAct7Id>("frente");
  const [pistaElegida, setPistaElegida] = useState(false);
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
    useState<AciertoEspecialAct7 | null>(null);
  const [aciertoEspecialReproduciendo, setAciertoEspecialReproduciendo] =
    useState(false);
  const [reinicioAciertoEspecial, setReinicioAciertoEspecial] = useState(0);
  const audioAciertoEspecialRef = useRef<HTMLAudioElement | null>(null);
  const aciertoEspecialFallbackRef = useRef<number | null>(null);
  const retoAciertoEspecialRef = useRef<number | null>(null);

  const reto = RETOS[retoActual];
  const pistaActiva = PISTAS_ACT7[pistaSeleccionada];
  const progreso = Math.round((completados / RETOS.length) * 100);

  const pilot=useGeometryEvidence("mathgeometry-actividad-7",mission,()=>({
      errores,
      retos_completados: completados,
    }));

  useAutoProgreso({
    completada: modal === "completado",
    codigo: "mathgeometry-actividad-7",
    mundo: "MathGeometry",
    tema: "Rectas notables de un triángulo",
    titulo: "La Fortaleza Triangular",
    aciertos: RETOS.length + mission.correctCount,
    totalPreguntas: mission.total,
    tiempoSegundos: segundos,
    xpBase: 240,
    respuestas: pilot.evidence(),
  });

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
      setPistaElegida(false);
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
    El consejo del Profesor Astro comienza automáticamente al abrir su modal.
  */
  useEffect(() => {
    if (modal !== "profesor") return;

    const temporizador = window.setTimeout(() => {
      const audio = audioProfesorRef.current;
      if (!audio || !audio.src) return;

      audio.currentTime = 0;
      setTextoProfesor("");
      setIndiceProfesorActivo(0);
      setProgresoProfesorActivo(0);
      setReinicioModal((valor) => valor + 1);
      setModalReproduciendo(true);

      void audio.play().catch(() => {
        setModalReproduciendo(false);
        setTextoProfesor(TEXTO_INICIAL_PROFESOR);
      });
    }, 160);

    return () => window.clearTimeout(temporizador);
  }, [modal]);

  /*
    El modal de pistas abre con el mensaje para elegir una opción.
    La pista comienza automáticamente únicamente después de seleccionarla.
  */
  useEffect(() => {
    if (modal !== "byte" || !pistaElegida) return;

    const temporizador = window.setTimeout(() => {
      const audio = audioPistaRef.current;
      if (!audio || !audio.src) return;

      audio.currentTime = 0;
      setTextoPista("");
      setIndicePistaActivo(0);
      setProgresoPistaActivo(0);
      setReinicioModal((valor) => valor + 1);
      setModalReproduciendo(true);

      void audio.play().catch(() => {
        setModalReproduciendo(false);
        setTextoPista(
          `No se pudo reproducir ${PISTAS_ACT7[pistaSeleccionada].titulo.toLowerCase()}.`,
        );
      });
    }, 180);

    return () => window.clearTimeout(temporizador);
  }, [modal, pistaSeleccionada, pistaElegida]);

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

    body.classList.toggle("act7geo-body-locked", bloquear);
    html.classList.toggle("act7geo-html-locked", bloquear);

    return () => {
      body.classList.remove("act7geo-body-locked");
      html.classList.remove("act7geo-html-locked");
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

  const seleccionarPista = (id: PistaAct7Id) => {
    audioPistaRef.current?.pause();

    if (audioPistaRef.current) {
      audioPistaRef.current.currentTime = 0;
    }

    setModalReproduciendo(false);
    setTextoPista(`Preparando ${PISTAS_ACT7[id].titulo.toLowerCase()}...`);
    setIndicePistaActivo(-1);
    setProgresoPistaActivo(0);
    setPistaSeleccionada(id);
    setPistaElegida(true);
    setReinicioModal((valor) => valor + 1);
  };

  const reproducirPista = () => {
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
    configuracion: AciertoEspecialAct7,
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
    pilot.recordNative(retoActual,seleccion);

    if (seleccion === reto.correcta) {
      setRevision("correcto");

      const configuracionAcierto = ACIERTOS_ESPECIALES_ACT7[retoActual];

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
    mission.reset();
    pilot.resetSession();
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
    setPistaElegida(false);
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
        ? pistaElegida
          ? pistaActiva.video
          : videoByte
        : videoSombra;

  const tituloModal =
    modal === "profesor"
      ? "Consejo del Profesor Astro"
      : modal === "byte"
        ? pistaElegida
          ? pistaActiva.titulo
          : "Elige una pista"
        : "Mensaje de Sombra";

  return (
    <main className="act7geo-page mn-activity">
      <button
        type="button"
        className={`act7geo-hamburger-btn ${
          menuOpen ? "act7geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen((valor) => !valor)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <button
          type="button"
          className="act7geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`act7geo-sidebar ${menuOpen ? "act7geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act7geo-sidebar-logo" />

        <nav className="act7geo-sidebar-menu">
          <button
            type="button"
            className="act7geo-menu-item"
            onClick={() => irARuta(obtenerDashboardPrincipal())}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="act7geo-menu-item act7geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="act7geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="act7geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="act7geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="act7geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mn-sidebar-mission"><span>Tu misión</span><strong>{activityCurriculum["mathgeometry-actividad-7"].objective}</strong></div>
      </aside>

      <section className="act7geo-content">
        <img
          src={heroBanner}
          alt="Banner Actividad 7: La Fortaleza Triangular"
          className="act7geo-bg"
        />

        <section className="act7geo-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathgeometry-actividad-7"]} />
        


          <header className="act7geo-topbar">
            <div className="act7geo-title-area">
              <h1>Actividad 7: La Fortaleza Triangular</h1>
              <p className="act7geo-subtitle">
                Observa cada triángulo e identifica sus rectas importantes para
                proteger la Fortaleza Triangular.
              </p>

              <div className="act7geo-pills">
                <span>▣ Introducción</span>
                <span>
                  <FiClock /> 8–12 min
                </span>
                <span>
                  <FiTarget /> Conteo de errores
                </span>
              </div>
            </div>

            <div className="act7geo-actions-top">
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
            className={`act7geo-intro-row ${
              novaReproduciendo && !pausado ? "act7geo-intro-playing" : ""
            }`}
          >
            <div className="act7geo-nova-stage">
              <VideoCanvasTransparente
                src={videoNova}
                className="act7geo-nova-transparent-wrap"
                canvasClassName="act7geo-nova-canvas"
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

            <div className="act7geo-speech-cloud">
              <div className="act7geo-speech-main">
                <span className="act7geo-cloud-label">
                  Introducción de Nova
                </span>
                <p>
                  {textoNova}
                  {novaReproduciendo && (
                    <span
                      className="act7geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act7geo-nova-mini-controls">
                <button
                  type="button"
                  className="act7geo-nova-control-btn act7geo-nova-control-play"
                  onClick={reproducirNova}
                  disabled={pausado || modal !== null}
                  title="Reproducir animación de Nova"
                  aria-label="Reproducir animación de Nova"
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  className="act7geo-nova-control-btn"
                  onClick={pausarNova}
                  disabled={!novaReproduciendo}
                  title="Pausar animación de Nova"
                  aria-label="Pausar animación de Nova"
                >
                  <FiPause />
                </button>

                <button
                  type="button"
                  className="act7geo-nova-control-btn act7geo-nova-control-repeat"
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

          <EnsayoOtrosMundos activityId="mathgeometry-actividad-7"/>
<div className="act7geo-layout">
            <section className="act7geo-game-card">
              <div className="act7geo-laser-frame">
                <img
                  src={reto.imagen}
                  alt={`Reto ${reto.id}: identifica una recta notable del triángulo`}
                />

                {pausado && (
                  <div className="act7geo-pause-layer">
                    <FiPause />
                    <strong>Actividad pausada</strong>
                  </div>
                )}
              </div>
              <h2>{reto.pregunta}</h2>
              <div
                className="act7geo-options"
                style={
                  {
                    "--act7geo-option-count": reto.opciones.length,
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
                        "act7geo-option",
                        `act7geo-option-color-${index + 1}`,
                        seleccionada ? "act7geo-option-selected" : "",
                        correcta ? "act7geo-option-correct" : "",
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

              <div className="act7geo-game-actions">
                <button
                  type="button"
                  className="act7geo-check-btn"
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
                  className="act7geo-next-btn"
                  onClick={siguiente}
                  disabled={revision !== "correcto" || aciertoEspecial !== null}
                >
                  Siguiente
                  <FiArrowRight />
                </button>
              </div>
            </section>

            <aside className="act7geo-right-panel">
              <button
                type="button"
                className="act7geo-guide-card act7geo-profe-card"
                onClick={() => setModal("profesor")}
              >
                <img
                  src={profesorConsejoImagen}
                  alt="Profesor Astro dando un consejo"
                  className="act7geo-guide-static-image"
                />
                <div>
                  <h3>💡 Consejo del Profesor Astro</h3>
                  <p>
                    Observa desde qué vértice inicia la línea y hacia qué punto
                    del triángulo se dirige.
                  </p>
                  <span className="act7geo-guide-cta">
                    <FiVolume2 />
                    Ver explicación
                  </span>
                </div>
              </button>

              <article className="act7geo-guide-card act7geo-sombra-card act7geo-sombra-static-card">
                <img
                  src={sombraErrorImagen}
                  alt="Sombra dando un aviso"
                  className="act7geo-guide-static-image"
                />
                <div>
                  <h3>✦ ¡Aviso de Sombra!</h3>
                  <p>
                    No elijas una línea solo por su posición; revisa la
                    característica que pide cada reto.
                  </p>
                </div>
              </article>

              <button
                type="button"
                className="act7geo-guide-card act7geo-byte-card"
                onClick={() => setModal("byte")}
              >
                <img
                  src={byteImagen}
                  alt="Byte"
                  className="act7geo-guide-static-image"
                />
                <div>
                  <h3>Pista de Byte</h3>
                  <p>
                    Abre una pista para identificar la recta importante del reto
                    actual.
                  </p>
                  <span className="act7geo-guide-cta act7geo-guide-cta-byte">
                    <FiHelpCircle />
                    Ver pista
                  </span>
                </div>
              </button>

              <article className="act7geo-progress-card">
                <strong>Fortaleza protegida</strong>
                <div>
                  <b style={{ width: `${progreso}%` }} />
                </div>
                <span>
                  {completados}/{RETOS.length} · Tiempo {tiempo}
                </span>
              </article>
            </aside>
          </div>
 


          {/* Barra inferior de resultados, adaptada de la Actividad 5. */}
          <section className="act7geo-bottom-stats">
            <article>
              <FiFlag />
              <div>
                <span>Retos completados</span>
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

            <article className="act7geo-xp-card">
              <span className="act7geo-star">★</span>
              <div>
                <span>XP</span>
                <strong>{completados * 40}</strong>
              </div>
            </article>
          </section>
        <PilotEvidenceStatus pilot={pilot}/>
        <ContinuacionDeMision expansion={mission} onComplete={()=>{setModal("completado");}} onRestart={reiniciar}/>
</section>

        <footer className="act7geo-footer">
          <div className="act7geo-footer-icons">
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
          className={`act7geo-success-toast act7geo-success-${aciertoEspecial.clase}`}
          role="status"
          aria-live="assertive"
          aria-label={`Respuesta correcta. Habla ${aciertoEspecial.personaje}`}
        >
          <div className="act7geo-success-aura" aria-hidden="true" />

          <div className="act7geo-success-character">
            <VideoCanvasTransparente
              src={aciertoEspecial.video}
              className="act7geo-success-video-wrap"
              canvasClassName="act7geo-success-canvas"
              width={360}
              height={640}
              playing={aciertoEspecialReproduciendo}
              restartSignal={reinicioAciertoEspecial}
              loopWhenPlaying
              onEnded={() => undefined}
              label={`${aciertoEspecial.personaje} celebrando la respuesta correcta`}
            />
          </div>

          <div className="act7geo-success-message">
            <span className="act7geo-success-badge">
              <FiCheck />
              {aciertoEspecial.personaje}
            </span>

            <strong>{aciertoEspecial.titulo}</strong>
            <p>{aciertoEspecial.mensaje}</p>
            <small>{aciertoEspecial.cierre}</small>

            <div className="act7geo-success-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </aside>
      )}

      {modal && modal !== "completado" && (
        <div
          className="act7geo-modal-overlay"
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
            className={`act7geo-character-modal ${
              modalReproduciendo ? "act7geo-profe-modal-playing" : ""
            } ${modal === "byte" ? "act7geo-hints-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={tituloModal}
          >
            <button
              type="button"
              className="act7geo-modal-close"
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

            <div className="act7geo-modal-character">
              <VideoCanvasTransparente
                src={videoModal}
                className="act7geo-modal-video-wrap"
                canvasClassName="act7geo-modal-canvas"
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
                  setTextoSombra(TEXTO_FINAL_SOMBRA);
                  setIndiceSombraActivo(GUION_SOMBRA_ERROR.length - 1);
                  setProgresoSombraActivo(100);
                }}
              />
            )}

            <div className="act7geo-modal-content"><AudioRetroalimentacion/>
              <span className="act7geo-modal-badge">
                <FiVolume2 />
                {modal === "profesor"
                  ? "Profesor Astro"
                  : modal === "byte"
                    ? pistaElegida
                      ? pistaActiva.personaje
                      : "Selecciona una opción"
                    : "Sombra"}
              </span>

              <h2>{tituloModal}</h2>

              {modal === "byte" && (
                <div
                  className="act7geo-hint-selector"
                  aria-label="Seleccionar pista"
                >
                  {ORDEN_PISTAS_ACT7.map((id, indice) => {
                    const pista = PISTAS_ACT7[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        className={
                          pistaElegida && id === pistaSeleccionada
                            ? "act7geo-hint-tab-active"
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

              <div className="act7geo-modal-cloud">
                <p>
                  {modal === "profesor"
                    ? textoProfesor
                    : modal === "byte"
                      ? textoPista
                      : textoSombra}
                  {modalReproduciendo && (
                    <span
                      className="act7geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act7geo-modal-controls">
                <button
                  type="button"
                  className="act7geo-modal-play"
                  disabled={modal === "byte" && !pistaElegida}
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
                  disabled={modal === "byte" && !pistaElegida}
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
                    className="act7geo-try-again-btn"
                    onClick={volverAIntentarlo}
                  >
                    <FiRotateCcw />
                    Volver a intentarlo
                  </button>
                )}
              </div>
            </div>

            <aside className="act7geo-modal-script-panel">
              <h3>
                {modal === "byte"
                  ? "Texto de la pista"
                  : modal === "profesor"
                    ? "Texto del profesor"
                    : "Texto de Sombra"}
              </h3>

              {modal === "profesor" && (
                <div className="act7geo-modal-script-lines">
                  {GUION_PROFESOR_ASTRO.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceProfesorActivo
                          ? "act7geo-modal-script-line-active"
                          : indice < indiceProfesorActivo
                            ? "act7geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act7geo-line-progress":
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

              {modal === "byte" && !pistaElegida && (
                <div className="act7geo-hint-empty-state">
                  <FiHelpCircle />
                  <strong>Elige una pista</strong>
                  <p>
                    Selecciona a Nova, Profesor Astro o Byte. La pista elegida
                    comenzará a reproducirse automáticamente.
                  </p>
                </div>
              )}

              {modal === "byte" && pistaElegida && (
                <div className="act7geo-modal-script-lines act7geo-hint-script-lines">
                  {pistaActiva.guion.map((linea, indice) => (
                    <p
                      key={`${pistaActiva.id}-${linea}`}
                      className={
                        indice === indicePistaActivo
                          ? "act7geo-modal-script-line-active"
                          : indice < indicePistaActivo
                            ? "act7geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act7geo-line-progress":
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
                <div className="act7geo-modal-script-lines act7geo-sombra-script-lines">
 <DetalleErroresDeMision items={[...(RETOS.map((r,i)=>({id:`native-${i}`,title:i===retoActual?reto.pregunta:`Reto geométrico ${i+1}`,answer:i===retoActual?(reto.opciones.find(o=>o.id===seleccion)?.texto||"Sin respuesta"):i<completados?"Validado en la misión":"",correct:i<completados?true:i===retoActual?Boolean(seleccion===reto.correcta):null,hint:i===retoActual?`Revisa la propiedad indicada en el reto. La opción que corresponde es: ${reto.opciones.find(o=>o.id===reto.correcta)?.texto}. Consulta la pista para justificarla.`:"Puedes consultar la pista del personaje cuando llegues a este reto.",target:".act7geo-layout"})).filter((_,i)=>i<=retoActual)),...mission.items]} onCorrect={(item)=>{setModal(null); setRevision("pendiente"); audioSombraRef.current?.pause(); mission.beginCorrection(item);}} onRestart={reiniciar}/>

                  {GUION_SOMBRA_ERROR.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceSombraActivo
                          ? "act7geo-modal-script-line-active"
                          : indice < indiceSombraActivo
                            ? "act7geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act7geo-line-progress":
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
        <div className="act7geo-modal-overlay">
          <section
            className="act7geo-complete-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Actividad completada"
          >
            <button
              type="button"
              className="act7geo-modal-close"
              onClick={() => {
                pausarCompletado();
                setModal(null);
              }}
              aria-label="Cerrar modal"
            >
              <FiX />
            </button>

            <div className="act7geo-complete-hero">
              <img
                src={bannerCompletado}
                alt=""
                className="act7geo-complete-decoration"
                aria-hidden="true"
              />

              <VideoCanvasTransparente
                src={videoNova}
                className="act7geo-complete-video-wrap"
                canvasClassName="act7geo-complete-nova-canvas"
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
                setTextoCompletado(TEXTO_FINAL_COMPLETADO);
                setIndiceCompletadoActivo(GUION_NOVA_CIERRE.length - 1);
                setProgresoCompletadoActivo(100);
              }}
            />

            <div className="act7geo-complete-content"><AudioRetroalimentacion/>
              <span>🏆 Fortaleza protegida</span>
              <h2>¡Fortaleza Triangular protegida!</h2>

              <div className="act7geo-complete-cloud">
                <p>
                  {textoCompletado}
                  {completadoReproduciendo && (
                    <span
                      className="act7geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act7geo-complete-controls">
                <button
                  type="button"
                  className="act7geo-complete-play"
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

              <div className="act7geo-complete-summary">
                <article>
                  <FiCheck />
                  <span>Retos</span>
                  <strong>{mission.total}/{mission.total}</strong>
                </article>
                <article>
                  <FiTarget />
                  <span>Precisión</span>
                  <strong>100%</strong>
                </article>
                <article>
                  <span className="act7geo-summary-star">★</span>
                  <span>Recompensa</span>
                  <strong>+240 XP</strong>
                </article>
              </div>
            </div>

            <aside className="act7geo-complete-side">
              <div className="act7geo-complete-transcript act7geo-complete-transcript-inline">
                <h3>Texto de Nova</h3>

                <div className="act7geo-modal-script-lines">
                  {GUION_NOVA_CIERRE.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceCompletadoActivo
                          ? "act7geo-modal-script-line-active"
                          : indice < indiceCompletadoActivo
                            ? "act7geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act7geo-line-progress":
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

              <div className="act7geo-complete-actions">
                <button
                  type="button"
                  onClick={() => irARuta("/actividades/geometria/actividad-8")}
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

export default Actividad7MathGeometry;
