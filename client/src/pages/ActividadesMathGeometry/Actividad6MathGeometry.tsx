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

import "./Actividad6MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividad6/banner_act6_MathGeometry.png";
import reto1 from "../../assets/mathGeometry/actividad6/reto1_act6_MathGeometry.png";
import reto2 from "../../assets/mathGeometry/actividad6/reto2_act6_MathGeometry.png";
import reto3 from "../../assets/mathGeometry/actividad6/reto3_act6_MathGeometry.png";
import reto4 from "../../assets/mathGeometry/actividad6/reto4_act6_MathGeometry.png";
import reto5 from "../../assets/mathGeometry/actividad6/reto5_act6_MathGeometry.png";
import reto6 from "../../assets/mathGeometry/actividad6/reto6_act6_MathGeometry.png";

import byteImagen from "../../assets/mathGeometry/actividad6/byte-act6-mathgeometry.png";
import profesorConsejoImagen from "../../assets/mathGeometry/actividad6/profesor_dando_consejo_actividad_6.png";
import sombraErrorImagen from "../../assets/mathGeometry/actividad6/sombra-error_act6.png";
import bannerCompletado from "../../assets/mathGeometry/actividad6/actividad_completada_6_banner_MathGeometry.png";

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
type PistaAct6Id = "frente" | "linea" | "letras";
type PersonajePistaAct6 = "Nova" | "Profesor Astro" | "Byte";
type PersonajeAciertoAct6 = "Byte" | "Nova" | "Profesor Astro";

type AciertoEspecialAct6 = {
  personaje: PersonajeAciertoAct6;
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

import videoNova from "../../assets/mathGeometry/actividad6/nova_explicando_act_6_MathGeometry.mp4";
import videoProfesor from "../../assets/mathGeometry/actividad6/instrucciones_profe_astro_act_6_MathGeometry.mp4";
import videoByte from "../../assets/mathGeometry/actividad6/byte_aciertos_y_pistas_act_6_MathGeometry.mp4";
import videoSombra from "../../assets/mathGeometry/actividad6/act_6_sombra_error_MathGeometry_.mp4";

/* AUDIOS COMPLETOS DE LA ACTIVIDAD 6 */
import audioNovaIntroduccion from "../../assets/mathGeometry/actividad6/act6_bienvenida_nova_MathGeometry.mp3";
import audioProfesorAstro from "../../assets/mathGeometry/actividad6/act6_instrucciones_astro_MathGeometry.mp3";
import audioPistaNova from "../../assets/mathGeometry/actividad6/act6_nova_Pista_1_Busca_el_centro_del_ángulo_MathGeometry.mp3";
import audioPistaProfesor from "../../assets/mathGeometry/actividad6/act6_profe_Pista_2_Compara_los_dos_lados_MathGeometry.mp3";
import audioPistaByte from "../../assets/mathGeometry/actividad6/act6_byte_Pista_3_Misma_apertura_MathGeometry.mp3";
import audioSombraError from "../../assets/mathGeometry/actividad6/act6_sombra_error_MathGeometry.mp3";
import audioNovaCierre from "../../assets/mathGeometry/actividad6/act6_cierre_nova_MathGeometry.mp3";

const audioByteAcierto = "";
const audioProfesorAcierto = "";
const audioNovaAcierto = "";

const RETOS: Reto[] = [
  {
    id: 1,
    imagen: reto1,
    pregunta:
      "Observa el ángulo y selecciona la línea que lo divide en dos partes iguales.",
    opciones: [
      { id: "B", texto: "Línea B" },
      { id: "A", texto: "Línea A" },
      { id: "C", texto: "Línea C" },
    ],
    correcta: "B",
  },
  {
    id: 2,
    imagen: reto2,
    pregunta:
      "Selecciona la línea que queda exactamente al centro de la apertura del ángulo.",
    opciones: [
      { id: "A", texto: "Línea D" },
      { id: "C", texto: "Línea F" },
      { id: "B", texto: "Línea E" },
    ],
    correcta: "B",
  },
  {
    id: 3,
    imagen: reto3,
    pregunta: "¿Qué línea divide este ángulo en dos regiones del mismo tamaño?",
    opciones: [
      { id: "C", texto: "Línea I" },
      { id: "B", texto: "Línea H" },
      { id: "A", texto: "Línea G" },
    ],
    correcta: "B",
  },
  {
    id: 4,
    imagen: reto4,
    pregunta:
      "Observa el ángulo inclinado y elige la línea que funciona como bisectriz.",
    opciones: [
      { id: "B", texto: "Línea K" },
      { id: "C", texto: "Línea L" },
      { id: "A", texto: "Línea J" },
    ],
    correcta: "B",
  },
  {
    id: 5,
    imagen: reto5,
    pregunta:
      "Selecciona la línea que divide de manera equilibrada el ángulo mostrado.",
    opciones: [
      { id: "C", texto: "Línea P" },
      { id: "A", texto: "Línea M" },
      { id: "B", texto: "Línea N" },
    ],
    correcta: "B",
  },
  {
    id: 6,
    imagen: reto6,
    pregunta:
      "Activa el último cristal eligiendo la línea que divide el ángulo en dos partes iguales.",
    opciones: [
      { id: "A", texto: "Línea R" },
      { id: "B", texto: "Línea S" },
      { id: "C", texto: "Línea T" },
    ],
    correcta: "B",
  },
];

const GUION_NOVA_INTRODUCCION = [
  "¡Hola, explorador de MathNova!",
  "Hoy activaremos El Escudo Perfecto.",
  "Para lograrlo, observa cada ángulo y encuentra la línea que lo divide en dos partes iguales.",
  "También tendrás que comparar ángulos y elegir los que tengan la misma apertura.",
  "¡Vamos a cargar la energía del escudo!",
];

const GUION_PROFESOR_ASTRO = [
  "Observa con atención cada ángulo.",
  "La línea correcta es la que divide el ángulo en dos partes iguales.",
  "No necesitas medir ni usar transportador.",
  "Solo compara visualmente ambos lados y elige la opción que se vea más equilibrada.",
  "Cuando selecciones tu respuesta, comprobaremos si el escudo recibió energía correctamente.",
];

const TEXTO_INICIAL_NOVA =
  "Presiona reproducir para escuchar la introducción de Nova.";
const TEXTO_FINAL_NOVA = "¡Vamos a cargar la energía del escudo!";
const TEXTO_INICIAL_PROFESOR =
  "Presiona reproducir para escuchar las instrucciones del Profesor Astro.";
const TEXTO_FINAL_PROFESOR =
  "Comprobaremos si el escudo recibió energía correctamente.";

const GUION_SOMBRA_ERROR = [
  "Casi lo logras.",
  "Observa otra vez el ángulo y compara sus dos partes.",
  "Si un lado se ve más grande que el otro, quizá esa no es la respuesta correcta.",
  "No pasa nada, inténtalo de nuevo con calma.",
];

const TEXTO_INICIAL_SOMBRA =
  "Presiona reproducir para escuchar el mensaje de Sombra.";
const TEXTO_FINAL_SOMBRA = "No pasa nada, inténtalo de nuevo con calma.";

const GUION_NOVA_CIERRE = [
  "¡Misión completada!",
  "Activaste El Escudo Perfecto con tu observación.",
  "Hoy aprendiste a identificar líneas que dividen ángulos en dos partes iguales.",
  "También comparaste ángulos con la misma apertura.",
  "Cada reto completado fortaleció la energía del escudo.",
  "¡Excelente trabajo, explorador de MathNova!",
];

const TEXTO_INICIAL_COMPLETADO =
  "Presiona reproducir para escuchar el mensaje final de Nova.";
const TEXTO_FINAL_COMPLETADO = "¡Excelente trabajo, explorador de MathNova!";

const PISTAS_ACT6: Record<
  PistaAct6Id,
  {
    id: PistaAct6Id;
    titulo: string;
    subtitulo: string;
    personaje: PersonajePistaAct6;
    audio: string;
    video: string;
    guion: string[];
  }
> = {
  frente: {
    id: "frente",
    titulo: "Pista 1: Centro",
    subtitulo: "Pista espacial",
    personaje: "Nova",
    audio: audioPistaNova,
    video: videoNova,
    guion: [
      "Pista espacial:",
      "Observa cuál línea está más centrada dentro del ángulo.",
      "Si parece dejar el mismo espacio a ambos lados, puede ser la respuesta correcta.",
      "¡El equilibrio es la clave del escudo!",
    ],
  },
  linea: {
    id: "linea",
    titulo: "Pista 2: Dos lados",
    subtitulo: "Pista importante",
    personaje: "Profesor Astro",
    audio: audioPistaProfesor,
    video: videoProfesor,
    guion: [
      "Pista importante:",
      "La línea correcta forma dos partes del mismo tamaño.",
      "Antes de responder, compara si ambos lados del ángulo se ven iguales.",
      "Si una parte se ve mucho más grande, revisa otra opción.",
    ],
  },
  letras: {
    id: "letras",
    titulo: "Pista 3: Apertura",
    subtitulo: "Pista de análisis",
    personaje: "Byte",
    audio: audioPistaByte,
    video: videoByte,
    guion: [
      "Pista de análisis:",
      "Cuando compares ángulos, fíjate solo en la apertura.",
      "Aunque estén girados o en otra posición, pueden tener la misma abertura.",
      "Observa la separación entre sus lados y elige con cuidado.",
    ],
  },
};

const ORDEN_PISTAS_ACT6: PistaAct6Id[] = ["frente", "linea", "letras"];
const TEXTO_INICIAL_PISTA = "Elige una de las tres pistas para escucharla.";

/*
  Las felicitaciones flotantes quedan desactivadas temporalmente.
  Así, al acertar, el botón "Siguiente" se habilita inmediatamente y
  permite avanzar sin esperar una animación o audio que todavía no existe.
*/
const ACIERTOS_ESPECIALES_ACT6: Partial<Record<number, AciertoEspecialAct6>> =
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
    <div className={`act6geo-transparent-video ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="act6geo-source-video"
        muted
        playsInline
        aria-label={label}
        onEnded={onEnded}
      />
      <canvas
        ref={canvasRef}
        className={`${canvasClassName} ${videoListo ? "act6geo-canvas-visible" : ""}`}
        aria-label={label}
      />

      {!videoListo && !videoError && (
        <div className="act6geo-video-loading" aria-hidden="true">
          <span />
        </div>
      )}

      {videoError && (
        <div className="act6geo-video-error">
          No se pudo cargar la animación.
        </div>
      )}
    </div>
  );
}

function Actividad6MathGeometry() {
 const mission=useMissionExpansion("mathgeometry-actividad-6");
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
    useState<PistaAct6Id>("frente");
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
    useState<AciertoEspecialAct6 | null>(null);
  const [aciertoEspecialReproduciendo, setAciertoEspecialReproduciendo] =
    useState(false);
  const [reinicioAciertoEspecial, setReinicioAciertoEspecial] = useState(0);
  const audioAciertoEspecialRef = useRef<HTMLAudioElement | null>(null);
  const aciertoEspecialFallbackRef = useRef<number | null>(null);
  const retoAciertoEspecialRef = useRef<number | null>(null);

  const reto = RETOS[retoActual];
  const pistaActiva = PISTAS_ACT6[pistaSeleccionada];
  const progreso = Math.round((completados / RETOS.length) * 100);

  const pilot=useGeometryEvidence("mathgeometry-actividad-6",mission,()=>({
      errores,
      cristales_activados: completados,
    }));

  useAutoProgreso({
    completada: modal === "completado",
    codigo: "mathgeometry-actividad-6",
    mundo: "MathGeometry",
    tema: "Bisectriz de un ángulo",
    titulo: "El Escudo Perfecto",
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

    body.classList.toggle("act6geo-body-locked", bloquear);
    html.classList.toggle("act6geo-html-locked", bloquear);

    return () => {
      body.classList.remove("act6geo-body-locked");
      html.classList.remove("act6geo-html-locked");
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

  const seleccionarPista = (id: PistaAct6Id) => {
    audioPistaRef.current?.pause();
    if (audioPistaRef.current) audioPistaRef.current.currentTime = 0;
    setPistaSeleccionada(id);
    setTextoPista(TEXTO_INICIAL_PISTA);
    setIndicePistaActivo(-1);
    setProgresoPistaActivo(0);
    setModalReproduciendo(false);
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
    configuracion: AciertoEspecialAct6,
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

      const configuracionAcierto = ACIERTOS_ESPECIALES_ACT6[retoActual];

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
    <main className="act6geo-page mn-activity">
      <button
        type="button"
        className={`act6geo-hamburger-btn ${
          menuOpen ? "act6geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen((valor) => !valor)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <button
          type="button"
          className="act6geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`act6geo-sidebar ${menuOpen ? "act6geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act6geo-sidebar-logo" />

        <nav className="act6geo-sidebar-menu">
          <button
            type="button"
            className="act6geo-menu-item"
            onClick={() => irARuta(obtenerDashboardPrincipal())}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="act6geo-menu-item act6geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="act6geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="act6geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="act6geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="act6geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mn-sidebar-mission"><span>Tu misión</span><strong>{activityCurriculum["mathgeometry-actividad-6"].objective}</strong></div>
      </aside>

      <section className="act6geo-content">
        <img
          src={heroBanner}
          alt="Banner Actividad 6: El Escudo Perfecto"
          className="act6geo-bg"
        />

        <section className="act6geo-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathgeometry-actividad-6"]} />
        


          <header className="act6geo-topbar">
            <div className="act6geo-title-area">
              <h1>Actividad 6: El Escudo Perfecto</h1>
              <p className="act6geo-subtitle">
                Observa cada ángulo y selecciona la línea que lo divide en dos
                partes iguales para activar el escudo.
              </p>

              <div className="act6geo-pills">
                <span>▣ Introducción</span>
                <span>
                  <FiClock /> 8–12 min
                </span>
                <span>
                  <FiTarget /> Conteo de errores
                </span>
              </div>
            </div>

            <div className="act6geo-actions-top">
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
            className={`act6geo-intro-row ${
              novaReproduciendo && !pausado ? "act6geo-intro-playing" : ""
            }`}
          >
            <div className="act6geo-nova-stage">
              <VideoCanvasTransparente
                src={videoNova}
                className="act6geo-nova-transparent-wrap"
                canvasClassName="act6geo-nova-canvas"
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

            <div className="act6geo-speech-cloud">
              <div className="act6geo-speech-main">
                <span className="act6geo-cloud-label">
                  Introducción de Nova
                </span>
                <p>
                  {textoNova}
                  {novaReproduciendo && (
                    <span
                      className="act6geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act6geo-nova-mini-controls">
                <button
                  type="button"
                  className="act6geo-nova-control-btn act6geo-nova-control-play"
                  onClick={reproducirNova}
                  disabled={pausado || modal !== null}
                  title="Reproducir animación de Nova"
                  aria-label="Reproducir animación de Nova"
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  className="act6geo-nova-control-btn"
                  onClick={pausarNova}
                  disabled={!novaReproduciendo}
                  title="Pausar animación de Nova"
                  aria-label="Pausar animación de Nova"
                >
                  <FiPause />
                </button>

                <button
                  type="button"
                  className="act6geo-nova-control-btn act6geo-nova-control-repeat"
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

          <EnsayoOtrosMundos activityId="mathgeometry-actividad-6"/>
<div className="act6geo-layout">
            <section className="act6geo-game-card">
              <div className="act6geo-challenge-head">
                <span>
                  <FiFlag /> Reto {retoActual + 1} de {RETOS.length}
                </span>
              </div>

              <div className="act6geo-laser-frame">
                <img
                  src={reto.imagen}
                  alt={`Reto ${reto.id}: identifica el bisectriz del escudo`}
                />

                {pausado && (
                  <div className="act6geo-pause-layer">
                    <FiPause />
                    <strong>Actividad pausada</strong>
                  </div>
                )}
              </div>

              <h2>{reto.pregunta}</h2>

              <div
                className="act6geo-options"
                style={
                  {
                    "--act6geo-option-count": reto.opciones.length,
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
                        "act6geo-option",
                        `act6geo-option-color-${index + 1}`,
                        seleccionada ? "act6geo-option-selected" : "",
                        correcta ? "act6geo-option-correct" : "",
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

              <div className="act6geo-game-actions">
                <button
                  type="button"
                  className="act6geo-check-btn"
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
                  className="act6geo-next-btn"
                  onClick={siguiente}
                  disabled={revision !== "correcto" || aciertoEspecial !== null}
                >
                  Siguiente
                  <FiArrowRight />
                </button>
              </div>
            </section>

            <aside className="act6geo-right-panel">
              <button
                type="button"
                className="act6geo-guide-card act6geo-profe-card"
                onClick={() => setModal("profesor")}
              >
                <img
                  src={profesorConsejoImagen}
                  alt="Profesor Astro dando un consejo"
                  className="act6geo-guide-static-image"
                />
                <div>
                  <h3>💡 Consejo del Profesor Astro</h3>
                  <p>
                    Observa la distancia del punto a ambos extremos: si es
                    igual, encontraste la bisectriz.
                  </p>
                  <span className="act6geo-guide-cta">
                    <FiVolume2 />
                    Ver explicación
                  </span>
                </div>
              </button>

              <article className="act6geo-guide-card act6geo-sombra-card act6geo-sombra-static-card">
                <img
                  src={sombraErrorImagen}
                  alt="Sombra dando un aviso"
                  className="act6geo-guide-static-image"
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
                className="act6geo-guide-card act6geo-byte-card"
                onClick={() => setModal("byte")}
              >
                <img
                  src={byteImagen}
                  alt="Byte"
                  className="act6geo-guide-static-image"
                />
                <div>
                  <h3>Pista de Byte</h3>
                  <p>
                    Abre una pista para identificar la bisectriz del reto
                    actual.
                  </p>
                  <span className="act6geo-guide-cta act6geo-guide-cta-byte">
                    <FiHelpCircle />
                    Ver pista
                  </span>
                </div>
              </button>

              <article className="act6geo-progress-card">
                <strong>Cristales activados</strong>
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
          <section className="act6geo-bottom-stats">
            <article>
              <FiFlag />
              <div>
                <span>Escudos activados</span>
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

            <article className="act6geo-xp-card">
              <span className="act6geo-star">★</span>
              <div>
                <span>XP</span>
                <strong>{completados * 40}</strong>
              </div>
            </article>
          </section>
        <PilotEvidenceStatus pilot={pilot}/>
        <ContinuacionDeMision expansion={mission} onComplete={()=>{setModal("completado");}} onRestart={reiniciar}/>
</section>

        <footer className="act6geo-footer">
          <div className="act6geo-footer-icons">
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
          className={`act6geo-success-toast act6geo-success-${aciertoEspecial.clase}`}
          role="status"
          aria-live="assertive"
          aria-label={`Respuesta correcta. Habla ${aciertoEspecial.personaje}`}
        >
          <div className="act6geo-success-aura" aria-hidden="true" />

          <div className="act6geo-success-character">
            <VideoCanvasTransparente
              src={aciertoEspecial.video}
              className="act6geo-success-video-wrap"
              canvasClassName="act6geo-success-canvas"
              width={360}
              height={640}
              playing={aciertoEspecialReproduciendo}
              restartSignal={reinicioAciertoEspecial}
              loopWhenPlaying
              onEnded={() => undefined}
              label={`${aciertoEspecial.personaje} celebrando la respuesta correcta`}
            />
          </div>

          <div className="act6geo-success-message">
            <span className="act6geo-success-badge">
              <FiCheck />
              {aciertoEspecial.personaje}
            </span>

            <strong>{aciertoEspecial.titulo}</strong>
            <p>{aciertoEspecial.mensaje}</p>
            <small>{aciertoEspecial.cierre}</small>

            <div className="act6geo-success-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </aside>
      )}

      {modal && modal !== "completado" && (
        <div
          className="act6geo-modal-overlay"
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
            className={`act6geo-character-modal ${
              modalReproduciendo ? "act6geo-profe-modal-playing" : ""
            } ${modal === "byte" ? "act6geo-hints-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={tituloModal}
          >
            <button
              type="button"
              className="act6geo-modal-close"
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

            <div className="act6geo-modal-character">
              <VideoCanvasTransparente
                src={videoModal}
                className="act6geo-modal-video-wrap"
                canvasClassName="act6geo-modal-canvas"
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

            <div className="act6geo-modal-content"><AudioRetroalimentacion/>
              <span className="act6geo-modal-badge">
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
                  className="act6geo-hint-selector"
                  aria-label="Seleccionar pista"
                >
                  {ORDEN_PISTAS_ACT6.map((id, indice) => {
                    const pista = PISTAS_ACT6[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        className={
                          id === pistaSeleccionada
                            ? "act6geo-hint-tab-active"
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

              <div className="act6geo-modal-cloud">
                <p>
                  {modal === "profesor"
                    ? textoProfesor
                    : modal === "byte"
                      ? textoPista
                      : textoSombra}
                  {modalReproduciendo && (
                    <span
                      className="act6geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act6geo-modal-controls">
                <button
                  type="button"
                  className="act6geo-modal-play"
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
                    className="act6geo-try-again-btn"
                    onClick={volverAIntentarlo}
                  >
                    <FiRotateCcw />
                    Volver a intentarlo
                  </button>
                )}
              </div>
            </div>

            <aside className="act6geo-modal-script-panel">
              <h3>
                {modal === "byte"
                  ? "Texto de la pista"
                  : modal === "profesor"
                    ? "Texto del profesor"
                    : "Texto de Sombra"}
              </h3>

              {modal === "profesor" && (
                <div className="act6geo-modal-script-lines">
                  {GUION_PROFESOR_ASTRO.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceProfesorActivo
                          ? "act6geo-modal-script-line-active"
                          : indice < indiceProfesorActivo
                            ? "act6geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act6geo-line-progress":
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
                <div className="act6geo-modal-script-lines act6geo-hint-script-lines">
                  {pistaActiva.guion.map((linea, indice) => (
                    <p
                      key={`${pistaActiva.id}-${linea}`}
                      className={
                        indice === indicePistaActivo
                          ? "act6geo-modal-script-line-active"
                          : indice < indicePistaActivo
                            ? "act6geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act6geo-line-progress":
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
                <div className="act6geo-modal-script-lines act6geo-sombra-script-lines">
 <DetalleErroresDeMision items={[...(RETOS.map((r,i)=>({id:`native-${i}`,title:i===retoActual?reto.pregunta:`Reto geométrico ${i+1}`,answer:i===retoActual?(reto.opciones.find(o=>o.id===seleccion)?.texto||"Sin respuesta"):i<completados?"Validado en la misión":"",correct:i<completados?true:i===retoActual?Boolean(seleccion===reto.correcta):null,hint:i===retoActual?`Revisa la propiedad indicada en el reto. La opción que corresponde es: ${reto.opciones.find(o=>o.id===reto.correcta)?.texto}. Consulta la pista para justificarla.`:"Puedes consultar la pista del personaje cuando llegues a este reto.",target:".act6geo-layout"})).filter((_,i)=>i<=retoActual)),...mission.items]} onCorrect={(item)=>{setModal(null); setRevision("pendiente"); audioSombraRef.current?.pause(); mission.beginCorrection(item);}} onRestart={reiniciar}/>

                  {GUION_SOMBRA_ERROR.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceSombraActivo
                          ? "act6geo-modal-script-line-active"
                          : indice < indiceSombraActivo
                            ? "act6geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act6geo-line-progress":
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
        <div className="act6geo-modal-overlay">
          <section
            className="act6geo-complete-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Actividad completada"
          >
            <button
              type="button"
              className="act6geo-modal-close"
              onClick={() => {
                pausarCompletado();
                setModal(null);
              }}
              aria-label="Cerrar modal"
            >
              <FiX />
            </button>

            <div className="act6geo-complete-hero">
              <img
                src={bannerCompletado}
                alt=""
                className="act6geo-complete-decoration"
                aria-hidden="true"
              />

              <VideoCanvasTransparente
                src={videoNova}
                className="act6geo-complete-video-wrap"
                canvasClassName="act6geo-complete-nova-canvas"
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

            <div className="act6geo-complete-content"><AudioRetroalimentacion/>
              <span>🏆 Escudo activado</span>
              <h2>¡Escudo Perfecto activado!</h2>

              <div className="act6geo-complete-cloud">
                <p>
                  {textoCompletado}
                  {completadoReproduciendo && (
                    <span
                      className="act6geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act6geo-complete-controls">
                <button
                  type="button"
                  className="act6geo-complete-play"
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

              <div className="act6geo-complete-summary">
                <article>
                  <FiCheck />
                  <span>Cristales</span>
                  <strong>{mission.total}/{mission.total}</strong>
                </article>
                <article>
                  <FiTarget />
                  <span>Precisión</span>
                  <strong>100%</strong>
                </article>
                <article>
                  <span className="act6geo-summary-star">★</span>
                  <span>Recompensa</span>
                  <strong>+240 XP</strong>
                </article>
              </div>
            </div>

            <aside className="act6geo-complete-side">
              <div className="act6geo-complete-transcript act6geo-complete-transcript-inline">
                <h3>Texto de Nova</h3>

                <div className="act6geo-modal-script-lines">
                  {GUION_NOVA_CIERRE.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceCompletadoActivo
                          ? "act6geo-modal-script-line-active"
                          : indice < indiceCompletadoActivo
                            ? "act6geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act6geo-line-progress":
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

              <div className="act6geo-complete-actions">
                <button
                  type="button"
                  onClick={() => irARuta("/actividades/geometria/actividad-7")}
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

export default Actividad6MathGeometry;
