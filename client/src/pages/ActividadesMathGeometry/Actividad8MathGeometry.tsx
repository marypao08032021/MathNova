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

import "./Actividad8MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividad8/banner_act8_MathGeometry.png";
import reto1 from "../../assets/mathGeometry/actividad8/act8_reto1.png";
import reto2 from "../../assets/mathGeometry/actividad8/act8_reto2.png";
import reto3 from "../../assets/mathGeometry/actividad8/act8_reto3.png";
import reto4 from "../../assets/mathGeometry/actividad8/act8_reto4.png";
import reto5 from "../../assets/mathGeometry/actividad8/act8_reto5.png";
import reto6 from "../../assets/mathGeometry/actividad8/act8_reto6.png";

import byteImagen from "../../assets/mathGeometry/actividad8/byte-act8-mathgeometry.png";
import profesorConsejoImagen from "../../assets/mathGeometry/actividad8/profesor_dando_consejo_actividad_8.png";
import sombraErrorImagen from "../../assets/mathGeometry/actividad8/sombra-error_act8.png";
import bannerCompletado from "../../assets/mathGeometry/actividad8/actividad_completada_8_banner_MathGeometry.png";

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
type PistaAct8Id = "frente" | "linea" | "letras";
type PersonajePistaAct8 = "Nova" | "Profesor Astro" | "Byte";
type PersonajeAciertoAct8 = "Byte" | "Nova" | "Profesor Astro";

type AciertoEspecialAct8 = {
  personaje: PersonajeAciertoAct8;
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
  correctas?: OpcionId[];
};

import videoNova from "../../assets/mathGeometry/actividad8/nova_explicando_act_8_MathGeometry.mp4";
import videoProfesor from "../../assets/mathGeometry/actividad8/instrucciones_profe_astro_act_8_MathGeometry.mp4";
import videoByte from "../../assets/mathGeometry/actividad8/byte_aciertos_y_pistas_act_8_MathGeometry.mp4";
import videoSombra from "../../assets/mathGeometry/actividad8/act_8_sombra_error_MathGeometry_.mp4";

import audioNovaIntroduccion from "../../assets/mathGeometry/actividad8/act8_bienvenida_nova_MathGeometry.mp3";
import audioProfesorAstro from "../../assets/mathGeometry/actividad8/act8_instrucciones_profe_astro_MathGeometry.mp3";
import audioPistaNova from "../../assets/mathGeometry/actividad8/act8_pista_1_Nova_MathGeometry.mp3";
import audioPistaProfesor from "../../assets/mathGeometry/actividad8/act8_pista_2_Profesor_Astro_MathGeometry.mp3";
import audioPistaByte from "../../assets/mathGeometry/actividad8/act8_pista_3_Byte_MathGeometry.mp3";
import audioSombraError from "../../assets/mathGeometry/actividad8/act8_sombra_del_error_MathGeometry.mp3";
import audioNovaCierre from "../../assets/mathGeometry/actividad8/act8_cierre_nova_MathGeometry.mp3";

/* ================================================================
   AUDIOS DE LA ACTIVIDAD 8
   ---------------------------------------------------------------
   Los modales quedaron preparados y sin audios.
   Cuando tengas los MP3, impórtalos aquí y reemplaza las cadenas vacías.
   ================================================================ */
const audioByteAcierto = "";
const audioProfesorAcierto = "";
const audioNovaAcierto = "";

const RETOS: Reto[] = [
  {
    id: 1,
    imagen: reto1,
    pregunta: "Selecciona la línea que une los vértices A y C.",
    opciones: [
      { id: "A", texto: "Línea amarilla" },
      { id: "B", texto: "Línea celeste" },
      { id: "C", texto: "Línea roja" },
      { id: "D", texto: "Línea verde" },
    ],
    correcta: "C",
  },
  {
    id: 2,
    imagen: reto2,
    pregunta: "Selecciona la diagonal que une los vértices E y G.",
    opciones: [
      { id: "A", texto: "Línea roja" },
      { id: "B", texto: "Línea amarilla" },
      { id: "C", texto: "Línea verde" },
      { id: "D", texto: "Línea celeste" },
    ],
    correcta: "C",
  },
  {
    id: 3,
    imagen: reto3,
    pregunta: "Selecciona una diagonal del rombo: debe unir dos vértices opuestos.",
    opciones: [
      { id: "A", texto: "Línea verde" },
      { id: "B", texto: "Línea amarilla" },
      { id: "C", texto: "Contorno azul" },
      { id: "D", texto: "Punto central" },
    ],
    correcta: "B",
    correctas: ["A", "B"],
  },
  {
    id: 4,
    imagen: reto4,
    pregunta: "Selecciona un par de vértices opuestos que forme una diagonal.",
    opciones: [
      { id: "A", texto: "Vértices A y B" },
      { id: "B", texto: "Vértices A y C" },
      { id: "C", texto: "Vértices B y D" },
      { id: "D", texto: "Vértices C y D" },
    ],
    correcta: "C",
    correctas: ["B", "C"],
  },
  {
    id: 5,
    imagen: reto5,
    pregunta: "Selecciona la diagonal que une los vértices B y D.",
    opciones: [
      { id: "A", texto: "Línea amarilla" },
      { id: "B", texto: "Línea roja" },
      { id: "C", texto: "Línea morada" },
      { id: "D", texto: "Contorno azul" },
    ],
    correcta: "C",
  },
  {
    id: 6,
    imagen: reto6,
    pregunta: "Selecciona una diagonal: sus dos extremos deben coincidir con vértices opuestos.",
    opciones: [
      { id: "A", texto: "Línea verde" },
      { id: "B", texto: "Línea morada" },
      { id: "C", texto: "Línea naranja" },
      { id: "D", texto: "Línea roja" },
    ],
    correcta: "D",
    correctas: ["C", "D"],
  },
];

const GUION_NOVA_INTRODUCCION = [
  "¡Hola, explorador de MathNova!",
  "Hoy activaremos El Centro de Control.",
  "En cada reto verás una figura con varias líneas o vértices marcados.",
  "Tu misión será encontrar la diagonal correcta.",
  "Recuerda: una diagonal une dos vértices opuestos y atraviesa el interior de la figura.",
  "¡Vamos a encender el sistema!",
];

const GUION_PROFESOR_ASTRO = [
  "En esta actividad aprenderás a reconocer diagonales en diferentes cuadriláteros.",
  "Verás cuadrados, rectángulos, rombos y otras figuras con distintas posiciones.",
  "No necesitas medir, calcular ni dibujar.",
  "Solo observa bien qué puntos une cada línea.",
  "Si la línea conecta dos vértices opuestos, entonces puede ser una diagonal.",
  "Cuando elijas tu respuesta, comprobaremos si activaste correctamente la consola.",
];

const GUION_SOMBRA_ERROR = [
  "Casi lo logras.",
  "Observa nuevamente la figura y revisa qué puntos une cada línea.",
  "Recuerda que una diagonal conecta vértices opuestos.",
  "Tómate tu tiempo y vuelve a intentarlo.",
  "¡El sistema aún puede activarse!",
];

const GUION_NOVA_CIERRE = [
  "¡Misión completada!",
  "Lograste activar El Centro de Control.",
  "Aprendiste a reconocer diagonales en cuadrados, rectángulos, rombos y otros cuadriláteros.",
  "Ahora sabes que una diagonal une dos vértices opuestos y cruza el interior de la figura.",
  "Cada reto completado quedó registrado como evidencia de tu avance.",
  "¡Muy buen trabajo, explorador de MathNova!",
  "Nos vemos en la siguiente misión.",
];

const TEXTO_INICIAL_NOVA =
  "Presiona iniciar para escuchar la explicación de Nova.";
const TEXTO_FINAL_NOVA = GUION_NOVA_INTRODUCCION.join(" ");

const TEXTO_INICIAL_PROFESOR = GUION_PROFESOR_ASTRO[0];
const TEXTO_FINAL_PROFESOR = GUION_PROFESOR_ASTRO.join(" ");

const TEXTO_INICIAL_SOMBRA = GUION_SOMBRA_ERROR[0];
const TEXTO_FINAL_SOMBRA = GUION_SOMBRA_ERROR.join(" ");

const TEXTO_INICIAL_COMPLETADO = GUION_NOVA_CIERRE[0];
const TEXTO_FINAL_COMPLETADO = GUION_NOVA_CIERRE.join(" ");

const PISTAS_ACT8: Record<
  PistaAct8Id,
  {
    id: PistaAct8Id;
    titulo: string;
    subtitulo: string;
    personaje: PersonajePistaAct8;
    audio: string;
    video: string;
    guion: string[];
  }
> = {
  frente: {
    id: "frente",
    titulo: "Pista 1",
    subtitulo: "Pista de explorador",
    personaje: "Nova",
    audio: audioPistaNova,
    video: videoNova,
    guion: [
      "Pista de explorador:",
      "Primero identifica las esquinas de la figura.",
      "Luego revisa si la línea une dos esquinas que están una frente a la otra.",
      "Si hace eso, puede ser una diagonal.",
    ],
  },
  linea: {
    id: "linea",
    titulo: "Pista 2",
    subtitulo: "Pista geométrica",
    personaje: "Profesor Astro",
    audio: audioPistaProfesor,
    video: videoProfesor,
    guion: [
      "Pista geométrica:",
      "No confundas los lados con las diagonales.",
      "Los lados forman el borde de la figura.",
      "Las diagonales atraviesan el interior y conectan vértices opuestos.",
    ],
  },
  letras: {
    id: "letras",
    titulo: "Pista 3",
    subtitulo: "Pista rápida",
    personaje: "Byte",
    audio: audioPistaByte,
    video: videoByte,
    guion: [
      "Pista rápida:",
      "La figura puede estar derecha, inclinada o girada.",
      "No te fijes solo en la posición.",
      "Observa qué vértices conecta cada línea.",
      "¡Ahí está la clave!",
    ],
  },
};

const ORDEN_PISTAS_ACT8: PistaAct8Id[] = ["frente", "linea", "letras"];
const TEXTO_INICIAL_PISTA =
  "Selecciona una pista para escucharla. Al elegirla, comenzará automáticamente.";

/*
  Las felicitaciones flotantes quedan desactivadas temporalmente.
  Así, al acertar, el botón "Siguiente" se habilita inmediatamente y
  permite avanzar sin esperar una animación o audio que todavía no existe.
*/
const ACIERTOS_ESPECIALES_ACT8: Partial<Record<number, AciertoEspecialAct8>> =
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
    <div className={`act8geo-transparent-video ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="act8geo-source-video"
        muted
        playsInline
        aria-label={label}
        onEnded={onEnded}
      />
      <canvas
        ref={canvasRef}
        className={`${canvasClassName} ${videoListo ? "act8geo-canvas-visible" : ""}`}
        aria-label={label}
      />

      {!videoListo && !videoError && (
        <div className="act8geo-video-loading" aria-hidden="true">
          <span />
        </div>
      )}

      {videoError && (
        <div className="act8geo-video-error">
          No se pudo cargar la animación.
        </div>
      )}
    </div>
  );
}

function Actividad8MathGeometry() {
 const mission=useMissionExpansion("mathgeometry-actividad-8");
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
    useState<PistaAct8Id>("frente");
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
    useState<AciertoEspecialAct8 | null>(null);
  const [aciertoEspecialReproduciendo, setAciertoEspecialReproduciendo] =
    useState(false);
  const [reinicioAciertoEspecial, setReinicioAciertoEspecial] = useState(0);
  const audioAciertoEspecialRef = useRef<HTMLAudioElement | null>(null);
  const aciertoEspecialFallbackRef = useRef<number | null>(null);
  const retoAciertoEspecialRef = useRef<number | null>(null);

  const reto = RETOS[retoActual];
  const pistaActiva = PISTAS_ACT8[pistaSeleccionada];
  const progreso = Math.round((completados / RETOS.length) * 100);

  const pilot=useGeometryEvidence("mathgeometry-actividad-8",mission,()=>({
      errores,
      retos_completados: completados,
    }));

  useAutoProgreso({
    completada: modal === "completado",
    codigo: "mathgeometry-actividad-8",
    mundo: "MathGeometry",
    tema: "Diagonales de cuadriláteros",
    titulo: "El Centro de Control",
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
    Al abrir el consejo del Profesor Astro, el audio y la animación
    comienzan automáticamente.
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
    }, 140);

    return () => window.clearTimeout(temporizador);
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

    body.classList.toggle("act8geo-body-locked", bloquear);
    html.classList.toggle("act8geo-html-locked", bloquear);

    return () => {
      body.classList.remove("act8geo-body-locked");
      html.classList.remove("act8geo-html-locked");
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

  const seleccionarPista = (id: PistaAct8Id) => {
    audioPistaRef.current?.pause();

    if (audioPistaRef.current) {
      audioPistaRef.current.currentTime = 0;
    }

    setPistaSeleccionada(id);
    setPistaElegida(true);
    setTextoPista("");
    setIndicePistaActivo(0);
    setProgresoPistaActivo(0);
    setModalReproduciendo(false);
    setReinicioModal((valor) => valor + 1);

    window.setTimeout(() => {
      const audio = audioPistaRef.current;
      if (!audio || !audio.src || modal !== "byte") return;

      audio.currentTime = 0;
      setModalReproduciendo(true);

      void audio.play().catch(() => {
        setModalReproduciendo(false);
        setTextoPista(PISTAS_ACT8[id].guion[0]);
      });
    }, 120);
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
    configuracion: AciertoEspecialAct8,
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

    if ((reto.correctas ?? [reto.correcta]).includes(seleccion)) {
      setRevision("correcto");

      const configuracionAcierto = ACIERTOS_ESPECIALES_ACT8[retoActual];

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
        ? pistaActiva.video
        : videoSombra;

  const tituloModal =
    modal === "profesor"
      ? "Consejo del Profesor Astro"
      : modal === "byte"
        ? pistaActiva.titulo
        : "Mensaje de Sombra";

  return (
    <main className="act8geo-page mn-activity">
      <button
        type="button"
        className={`act8geo-hamburger-btn ${
          menuOpen ? "act8geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen((valor) => !valor)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <button
          type="button"
          className="act8geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`act8geo-sidebar ${menuOpen ? "act8geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act8geo-sidebar-logo" />

        <nav className="act8geo-sidebar-menu">
          <button
            type="button"
            className="act8geo-menu-item"
            onClick={() => irARuta(obtenerDashboardPrincipal())}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="act8geo-menu-item act8geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="act8geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="act8geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="act8geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="act8geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mn-sidebar-mission"><span>Tu misión</span><strong>{activityCurriculum["mathgeometry-actividad-8"].objective}</strong></div>
      </aside>

      <section className="act8geo-content">
        <img
          src={heroBanner}
          alt="Banner Actividad 8: El Centro de Control"
          className="act8geo-bg"
        />

        <section className="act8geo-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathgeometry-actividad-8"]} />
        


          <header className="act8geo-topbar">
            <div className="act8geo-title-area">
              <h1>Actividad 8: El Centro de Control</h1>
              <p className="act8geo-subtitle">
                Observa cada cuadrilátero y reconoce la línea que une dos
                vértices opuestos.
              </p>

              <div className="act8geo-pills">
                <span>▣ Introducción</span>
                <span>
                  <FiClock /> 8–12 min
                </span>
                <span>
                  <FiTarget /> Conteo de errores
                </span>
              </div>
            </div>

            <div className="act8geo-actions-top">
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
            className={`act8geo-intro-row ${
              novaReproduciendo && !pausado ? "act8geo-intro-playing" : ""
            }`}
          >
            <div className="act8geo-nova-stage">
              <VideoCanvasTransparente
                src={videoNova}
                className="act8geo-nova-transparent-wrap"
                canvasClassName="act8geo-nova-canvas"
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

            <div className="act8geo-speech-cloud">
              <div className="act8geo-speech-main">
                <span className="act8geo-cloud-label">Nova explica</span>
                <p>
                  {textoNova}
                  {novaReproduciendo && (
                    <span
                      className="act8geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act8geo-nova-mini-controls">
                <button
                  type="button"
                  className="act8geo-nova-control-btn act8geo-nova-control-play"
                  onClick={reproducirNova}
                  disabled={pausado || modal !== null}
                  title="Reproducir animación de Nova"
                  aria-label="Reproducir animación de Nova"
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  className="act8geo-nova-control-btn"
                  onClick={pausarNova}
                  disabled={!novaReproduciendo}
                  title="Pausar animación de Nova"
                  aria-label="Pausar animación de Nova"
                >
                  <FiPause />
                </button>

                <button
                  type="button"
                  className="act8geo-nova-control-btn act8geo-nova-control-repeat"
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

          <EnsayoOtrosMundos activityId="mathgeometry-actividad-8"/>
<div className="act8geo-layout">
            <section className="act8geo-game-card">
              <div className="act8geo-laser-frame">
                <img
                  src={reto.imagen}
                  alt={`Reto ${reto.id}: identifica las diagonales del cuadrilátero`}
                />

                {pausado && (
                  <div className="act8geo-pause-layer">
                    <FiPause />
                    <strong>Actividad pausada</strong>
                  </div>
                )}
              </div>

              <h2>{reto.pregunta}</h2>
              <div
                className="act8geo-options"
                style={
                  {
                    "--act8geo-option-count": reto.opciones.length,
                  } as CSSProperties
                }
              >
                {reto.opciones.map((opcion, index) => {
                  const seleccionada = seleccion === opcion.id;
                  const correcta =
                    revision === "correcto" && opcion.id === seleccion;

                  return (
                    <button
                      type="button"
                      key={opcion.id}
                      className={[
                        "act8geo-option",
                        `act8geo-option-color-${index + 1}`,
                        seleccionada ? "act8geo-option-selected" : "",
                        correcta ? "act8geo-option-correct" : "",
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

              <div className="act8geo-game-actions">
                <button
                  type="button"
                  className="act8geo-check-btn"
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
                  className="act8geo-next-btn"
                  onClick={siguiente}
                  disabled={revision !== "correcto" || aciertoEspecial !== null}
                >
                  Siguiente
                  <FiArrowRight />
                </button>
              </div>
            </section>

            <aside className="act8geo-right-panel">
              <button
                type="button"
                className="act8geo-guide-card act8geo-profe-card"
                onClick={() => setModal("profesor")}
              >
                <img
                  src={profesorConsejoImagen}
                  alt="Profesor Astro dando un consejo"
                  className="act8geo-guide-static-image"
                />
                <div>
                  <h3>💡 Consejo del Profesor Astro</h3>
                  <p>
                    Una diagonal une dos vértices opuestos y atraviesa el
                    interior de la figura.
                  </p>
                  <span className="act8geo-guide-cta">
                    <FiVolume2 />
                    Ver explicación
                  </span>
                </div>
              </button>

              <article className="act8geo-guide-card act8geo-sombra-card act8geo-sombra-static-card">
                <img
                  src={sombraErrorImagen}
                  alt="Sombra dando un aviso"
                  className="act8geo-guide-static-image"
                />
                <div>
                  <h3>✦ ¡Aviso de Sombra!</h3>
                  <p>
                    No confundas una diagonal con un lado o con una línea que
                    termina a la mitad.
                  </p>
                </div>
              </article>

              <button
                type="button"
                className="act8geo-guide-card act8geo-byte-card"
                onClick={() => setModal("byte")}
              >
                <img
                  src={byteImagen}
                  alt="Byte"
                  className="act8geo-guide-static-image"
                />
                <div>
                  <h3>Pista de Byte</h3>
                  <p>
                    Abre una pista para reconocer los vértices opuestos del reto
                    actual.
                  </p>
                  <span className="act8geo-guide-cta act8geo-guide-cta-byte">
                    <FiHelpCircle />
                    Ver pista
                  </span>
                </div>
              </button>

              <article className="act8geo-progress-card">
                <strong>Diagonales correctas</strong>
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
          <section className="act8geo-bottom-stats">
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

            <article className="act8geo-xp-card">
              <span className="act8geo-star">★</span>
              <div>
                <span>XP</span>
                <strong>{completados * 40}</strong>
              </div>
            </article>
          </section>
        <PilotEvidenceStatus pilot={pilot}/>
        <ContinuacionDeMision expansion={mission} onComplete={()=>{setModal("completado");}} onRestart={reiniciar}/>
</section>

        <footer className="act8geo-footer">
          <div className="act8geo-footer-icons">
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
          className={`act8geo-success-toast act8geo-success-${aciertoEspecial.clase}`}
          role="status"
          aria-live="assertive"
          aria-label={`Respuesta correcta. Habla ${aciertoEspecial.personaje}`}
        >
          <div className="act8geo-success-aura" aria-hidden="true" />

          <div className="act8geo-success-character">
            <VideoCanvasTransparente
              src={aciertoEspecial.video}
              className="act8geo-success-video-wrap"
              canvasClassName="act8geo-success-canvas"
              width={360}
              height={640}
              playing={aciertoEspecialReproduciendo}
              restartSignal={reinicioAciertoEspecial}
              loopWhenPlaying
              onEnded={() => undefined}
              label={`${aciertoEspecial.personaje} celebrando la respuesta correcta`}
            />
          </div>

          <div className="act8geo-success-message">
            <span className="act8geo-success-badge">
              <FiCheck />
              {aciertoEspecial.personaje}
            </span>

            <strong>{aciertoEspecial.titulo}</strong>
            <p>{aciertoEspecial.mensaje}</p>
            <small>{aciertoEspecial.cierre}</small>

            <div className="act8geo-success-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </aside>
      )}

      {modal && modal !== "completado" && (
        <div
          className="act8geo-modal-overlay"
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
            className={`act8geo-character-modal ${
              modalReproduciendo ? "act8geo-profe-modal-playing" : ""
            } ${modal === "byte" ? "act8geo-hints-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={tituloModal}
          >
            <button
              type="button"
              className="act8geo-modal-close"
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

            <div className="act8geo-modal-character">
              <VideoCanvasTransparente
                src={videoModal}
                className="act8geo-modal-video-wrap"
                canvasClassName="act8geo-modal-canvas"
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
                  setReinicioModal((valor) => valor + 1);
                }}
              />
            )}

            <div className="act8geo-modal-content"><AudioRetroalimentacion/>
              <span className="act8geo-modal-badge">
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
                  className="act8geo-hint-selector"
                  aria-label="Seleccionar pista"
                >
                  {ORDEN_PISTAS_ACT8.map((id, indice) => {
                    const pista = PISTAS_ACT8[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        className={
                          pistaElegida && id === pistaSeleccionada
                            ? "act8geo-hint-tab-active"
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

              <div className="act8geo-modal-cloud">
                <p>
                  {modal === "profesor"
                    ? textoProfesor
                    : modal === "byte"
                      ? textoPista
                      : textoSombra}
                  {modalReproduciendo && (
                    <span
                      className="act8geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act8geo-modal-controls">
                <button
                  type="button"
                  className="act8geo-modal-play"
                  onClick={
                    modal === "profesor"
                      ? reproducirProfesor
                      : modal === "byte"
                        ? reproducirPista
                        : reproducirSombra
                  }
                  disabled={modal === "byte" && !pistaElegida}
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
                  disabled={
                    !modalReproduciendo || (modal === "byte" && !pistaElegida)
                  }
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
                  disabled={modal === "byte" && !pistaElegida}
                >
                  <FiRotateCcw /> Reiniciar
                </button>

                {modal === "sombra" && (
                  <button
                    type="button"
                    className="act8geo-try-again-btn"
                    onClick={volverAIntentarlo}
                  >
                    <FiRotateCcw />
                    Volver a intentarlo
                  </button>
                )}
              </div>
            </div>

            <aside className="act8geo-modal-script-panel">
              <h3>
                {modal === "byte"
                  ? "Texto de la pista"
                  : modal === "profesor"
                    ? "Texto del profesor"
                    : "Texto de Sombra"}
              </h3>

              {modal === "profesor" && (
                <div className="act8geo-modal-script-lines">
                  {GUION_PROFESOR_ASTRO.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceProfesorActivo
                          ? "act8geo-modal-script-line-active"
                          : indice < indiceProfesorActivo
                            ? "act8geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act8geo-line-progress":
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
                <div className="act8geo-modal-script-lines act8geo-hint-script-lines">
                  {pistaActiva.guion.map((linea, indice) => (
                    <p
                      key={`${pistaActiva.id}-${linea}`}
                      className={
                        indice === indicePistaActivo
                          ? "act8geo-modal-script-line-active"
                          : indice < indicePistaActivo
                            ? "act8geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act8geo-line-progress":
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
                <div className="act8geo-modal-script-lines act8geo-sombra-script-lines">
 <DetalleErroresDeMision items={[...(RETOS.map((r,i)=>({id:`native-${i}`,title:i===retoActual?reto.pregunta:`Reto geométrico ${i+1}`,answer:i===retoActual?(reto.opciones.find(o=>o.id===seleccion)?.texto||"Sin respuesta"):i<completados?"Validado en la misión":"",correct:i<completados?true:i===retoActual?Boolean(seleccion && (reto.correctas ?? [reto.correcta]).includes(seleccion)):null,hint:i===retoActual?`Revisa la propiedad indicada en el reto. Opciones válidas: ${reto.opciones.filter(o=>(reto.correctas ?? [reto.correcta]).includes(o.id)).map(o=>o.texto).join(" o ")}. Consulta la pista para justificarla.`:"Puedes consultar la pista del personaje cuando llegues a este reto.",target:".act8geo-layout"})).filter((_,i)=>i<=retoActual)),...mission.items]} onCorrect={(item)=>{setModal(null); setRevision("pendiente"); audioSombraRef.current?.pause(); mission.beginCorrection(item);}} onRestart={reiniciar}/>

                  {GUION_SOMBRA_ERROR.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceSombraActivo
                          ? "act8geo-modal-script-line-active"
                          : indice < indiceSombraActivo
                            ? "act8geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act8geo-line-progress":
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
        <div className="act8geo-modal-overlay">
          <section
            className="act8geo-complete-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Actividad completada"
          >
            <button
              type="button"
              className="act8geo-modal-close"
              onClick={() => {
                pausarCompletado();
                setModal(null);
              }}
              aria-label="Cerrar modal"
            >
              <FiX />
            </button>

            <div className="act8geo-complete-hero">
              <img
                src={bannerCompletado}
                alt=""
                className="act8geo-complete-decoration"
                aria-hidden="true"
              />

              <VideoCanvasTransparente
                src={videoNova}
                className="act8geo-complete-video-wrap"
                canvasClassName="act8geo-complete-nova-canvas"
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
                setReinicioCompletado((valor) => valor + 1);
              }}
            />

            <div className="act8geo-complete-content"><AudioRetroalimentacion/>
              <span>🏆 Centro de Control activado</span>
              <h2>¡Centro de Control activado!</h2>

              <div className="act8geo-complete-cloud">
                <p>
                  {textoCompletado}
                  {completadoReproduciendo && (
                    <span
                      className="act8geo-typing-cursor"
                      aria-hidden="true"
                    />
                  )}
                </p>
              </div>

              <div className="act8geo-complete-controls">
                <button
                  type="button"
                  className="act8geo-complete-play"
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

              <div className="act8geo-complete-summary">
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
                  <span className="act8geo-summary-star">★</span>
                  <span>Recompensa</span>
                  <strong>+240 XP</strong>
                </article>
              </div>
            </div>

            <aside className="act8geo-complete-side">
              <div className="act8geo-complete-transcript act8geo-complete-transcript-inline">
                <h3>Texto de Nova</h3>

                <div className="act8geo-modal-script-lines">
                  {GUION_NOVA_CIERRE.map((linea, indice) => (
                    <p
                      key={linea}
                      className={
                        indice === indiceCompletadoActivo
                          ? "act8geo-modal-script-line-active"
                          : indice < indiceCompletadoActivo
                            ? "act8geo-modal-script-line-complete"
                            : ""
                      }
                      style={
                        {
                          "--act8geo-line-progress":
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

              <div className="act8geo-complete-actions">
                <button
                  type="button"
                  onClick={() => irARuta("/actividades/geometria")}
                >
                  <FiArrowRight />
                  Continuar explorando
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

export default Actividad8MathGeometry;
