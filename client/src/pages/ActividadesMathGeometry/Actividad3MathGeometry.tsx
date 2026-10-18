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
import { useAutoProgreso } from "../../hooks/useAutoProgreso";
import "./Actividad3MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividad3/act_3_banner_MathGeometry.png";
import bytePista from "../../assets/mathGeometry/actividad3/byte_pista_actividad_3.png";
import profesorConsejo from "../../assets/mathGeometry/actividad3/profesor_dando_consejo_actividad_3.png";

import audioBienvenida from "../../assets/mathGeometry/actividad3/Bienvenida_act_3_nova.mp3";
import videoNovaExplicando from "../../assets/mathGeometry/actividad3/nova_explicando_act_3_MathGeometry.mp4";
import videoProfeAstro from "../../assets/mathGeometry/actividad3/instrucciones_profe_astro_act_3_MathGeometry.mp4";
import audioProfeAstro from "../../assets/mathGeometry/actividad3/act_3_instrucciones_profe_astro_MathGeometry.mp3";
import videoSombraError from "../../assets/mathGeometry/actividad3/sombra_error_act_3_MathGeometry.mp4";
import audioSombraError from "../../assets/mathGeometry/actividad3/act_3_sombra_del_error_MathGeometry.mp3";
import videoBytePistas from "../../assets/mathGeometry/actividad3/byte_aciertos_y_pistas_act_3__MathGeometry.mp4";
import audioPistaNovaAgudo from "../../assets/mathGeometry/actividad3/act_3_nova_pista_angulo_agudo_MathGeometry.mp3";
import audioPistaProfeRecto from "../../assets/mathGeometry/actividad3/act_3_pista_angulo_recto_profe_MathGeometry.mp3";
import audioPistaByteObtuso from "../../assets/mathGeometry/actividad3/act_3_byte_pista_angulo_obtuso_MathGeometry.mp3";
import audioCierreNova from "../../assets/mathGeometry/actividad3/act_3_cierre_nova_MathGeometry.mp3";
import bannerActividadCompletada from "../../assets/mathGeometry/actividad3/actividad_completada_3_banner_MathGeometry.png";

import reto1 from "../../assets/mathGeometry/actividad3/actividad_3_puerta_1_MathGeometry.png";
import reto2 from "../../assets/mathGeometry/actividad3/actividad_3_puerta_2_MathGeometry.png";
import reto3 from "../../assets/mathGeometry/actividad3/actividad_3_puerta_3_MathGeometry.png";
import reto4 from "../../assets/mathGeometry/actividad3/actividad_3_puerta_4_MathGeometry.png";
import reto5 from "../../assets/mathGeometry/actividad3/actividad_3_puerta_5_MathGeometry.png";
import reto6 from "../../assets/mathGeometry/actividad3/actividad_3_puerta_6_MathGeometry.png";

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
  FiRefreshCw,
  FiRotateCcw,
  FiSettings,
  FiShield,
  FiTarget,
  FiUser,
  FiVolume2,
  FiX,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   TIPOS
   ========================================================= */

type AnguloId = "agudo" | "recto" | "obtuso";
type EstadoRespuesta = "pendiente" | "correcto" | "incorrecto" | "cambiando";
type EstadoExplicacion = "inicio" | "reproduciendo" | "pausado" | "terminado";
type PistaAct3Id = "agudo" | "recto" | "obtuso";
type PersonajePistaAct3 = "nova" | "profesor" | "byte";

type PistaAct3 = {
  id: PistaAct3Id;
  nombre: string;
  tituloModal: string;
  etiqueta: string;
  personaje: PersonajePistaAct3;
  audio: string;
  video: string;
  guion: string[];
};

type Reto = {
  id: number;
  imagen: string;
  respuesta: AnguloId;
  pistaByte: string;
  consejo: string;
};

type SessionUser = {
  id_usuario?: number | string;
  usuario_id?: number | string;
  id?: number | string;
  rol?: string;
  role?: string;
  tipo_usuario?: string;
  role_id?: number | string;
  roleId?: number | string;
  id_rol?: number | string;
};

/* =========================================================
   DATA DE LA ACTIVIDAD
   ========================================================= */

const RETOS: Reto[] = [
  {
    id: 1,
    imagen: reto1,
    respuesta: "agudo",
    pistaByte:
      "Observa la abertura entre el marco y la puerta. Es mucho menor que una esquina de 90°.",
    consejo:
      "La puerta está poco abierta. Cuando la abertura es menor que 90°, el ángulo es agudo.",
  },
  {
    id: 2,
    imagen: reto2,
    respuesta: "obtuso",
    pistaByte:
      "Compara la abertura con una esquina recta. Aquí la puerta se abre más allá de los 90°.",
    consejo:
      "Si la abertura es mayor que 90° y menor que 180°, se trata de un ángulo obtuso.",
  },
  {
    id: 3,
    imagen: reto3,
    respuesta: "recto",
    pistaByte:
      "El marco horizontal y la puerta vertical forman una esquina como una letra L.",
    consejo: "Una abertura exacta de 90° forma un ángulo recto.",
  },
  {
    id: 4,
    imagen: reto4,
    respuesta: "agudo",
    pistaByte:
      "La puerta está abierta, pero la abertura todavía es menor que una esquina de 90°.",
    consejo:
      "Como la abertura es menor que 90°, corresponde a un ángulo agudo.",
  },
  {
    id: 5,
    imagen: reto5,
    respuesta: "agudo",
    pistaByte:
      "Observa que la puerta forma una abertura pequeña respecto al marco horizontal.",
    consejo: "Una abertura menor que 90° es un ángulo agudo.",
  },
  {
    id: 6,
    imagen: reto6,
    respuesta: "obtuso",
    pistaByte:
      "La puerta está muy abierta hacia el lado contrario y supera claramente una esquina recta.",
    consejo:
      "La abertura es mayor que 90° y menor que 180°, por eso es un ángulo obtuso.",
  },
];

const OPCIONES: Array<{
  id: AnguloId;
  nombre: string;
  descripcion: string;
  simbolo: string;
}> = [
  {
    id: "agudo",
    nombre: "Ángulo agudo",
    descripcion: "Menor que 90°",
    simbolo: "∠",
  },
  {
    id: "recto",
    nombre: "Ángulo recto",
    descripcion: "Igual a 90°",
    simbolo: "⊥",
  },
  {
    id: "obtuso",
    nombre: "Ángulo obtuso",
    descripcion: "Mayor que 90°",
    simbolo: "⌟",
  },
];

const GUION_BIENVENIDA = [
  "¡Hola, explorador de MathNova!",
  "Hoy seremos detectores de giro.",
  "En esta misión observarás puertas abiertas en diferentes posiciones.",
  "Tu tarea será mirar la apertura de cada puerta y elegir qué tipo de ángulo forma: agudo, recto u obtuso.",
  "No necesitas medir, solo observar con atención.",
  "¡Prepara tu mirada de detective y comencemos!",
];

const TEXTO_INICIAL_BIENVENIDA =
  "Presiona iniciar para escuchar la explicación de Nova.";

const TEXTO_FINAL_BIENVENIDA = "¡Prepara tu mirada de detective y comencemos!";

const GUION_CIERRE_NOVA = [
  "¡Misión completada!",
  "Hoy aprendiste a reconocer ángulos observando la apertura de una puerta.",
  "Identificaste ángulos agudos, rectos y obtusos sin usar regla ni transportador.",
  "Cada respuesta quedó registrada como evidencia de tu avance.",
  "¡Muy buen trabajo, detector de giros! Nos vemos en la siguiente misión de MathNova.",
];

const TEXTO_INICIAL_CIERRE =
  "Presiona reproducir para escuchar el mensaje final de Nova.";

const TEXTO_FINAL_CIERRE =
  "¡Muy buen trabajo, detector de giros! Nos vemos en la siguiente misión de MathNova.";

const GUION_PROFE_ASTRO = [
  "Profesor Astro:",
  "Observa bien la apertura de la puerta.",
  "Si la puerta está poco abierta, forma un ángulo agudo.",
  "Si la puerta forma una esquina como una “L”, es un ángulo recto.",
  "Y si la puerta está más abierta que una esquina, es un ángulo obtuso.",
  "Elige la opción correcta y revisaremos juntos tu respuesta.",
];

const TEXTO_INICIAL_PROFE =
  "Presiona reproducir para escuchar la explicación del Profesor Astro.";

const TEXTO_FINAL_PROFE =
  "Elige la opción correcta y revisaremos juntos tu respuesta.";

const GUION_SOMBRA_ERROR = [
  "Sombra:",
  "Casi lo logras.",
  "Observa otra vez la puerta y fíjate si la apertura es pequeña, igual a una esquina o más grande.",
  "No pasa nada si te equivocas.",
  "En MathNova puedes intentarlo de nuevo.",
];

const TEXTO_INICIAL_SOMBRA = "Casi lo logras.";
const TEXTO_FINAL_SOMBRA = "En MathNova puedes intentarlo de nuevo.";

const PISTAS_ACT3: Record<PistaAct3Id, PistaAct3> = {
  agudo: {
    id: "agudo",
    nombre: "Ángulo agudo",
    tituloModal: "Pista para ángulo agudo",
    etiqueta: "Nova",
    personaje: "nova",
    audio: audioPistaNovaAgudo,
    video: videoNovaExplicando,
    guion: [
      "Nova:",
      "Pista espacial:",
      "Un ángulo agudo es menor que un ángulo recto.",
      "Si la puerta está poquito abierta, como si apenas comenzara a girar, puede ser un ángulo agudo.",
      "¡Observa con calma!",
    ],
  },
  recto: {
    id: "recto",
    nombre: "Ángulo recto",
    tituloModal: "Pista para ángulo recto",
    etiqueta: "Profesor Astro",
    personaje: "profesor",
    audio: audioPistaProfeRecto,
    video: videoProfeAstro,
    guion: [
      "Profesor Astro:",
      "Pista importante:",
      "Un ángulo recto forma una esquina clara, como una letra “L”.",
      "Si la puerta está abierta justo como una esquina, entonces es un ángulo recto.",
    ],
  },
  obtuso: {
    id: "obtuso",
    nombre: "Ángulo obtuso",
    tituloModal: "Pista para ángulo obtuso",
    etiqueta: "Byte",
    personaje: "byte",
    audio: audioPistaByteObtuso,
    video: videoBytePistas,
    guion: [
      "Byte:",
      "Pista de análisis:",
      "Un ángulo obtuso es mayor que un ángulo recto.",
      "Si la puerta está muy abierta, más que una esquina, probablemente sea un ángulo obtuso.",
      "¡Compara bien la apertura!",
    ],
  },
};

const ORDEN_PISTAS_ACT3: PistaAct3Id[] = ["agudo", "recto", "obtuso"];

const TEXTO_INICIAL_PISTA_ACT3 =
  "Elige una pista según el tipo de ángulo que quieras analizar.";

const VELOCIDAD_TEXTO_PISTA_ACT3 = 1.72;
const REFRESCO_TEXTO_PISTA_ACT3_MS = 38;

function obtenerEstadoGuionPistaAct3(
  tiempo: number,
  duracionAudio: number,
  guion: string[],
) {
  const duracionSegura =
    Number.isFinite(duracionAudio) && duracionAudio > 0 ? duracionAudio : 14;

  const pesos = guion.map((texto) => {
    const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
    const esTituloCorto = texto.includes(":") && palabras <= 4;

    return Math.max(
      esTituloCorto ? 0.72 : 1.05,
      palabras * 0.34 + texto.length * 0.011,
    );
  });

  const totalPesos = pesos.reduce((total, peso) => total + peso, 0) || 1;
  const duracionDisponible = Math.max(1, duracionSegura * 0.96);
  let inicioAcumulado = 0;

  for (let indice = 0; indice < guion.length; indice += 1) {
    const texto = guion[indice];
    const duracionLinea = (pesos[indice] / totalPesos) * duracionDisponible;
    const finLinea = inicioAcumulado + duracionLinea;

    if (tiempo >= inicioAcumulado && tiempo < finLinea) {
      const progresoNatural = Math.min(
        1,
        Math.max(0, (tiempo - inicioAcumulado) / duracionLinea),
      );

      const progresoTexto = Math.min(
        1,
        progresoNatural * VELOCIDAD_TEXTO_PISTA_ACT3,
      );

      const letrasVisibles = Math.max(
        1,
        Math.ceil(texto.length * progresoTexto),
      );

      return {
        texto: texto.slice(0, letrasVisibles),
        indice,
        progresoLinea: Math.round(progresoNatural * 100),
      };
    }

    inicioAcumulado = finLinea;
  }

  return {
    texto: guion[guion.length - 1],
    indice: guion.length - 1,
    progresoLinea: 100,
  };
}

function obtenerEstadoGuionSombra(tiempo: number, duracionAudio: number) {
  const duracionSegura =
    Number.isFinite(duracionAudio) && duracionAudio > 0 ? duracionAudio : 16;

  const pesos = GUION_SOMBRA_ERROR.map((texto) => {
    const palabras = texto.trim().split(/\\s+/).filter(Boolean).length;
    return Math.max(0.9, palabras * 0.34 + texto.length * 0.01);
  });

  const totalPesos = pesos.reduce((total, peso) => total + peso, 0) || 1;
  let inicioAcumulado = 0;

  for (let indice = 0; indice < GUION_SOMBRA_ERROR.length; indice += 1) {
    const texto = GUION_SOMBRA_ERROR[indice];
    const duracionLinea = (pesos[indice] / totalPesos) * duracionSegura;
    const finLinea = inicioAcumulado + duracionLinea;

    if (tiempo >= inicioAcumulado && tiempo < finLinea) {
      const progresoNatural = Math.min(
        1,
        Math.max(0, (tiempo - inicioAcumulado) / duracionLinea),
      );
      const progresoTexto = Math.min(1, progresoNatural * 1.65);
      const letrasVisibles = Math.max(
        1,
        Math.ceil(texto.length * progresoTexto),
      );

      return {
        texto: texto.slice(0, letrasVisibles),
        indice,
        progreso: Math.round(progresoNatural * 100),
      };
    }

    inicioAcumulado = finLinea;
  }

  return {
    texto: TEXTO_FINAL_SOMBRA,
    indice: GUION_SOMBRA_ERROR.length - 1,
    progreso: 100,
  };
}

function obtenerEstadoGuionProfe(tiempo: number, duracionAudio: number) {
  const duracionSegura =
    Number.isFinite(duracionAudio) && duracionAudio > 0 ? duracionAudio : 25;

  const pesos = GUION_PROFE_ASTRO.map((texto) => {
    const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, palabras * 0.36 + texto.length * 0.012);
  });

  const totalPesos = pesos.reduce((total, peso) => total + peso, 0) || 1;
  let inicioAcumulado = 0;

  for (let indice = 0; indice < GUION_PROFE_ASTRO.length; indice += 1) {
    const texto = GUION_PROFE_ASTRO[indice];
    const duracionLinea = (pesos[indice] / totalPesos) * duracionSegura;
    const finLinea = inicioAcumulado + duracionLinea;

    if (tiempo >= inicioAcumulado && tiempo < finLinea) {
      const progresoNatural = Math.min(
        1,
        Math.max(0, (tiempo - inicioAcumulado) / duracionLinea),
      );
      const progresoTexto = Math.min(1, progresoNatural * 1.45);
      const letrasVisibles = Math.max(
        1,
        Math.ceil(texto.length * progresoTexto),
      );

      return {
        texto: texto.slice(0, letrasVisibles),
        indice,
        progreso: Math.round(progresoNatural * 100),
      };
    }

    inicioAcumulado = finLinea;
  }

  return {
    texto: TEXTO_FINAL_PROFE,
    indice: GUION_PROFE_ASTRO.length - 1,
    progreso: 100,
  };
}

function obtenerTextoBienvenida(tiempo: number, duracionAudio: number) {
  const duracionSegura =
    Number.isFinite(duracionAudio) && duracionAudio > 0 ? duracionAudio : 27;

  const pesos = GUION_BIENVENIDA.map((texto) => {
    const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1.25, palabras * 0.34 + texto.length * 0.012);
  });

  const totalPesos = pesos.reduce((total, peso) => total + peso, 0) || 1;
  let inicioAcumulado = 0;

  for (let indice = 0; indice < GUION_BIENVENIDA.length; indice += 1) {
    const texto = GUION_BIENVENIDA[indice];
    const duracionLinea = (pesos[indice] / totalPesos) * duracionSegura;
    const finLinea = inicioAcumulado + duracionLinea;

    if (tiempo >= inicioAcumulado && tiempo < finLinea) {
      const progresoNatural = Math.min(
        1,
        Math.max(0, (tiempo - inicioAcumulado) / duracionLinea),
      );
      const progresoTexto = Math.min(1, progresoNatural * 1.55);
      const letrasVisibles = Math.max(
        1,
        Math.ceil(texto.length * progresoTexto),
      );

      return texto.slice(0, letrasVisibles);
    }

    inicioAcumulado = finLinea;
  }

  return TEXTO_FINAL_BIENVENIDA;
}

function obtenerEstadoGuionCierre(tiempo: number, duracionAudio: number) {
  const duracionSegura =
    Number.isFinite(duracionAudio) && duracionAudio > 0 ? duracionAudio : 28;

  const pesos = GUION_CIERRE_NOVA.map((texto) => {
    const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1.1, palabras * 0.34 + texto.length * 0.012);
  });

  const totalPesos = pesos.reduce((total, peso) => total + peso, 0) || 1;
  const duracionDisponible = Math.max(1, duracionSegura * 0.97);
  let inicioAcumulado = 0;

  for (let indice = 0; indice < GUION_CIERRE_NOVA.length; indice += 1) {
    const texto = GUION_CIERRE_NOVA[indice];
    const duracionLinea = (pesos[indice] / totalPesos) * duracionDisponible;
    const finLinea = inicioAcumulado + duracionLinea;

    if (tiempo >= inicioAcumulado && tiempo < finLinea) {
      const progresoNatural = Math.min(
        1,
        Math.max(0, (tiempo - inicioAcumulado) / duracionLinea),
      );
      const progresoTexto = Math.min(1, progresoNatural * 1.65);
      const letrasVisibles = Math.max(
        1,
        Math.ceil(texto.length * progresoTexto),
      );

      return {
        texto: texto.slice(0, letrasVisibles),
        indice,
        progreso: Math.round(progresoNatural * 100),
      };
    }

    inicioAcumulado = finLinea;
  }

  return {
    texto: TEXTO_FINAL_CIERRE,
    indice: GUION_CIERRE_NOVA.length - 1,
    progreso: 100,
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

    return (
      r > 224 &&
      g > 224 &&
      b > 224 &&
      Math.abs(r - g) < 34 &&
      Math.abs(r - b) < 34 &&
      Math.abs(g - b) < 34
    );
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

function formatearTiempo(segundos: number) {
  const minutos = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");
  const seg = (segundos % 60).toString().padStart(2, "0");

  return `${minutos}:${seg}`;
}

function Actividad3MathGeometry() {
 const mission=useMissionExpansion("mathgeometry-actividad-3");
  const navigate = useNavigate();
  const timeoutCambioRef = useRef<number | null>(null);
  const videoNovaRef = useRef<HTMLVideoElement | null>(null);
  const canvasNovaRef = useRef<HTMLCanvasElement | null>(null);
  const audioNovaRef = useRef<HTMLAudioElement | null>(null);
  const videoProfeRef = useRef<HTMLVideoElement | null>(null);
  const canvasProfeRef = useRef<HTMLCanvasElement | null>(null);
  const audioProfeRef = useRef<HTMLAudioElement | null>(null);
  const videoSombraRef = useRef<HTMLVideoElement | null>(null);
  const canvasSombraRef = useRef<HTMLCanvasElement | null>(null);
  const audioSombraRef = useRef<HTMLAudioElement | null>(null);
  const sombraTimeoutRef = useRef<number | null>(null);
  const videoPistaRef = useRef<HTMLVideoElement | null>(null);
  const canvasPistaRef = useRef<HTMLCanvasElement | null>(null);
  const audioPistaRef = useRef<HTMLAudioElement | null>(null);
  const videoCierreRef = useRef<HTMLVideoElement | null>(null);
  const canvasCierreRef = useRef<HTMLCanvasElement | null>(null);
  const audioCierreRef = useRef<HTMLAudioElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [textoBienvenida, setTextoBienvenida] = useState("");
  const [estadoExplicacion, setEstadoExplicacion] =
    useState<EstadoExplicacion>("inicio");
  const [modalProfeOpen, setModalProfeOpen] = useState(false);
  const [textoProfe, setTextoProfe] = useState("");
  const [estadoProfe, setEstadoProfe] = useState<EstadoExplicacion>("inicio");
  const [indiceProfeActivo, setIndiceProfeActivo] = useState(-1);
  const [progresoLineaProfe, setProgresoLineaProfe] = useState(0);
  const [modalSombraOpen, setModalSombraOpen] = useState(false);
  const [textoSombra, setTextoSombra] = useState("");
  const [estadoSombra, setEstadoSombra] = useState<EstadoExplicacion>("inicio");
  const [indiceSombraActivo, setIndiceSombraActivo] = useState(-1);
  const [progresoLineaSombra, setProgresoLineaSombra] = useState(0);
  const [autoPlaySombra, setAutoPlaySombra] = useState(false);
  const [modalPistasOpen, setModalPistasOpen] = useState(false);
  const [pistaSeleccionada, setPistaSeleccionada] =
    useState<PistaAct3Id>("agudo");
  const [textoPista, setTextoPista] = useState("");
  const [estadoPista, setEstadoPista] = useState<EstadoExplicacion>("inicio");
  const [indicePistaActivo, setIndicePistaActivo] = useState(-1);
  const [progresoLineaPista, setProgresoLineaPista] = useState(0);
  const [autoPlayPista, setAutoPlayPista] = useState(false);
  const [retoActual, setRetoActual] = useState(0);
  const [seleccion, setSeleccion] = useState<AnguloId | "">("");
  const [estadoRespuesta, setEstadoRespuesta] =
    useState<EstadoRespuesta>("pendiente");
  const [erroresTotales, setErroresTotales] = useState(0);
  const [modalCompletado, setModalCompletado] = useState(false);
  const [textoCierre, setTextoCierre] = useState("");
  const [estadoCierre, setEstadoCierre] = useState<EstadoExplicacion>("inicio");
  const [indiceCierreActivo, setIndiceCierreActivo] = useState(-1);
  const [progresoLineaCierre, setProgresoLineaCierre] = useState(0);
  const [autoPlayCierre, setAutoPlayCierre] = useState(false);
  const [segundos, setSegundos] = useState(0);

  const reto = RETOS[retoActual];
  const pistaActiva = PISTAS_ACT3[pistaSeleccionada];

  const retosCompletados = modalCompletado
    ? RETOS.length
    : estadoRespuesta === "correcto" || estadoRespuesta === "cambiando"
      ? retoActual + 1
      : retoActual;

  const progreso = Math.round((retosCompletados / RETOS.length) * 100);
  const xpGanado = 40 + retosCompletados * 16;
  const cristales = retosCompletados * 3;

  const pilot=useGeometryEvidence("mathgeometry-actividad-3",mission,()=>({
      retos_completados: retosCompletados,
      errores_totales: erroresTotales,
    }));

  useAutoProgreso({
    completada: modalCompletado,
    codigo: "mathgeometry-actividad-3",
    mundo: "MathGeometry",
    tema: "Ángulos: agudo, recto y obtuso",
    titulo: "Detectores de Giro",
    aciertos: RETOS.length + mission.correctCount,
    totalPreguntas: mission.total,
    tiempoSegundos: segundos,
    xpBase: 120,
    respuestas: pilot.evidence(),
  });

  const textoEstado = useMemo(() => {
    if (estadoRespuesta === "correcto" || estadoRespuesta === "cambiando") {
      return "Respuesta correcta";
    }

    if (estadoRespuesta === "incorrecto") {
      return "Inténtalo otra vez";
    }

    return "Elige una opción";
  }, [estadoRespuesta]);

  useEffect(() => {
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    if (!audio) return;

    const terminarExplicacion = () => {
      setEstadoExplicacion("terminado");
      setTextoBienvenida(TEXTO_FINAL_BIENVENIDA);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarExplicacion);
    return () => audio.removeEventListener("ended", terminarExplicacion);
  }, []);

  useEffect(() => {
    if (estadoExplicacion !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioNovaRef.current;
      if (!audio) return;

      setTextoBienvenida(
        obtenerTextoBienvenida(audio.currentTime, audio.duration),
      );
    }, 30);

    return () => window.clearInterval(intervalo);
  }, [estadoExplicacion]);

  useEffect(() => {
    const video = videoNovaRef.current;
    const canvas = canvasNovaRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const canvasWidth = 360;
    const canvasHeight = 640;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujar = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujar);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujar);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    if (!modalPistasOpen || !pistaActiva) return;

    const audio = audioPistaRef.current;
    const video = videoPistaRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.load();
    }

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.load();
    }

    setTextoPista("");
    setEstadoPista("inicio");
    setIndicePistaActivo(-1);
    setProgresoLineaPista(0);
  }, [modalPistasOpen, pistaActiva]);

  useEffect(() => {
    if (!modalPistasOpen || !pistaActiva) return;

    const audio = audioPistaRef.current;
    const video = videoPistaRef.current;
    if (!audio) return;

    const terminarPista = () => {
      setEstadoPista("terminado");
      setTextoPista(pistaActiva.guion[pistaActiva.guion.length - 1]);
      setIndicePistaActivo(pistaActiva.guion.length - 1);
      setProgresoLineaPista(100);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarPista);

    return () => {
      audio.removeEventListener("ended", terminarPista);
    };
  }, [modalPistasOpen, pistaActiva]);

  useEffect(() => {
    if (!modalPistasOpen || estadoPista !== "reproduciendo" || !pistaActiva) {
      return;
    }

    const intervalo = window.setInterval(() => {
      const audio = audioPistaRef.current;
      if (!audio) return;

      const estadoGuion = obtenerEstadoGuionPistaAct3(
        audio.currentTime,
        audio.duration,
        pistaActiva.guion,
      );

      setTextoPista(estadoGuion.texto);
      setIndicePistaActivo(estadoGuion.indice);
      setProgresoLineaPista(estadoGuion.progresoLinea);
    }, REFRESCO_TEXTO_PISTA_ACT3_MS);

    return () => window.clearInterval(intervalo);
  }, [modalPistasOpen, estadoPista, pistaActiva]);

  useEffect(() => {
    if (!modalPistasOpen || !pistaActiva) return;

    const video = videoPistaRef.current;
    const canvas = canvasPistaRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const canvasWidth = 360;
    const canvasHeight = 640;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujarPista = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarPista);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarPista);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalPistasOpen, pistaActiva]);

  useEffect(() => {
    if (!modalPistasOpen || !autoPlayPista || !pistaActiva) return;

    const timeout = window.setTimeout(() => {
      setAutoPlayPista(false);
      iniciarPista();
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [modalPistasOpen, autoPlayPista, pistaActiva]);

  useEffect(() => {
    if (!modalProfeOpen) return;

    const audio = audioProfeRef.current;
    const video = videoProfeRef.current;
    if (!audio) return;

    const terminarExplicacionProfe = () => {
      setEstadoProfe("terminado");
      setTextoProfe(TEXTO_FINAL_PROFE);
      setIndiceProfeActivo(GUION_PROFE_ASTRO.length - 1);
      setProgresoLineaProfe(100);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarExplicacionProfe);

    return () => {
      audio.removeEventListener("ended", terminarExplicacionProfe);
    };
  }, [modalProfeOpen]);

  useEffect(() => {
    if (!modalProfeOpen || estadoProfe !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioProfeRef.current;
      if (!audio) return;

      const estado = obtenerEstadoGuionProfe(audio.currentTime, audio.duration);

      setTextoProfe(estado.texto);
      setIndiceProfeActivo(estado.indice);
      setProgresoLineaProfe(estado.progreso);
    }, 30);

    return () => window.clearInterval(intervalo);
  }, [modalProfeOpen, estadoProfe]);

  useEffect(() => {
    if (!modalProfeOpen) return;

    const video = videoProfeRef.current;
    const canvas = canvasProfeRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const canvasWidth = 360;
    const canvasHeight = 640;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujar = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujar);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujar);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalProfeOpen]);

  useEffect(() => {
    if (!modalSombraOpen) return;

    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;
    if (!audio) return;

    const terminarSombra = () => {
      setEstadoSombra("terminado");
      setTextoSombra(TEXTO_FINAL_SOMBRA);
      setIndiceSombraActivo(GUION_SOMBRA_ERROR.length - 1);
      setProgresoLineaSombra(100);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarSombra);

    return () => {
      audio.removeEventListener("ended", terminarSombra);
    };
  }, [modalSombraOpen]);

  useEffect(() => {
    if (!modalSombraOpen || estadoSombra !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioSombraRef.current;
      if (!audio) return;

      const estado = obtenerEstadoGuionSombra(
        audio.currentTime,
        audio.duration,
      );

      setTextoSombra(estado.texto);
      setIndiceSombraActivo(estado.indice);
      setProgresoLineaSombra(estado.progreso);
    }, 35);

    return () => window.clearInterval(intervalo);
  }, [modalSombraOpen, estadoSombra]);

  useEffect(() => {
    if (!modalSombraOpen) return;

    const video = videoSombraRef.current;
    const canvas = canvasSombraRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const canvasWidth = 300;
    const canvasHeight = 533;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujar = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 40 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujar);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujar);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalSombraOpen]);

  useEffect(() => {
    if (!modalSombraOpen || !autoPlaySombra) return;

    const timeout = window.setTimeout(() => {
      setAutoPlaySombra(false);
      iniciarSombra();
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [modalSombraOpen, autoPlaySombra]);

  useEffect(() => {
    if (!modalCompletado) return;

    const audio = audioCierreRef.current;
    const video = videoCierreRef.current;
    if (!audio) return;

    const terminarCierre = () => {
      setEstadoCierre("terminado");
      setTextoCierre(TEXTO_FINAL_CIERRE);
      setIndiceCierreActivo(GUION_CIERRE_NOVA.length - 1);
      setProgresoLineaCierre(100);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarCierre);
    return () => audio.removeEventListener("ended", terminarCierre);
  }, [modalCompletado]);

  useEffect(() => {
    if (!modalCompletado || estadoCierre !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioCierreRef.current;
      if (!audio) return;

      const estado = obtenerEstadoGuionCierre(
        audio.currentTime,
        audio.duration,
      );

      setTextoCierre(estado.texto);
      setIndiceCierreActivo(estado.indice);
      setProgresoLineaCierre(estado.progreso);
    }, 35);

    return () => window.clearInterval(intervalo);
  }, [modalCompletado, estadoCierre]);

  useEffect(() => {
    if (!modalCompletado) return;

    const video = videoCierreRef.current;
    const canvas = canvasCierreRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const canvasWidth = 360;
    const canvasHeight = 640;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujar = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujar);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujar);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalCompletado]);

  useEffect(() => {
    if (!modalCompletado || !autoPlayCierre) return;

    const timeout = window.setTimeout(() => {
      setAutoPlayCierre(false);
      void reproducirCierre();
    }, 140);

    return () => window.clearTimeout(timeout);
  }, [modalCompletado, autoPlayCierre]);

  useEffect(() => {
    if (
      pausado ||
      modalCompletado ||
      modalProfeOpen ||
      modalSombraOpen ||
      modalPistasOpen
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setSegundos((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    pausado,
    modalCompletado,
    modalProfeOpen,
    modalSombraOpen,
    modalPistasOpen,
  ]);

  useEffect(() => {
    const bloquearPantalla =
      menuOpen ||
      modalCompletado ||
      modalProfeOpen ||
      modalSombraOpen ||
      modalPistasOpen;
    const anchoScrollbar =
      window.innerWidth - document.documentElement.clientWidth;

    if (bloquearPantalla) {
      document.body.classList.add("act3geo-body-locked");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${Math.max(anchoScrollbar, 0)}px`;
    } else {
      document.body.classList.remove("act3geo-body-locked");
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.classList.remove("act3geo-body-locked");
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
    };
  }, [
    menuOpen,
    modalCompletado,
    modalProfeOpen,
    modalSombraOpen,
    modalPistasOpen,
  ]);

  useEffect(() => {
    return () => {
      if (timeoutCambioRef.current) {
        window.clearTimeout(timeoutCambioRef.current);
      }

      if (sombraTimeoutRef.current) {
        window.clearTimeout(sombraTimeoutRef.current);
      }
    };
  }, []);

  const iniciarExplicacion = async () => {
    if (pausado) return;
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;
    if (!audio || !video) return;

    try {
      if (estadoExplicacion === "terminado") {
        audio.currentTime = 0;
        video.currentTime = 0;
        setTextoBienvenida("");
      }

      await Promise.all([audio.play(), video.play()]);
      setEstadoExplicacion("reproduciendo");
    } catch (error) {
      console.error("No se pudo reproducir la explicación de Nova:", error);
    }
  };

  const pausarExplicacion = () => {
    audioNovaRef.current?.pause();
    videoNovaRef.current?.pause();
    setEstadoExplicacion("pausado");
  };

  const repetirExplicacion = async () => {
    if (pausado) return;
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;
    if (!audio || !video) return;

    audio.pause();
    video.pause();
    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoBienvenida("");

    try {
      await Promise.all([audio.play(), video.play()]);
      setEstadoExplicacion("reproduciendo");
    } catch (error) {
      console.error("No se pudo repetir la explicación de Nova:", error);
    }
  };

  const abrirModalPistas = () => {
    setPistaSeleccionada("agudo");
    setModalPistasOpen(true);
    setTextoPista("");
    setEstadoPista("inicio");
    setIndicePistaActivo(-1);
    setProgresoLineaPista(0);
    setAutoPlayPista(false);
  };

  const cerrarModalPistas = () => {
    audioPistaRef.current?.pause();
    videoPistaRef.current?.pause();

    if (audioPistaRef.current) {
      audioPistaRef.current.currentTime = 0;
    }

    if (videoPistaRef.current) {
      videoPistaRef.current.currentTime = 0;
    }

    setModalPistasOpen(false);
    setTextoPista("");
    setEstadoPista("inicio");
    setIndicePistaActivo(-1);
    setProgresoLineaPista(0);
    setAutoPlayPista(false);
  };

  const seleccionarPista = (id: PistaAct3Id) => {
    audioPistaRef.current?.pause();
    videoPistaRef.current?.pause();

    setPistaSeleccionada(id);
    setTextoPista("");
    setEstadoPista("inicio");
    setIndicePistaActivo(-1);
    setProgresoLineaPista(0);
    setAutoPlayPista(true);
  };

  const iniciarPista = async () => {
    if (pausado) return;
    const audio = audioPistaRef.current;
    const video = videoPistaRef.current;
    if (!audio || !video) return;

    if (estadoPista === "terminado") {
      audio.currentTime = 0;
      video.currentTime = 0;
      setTextoPista("");
      setIndicePistaActivo(-1);
      setProgresoLineaPista(0);
    }

    try {
      await Promise.all([audio.play(), video.play()]);
      setEstadoPista("reproduciendo");
    } catch (error) {
      console.error("No se pudo reproducir la pista:", error);
    }
  };

  const pausarPista = () => {
    audioPistaRef.current?.pause();
    videoPistaRef.current?.pause();
    setEstadoPista("pausado");
  };

  const reiniciarPista = async () => {
    if (pausado) return;
    const audio = audioPistaRef.current;
    const video = videoPistaRef.current;
    if (!audio || !video) return;

    audio.pause();
    video.pause();
    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoPista("");
    setIndicePistaActivo(-1);
    setProgresoLineaPista(0);

    try {
      await Promise.all([audio.play(), video.play()]);
      setEstadoPista("reproduciendo");
    } catch (error) {
      console.error("No se pudo reiniciar la pista:", error);
    }
  };

  const cerrarModalSombra = () => {
    audioSombraRef.current?.pause();
    videoSombraRef.current?.pause();

    if (audioSombraRef.current) audioSombraRef.current.currentTime = 0;
    if (videoSombraRef.current) videoSombraRef.current.currentTime = 0;

    setModalSombraOpen(false);
    setTextoSombra("");
    setEstadoSombra("inicio");
    setIndiceSombraActivo(-1);
    setProgresoLineaSombra(0);
    setAutoPlaySombra(false);
  };

  const iniciarSombra = async () => {
    if (pausado) return;
    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;
    if (!audio || !video) return;

    if (estadoSombra === "terminado") {
      audio.currentTime = 0;
      video.currentTime = 0;
      setTextoSombra("");
      setIndiceSombraActivo(-1);
      setProgresoLineaSombra(0);
    }

    try {
      await Promise.all([audio.play(), video.play()]);
      setEstadoSombra("reproduciendo");
    } catch (error) {
      console.error("No se pudo reproducir el mensaje de Sombra:", error);
    }
  };

  const pausarSombra = () => {
    audioSombraRef.current?.pause();
    videoSombraRef.current?.pause();
    setEstadoSombra("pausado");
  };

  const repetirSombra = async () => {
    if (pausado) return;
    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;
    if (!audio || !video) return;

    audio.pause();
    video.pause();
    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoSombra("");
    setIndiceSombraActivo(-1);
    setProgresoLineaSombra(0);

    try {
      await Promise.all([audio.play(), video.play()]);
      setEstadoSombra("reproduciendo");
    } catch (error) {
      console.error("No se pudo reiniciar el mensaje de Sombra:", error);
    }
  };

  const abrirModalSombra = () => {
    setModalSombraOpen(true);
    setTextoSombra("");
    setEstadoSombra("inicio");
    setIndiceSombraActivo(-1);
    setProgresoLineaSombra(0);
    setAutoPlaySombra(true);
  };

  const volverAIntentarlo = () => {
    cerrarModalSombra();
    setEstadoRespuesta("pendiente");
  
 mission.beginCorrection();
};

  const abrirModalProfe = () => {
    setModalProfeOpen(true);
    setTextoProfe("");
    setEstadoProfe("inicio");
    setIndiceProfeActivo(-1);
    setProgresoLineaProfe(0);
  };

  const cerrarModalProfe = () => {
    audioProfeRef.current?.pause();
    videoProfeRef.current?.pause();

    if (audioProfeRef.current) {
      audioProfeRef.current.currentTime = 0;
    }

    if (videoProfeRef.current) {
      videoProfeRef.current.currentTime = 0;
    }

    setModalProfeOpen(false);
    setTextoProfe("");
    setEstadoProfe("inicio");
    setIndiceProfeActivo(-1);
    setProgresoLineaProfe(0);
  };

  const reproducirProfe = async () => {
    if (pausado) return;
    const audio = audioProfeRef.current;
    const video = videoProfeRef.current;
    if (!audio || !video) return;

    if (estadoProfe === "terminado") {
      audio.currentTime = 0;
      video.currentTime = 0;
      setTextoProfe("");
      setIndiceProfeActivo(-1);
      setProgresoLineaProfe(0);
    }

    try {
      await Promise.all([audio.play(), video.play()]);
      setEstadoProfe("reproduciendo");
    } catch (error) {
      console.error("No se pudo reproducir al Profesor Astro:", error);
    }
  };

  const pausarProfe = () => {
    audioProfeRef.current?.pause();
    videoProfeRef.current?.pause();
    setEstadoProfe("pausado");
  };

  const reiniciarProfe = async () => {
    if (pausado) return;
    const audio = audioProfeRef.current;
    const video = videoProfeRef.current;
    if (!audio || !video) return;

    audio.pause();
    video.pause();
    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoProfe("");
    setIndiceProfeActivo(-1);
    setProgresoLineaProfe(0);

    try {
      await Promise.all([audio.play(), video.play()]);
      setEstadoProfe("reproduciendo");
    } catch (error) {
      console.error("No se pudo reiniciar al Profesor Astro:", error);
    }
  };

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
    if (timeoutCambioRef.current) {
      window.clearTimeout(timeoutCambioRef.current);
    }

    setMenuOpen(false);
    navigate(ruta);
  };

  const pasarAlSiguienteReto = () => {
    if (pausado) return;

    if (retoActual + 1 >= RETOS.length) {
      setTextoCierre("");
      setEstadoCierre("inicio");
      setIndiceCierreActivo(-1);
      setProgresoLineaCierre(0);
      mission.finishNative();
      if(mission.ready && mission.allCorrect) setModalCompletado(true); else mission.review();
      setAutoPlayCierre(true);
      return;
    }

    setRetoActual((prev) => prev + 1);
    setSeleccion("");
    setEstadoRespuesta("pendiente");
  };

  const comprobarRespuesta = () => {
    if (pausado) return;

    if (!seleccion || estadoRespuesta === "cambiando") {
      setEstadoRespuesta("incorrecto");

      if (!seleccion) {
        abrirModalSombra();
      }

      return;
    }

    pilot.recordNative(retoActual,seleccion);

    if (seleccion === reto.respuesta) {
      setEstadoRespuesta("correcto");

      timeoutCambioRef.current = window.setTimeout(() => {
        setEstadoRespuesta("cambiando");

        timeoutCambioRef.current = window.setTimeout(() => {
          pasarAlSiguienteReto();
        }, 380);
      }, 850);

      return;
    }

    setErroresTotales((prev) => prev + 1);
    setEstadoRespuesta("incorrecto");
    abrirModalSombra();
  };

  const reproducirCierre = async () => {
    if (pausado) return;
    const audio = audioCierreRef.current;
    const video = videoCierreRef.current;
    if (!audio || !video) return;

    if (estadoCierre === "terminado") {
      audio.currentTime = 0;
      video.currentTime = 0;
      setTextoCierre("");
      setIndiceCierreActivo(-1);
      setProgresoLineaCierre(0);
    }

    try {
      await Promise.all([audio.play(), video.play()]);
      setEstadoCierre("reproduciendo");
    } catch (error) {
      console.error("No se pudo reproducir el cierre de Nova:", error);
    }
  };

  const pausarCierre = () => {
    audioCierreRef.current?.pause();
    videoCierreRef.current?.pause();
    setEstadoCierre("pausado");
  };

  const reiniciarCierre = async () => {
    const audio = audioCierreRef.current;
    const video = videoCierreRef.current;
    if (!audio || !video) return;

    audio.pause();
    video.pause();
    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoCierre("");
    setIndiceCierreActivo(-1);
    setProgresoLineaCierre(0);

    try {
      await Promise.all([audio.play(), video.play()]);
      setEstadoCierre("reproduciendo");
    } catch (error) {
      console.error("No se pudo reiniciar el cierre de Nova:", error);
    }
  };

  const detenerCierre = () => {
    audioCierreRef.current?.pause();
    videoCierreRef.current?.pause();

    if (audioCierreRef.current) audioCierreRef.current.currentTime = 0;
    if (videoCierreRef.current) videoCierreRef.current.currentTime = 0;

    setTextoCierre("");
    setEstadoCierre("inicio");
    setIndiceCierreActivo(-1);
    setProgresoLineaCierre(0);
    setAutoPlayCierre(false);
  };

  const reiniciarActividad = () => {
    mission.reset();
    pilot.resetSession();
    if (timeoutCambioRef.current) {
      window.clearTimeout(timeoutCambioRef.current);
    }

    setRetoActual(0);
    setSeleccion("");
    setEstadoRespuesta("pendiente");
    setErroresTotales(0);
    detenerCierre();
    setModalCompletado(false);
    setSegundos(0);
  };

  const cerrarModalCompletado = () => {
    detenerCierre();
    setModalCompletado(false);
  };

  const pausarTodo = () => {
    pausarExplicacion();
    pausarPista();
    pausarProfe();
    pausarSombra();
    pausarCierre();

    if (timeoutCambioRef.current) {
      window.clearTimeout(timeoutCambioRef.current);
      timeoutCambioRef.current = null;
    }
  };

  const alternarPausaActividad = () => {
    if (pausado) {
      setPausado(false);
      return;
    }

    pausarTodo();
    setPausado(true);
  };

  return (
    <main
      className={`act3geo-page mn-activity ${pausado ? "act3geo-activity-paused" : ""}`}
    >
      <button
        type="button"
        className={`act3geo-hamburger-btn ${
          menuOpen ? "act3geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="act3geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`act3geo-sidebar ${menuOpen ? "act3geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act3geo-sidebar-logo" />

        <nav className="act3geo-sidebar-menu">
          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta(obtenerDashboardPrincipal())}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item act3geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="act3geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mn-sidebar-mission"><span>Tu misión</span><strong>{activityCurriculum["mathgeometry-actividad-3"].objective}</strong></div>
      </aside>

      <section className="act3geo-content">
        <img src={heroBanner} alt="Banner Actividad 3" className="act3geo-bg" />

        <section className="act3geo-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathgeometry-actividad-3"]} />
        


          <header className="act3geo-topbar">
            <div className="act3geo-title-area">
              <div className="act3geo-pills">
                <span>▣ Introducción</span>
                <span>◉ 8–12 min</span>
              </div>

              <h1>Actividad 3 Detectores de Giro</h1>

              <p className="act3geo-subtitle">
                Observa la apertura de la puerta y selecciona si el ángulo es
                agudo, recto u obtuso.
              </p>
            </div>

            <div className="act3geo-actions-top">
              <button type="button" onClick={alternarPausaActividad}>
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
            className={`act3geo-nova-row ${
              estadoExplicacion === "reproduciendo"
                ? "act3geo-nova-playing"
                : ""
            }`}
            aria-label="Explicación animada de Nova"
          >
            <div className="act3geo-nova-stage">
              <video
                ref={videoNovaRef}
                src={videoNovaExplicando}
                className="act3geo-nova-source-video"
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
              />

              <canvas
                ref={canvasNovaRef}
                className="act3geo-nova-canvas"
                role="img"
                aria-label="Nova explicando la actividad"
              />

              <span className="act3geo-nova-glow" aria-hidden="true" />
            </div>

            <article className="act3geo-speech-cloud">
              <div className="act3geo-speech-main">
                <span className="act3geo-cloud-label">
                  <FiVolume2 /> Nova te explica
                </span>

                <p>
                  {textoBienvenida ||
                    (estadoExplicacion === "terminado"
                      ? TEXTO_FINAL_BIENVENIDA
                      : TEXTO_INICIAL_BIENVENIDA)}

                  {estadoExplicacion === "reproduciendo" && (
                    <span className="act3geo-typing-cursor" />
                  )}
                </p>
              </div>

              <div
                className="act3geo-nova-controls"
                aria-label="Controles de audio de Nova"
              >
                <button
                  type="button"
                  className="act3geo-nova-control-btn act3geo-nova-control-play"
                  onClick={iniciarExplicacion}
                  aria-label="Reproducir explicación"
                  title="Reproducir"
                  disabled={estadoExplicacion === "reproduciendo"}
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  className="act3geo-nova-control-btn act3geo-nova-control-pause"
                  onClick={pausarExplicacion}
                  aria-label="Pausar explicación"
                  title="Pausar"
                  disabled={estadoExplicacion !== "reproduciendo"}
                >
                  <FiPause />
                </button>

                <button
                  type="button"
                  className="act3geo-nova-control-btn act3geo-nova-control-repeat"
                  onClick={repetirExplicacion}
                  aria-label="Repetir explicación"
                  title="Repetir"
                >
                  <FiRotateCcw />
                </button>
              </div>
            </article>

            <audio ref={audioNovaRef} src={audioBienvenida} preload="auto" />
          </section>

          <EnsayoOtrosMundos activityId="mathgeometry-actividad-3"/>
<section className="act3geo-layout">
            <article
              className={`act3geo-board ${
                estadoRespuesta === "cambiando" ? "act3geo-board-changing" : ""
              }`}
            >
              <div className="act3geo-board-head">
                <h2>
                  <FiFlag /> Reto {retoActual + 1} de {RETOS.length}
                </h2>

                <span
                  className={`act3geo-status-pill act3geo-status-${estadoRespuesta}`}
                >
                  {textoEstado}
                </span>
              </div>

              <section
                className="act3geo-progress-card act3geo-progress-card-inside"
                aria-label="Progreso del reto"
              >
                <div className="act3geo-progress-copy">
                  <strong>Progreso</strong>
                  <span>{progreso}% completado</span>
                </div>

                <div className="act3geo-progress-track">
                  <b style={{ width: `${progreso}%` }}></b>
                </div>
              </section>

              <div className="act3geo-door-stage">
                {pausado && (
                  <div className="act3geo-pause-layer">
                    <FiPause />
                    <strong>Actividad pausada</strong>
                    <span>Presiona Continuar para seguir.</span>
                  </div>
                )}

                <img
                  src={reto.imagen}
                  alt={`Puerta del reto ${reto.id}`}
                  className="act3geo-door-img"
                />
              </div>

              <div className="act3geo-question-row">
                <strong>Elige el tipo de ángulo:</strong>
              </div>

              <div className="act3geo-options">
                {OPCIONES.map((opcion) => {
                  const seleccionada = seleccion === opcion.id;
                  const esCorrecta =
                    (estadoRespuesta === "correcto" ||
                      estadoRespuesta === "cambiando") &&
                    opcion.id === reto.respuesta;
                  const esIncorrecta =
                    estadoRespuesta === "incorrecto" &&
                    seleccionada &&
                    opcion.id !== reto.respuesta;

                  return (
                    <button
                      type="button"
                      key={opcion.id}
                      className={`act3geo-option act3geo-option-${opcion.id} ${
                        seleccionada ? "act3geo-option-selected" : ""
                      } ${esCorrecta ? "act3geo-option-correct" : ""} ${
                        esIncorrecta ? "act3geo-option-wrong" : ""
                      }`}
                      onClick={() => {
                        if (pausado || estadoRespuesta === "cambiando") return;
                        setSeleccion(opcion.id);
                        setEstadoRespuesta("pendiente");
                      }}
                      disabled={pausado}
                    >
                      <span className="act3geo-angle-icon">
                        {opcion.simbolo}
                      </span>

                      <span className="act3geo-option-text">
                        <strong>{opcion.nombre}</strong>
                        <small>{opcion.descripcion}</small>
                      </span>

                      {esCorrecta && (
                        <FiCheck className="act3geo-option-check" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="act3geo-actions-row">
                <button
                  type="button"
                  className="act3geo-check-btn"
                  onClick={comprobarRespuesta}
                  disabled={pausado}
                >
                  <FiCheck /> Comprobar
                </button>

                <div
                  className={`act3geo-result-box act3geo-result-${estadoRespuesta}`}
                >
                  {estadoRespuesta === "correcto" ||
                  estadoRespuesta === "cambiando" ? (
                    <>
                      <FiCheck /> Respuesta correcta
                    </>
                  ) : estadoRespuesta === "incorrecto" ? (
                    <>
                      <FiX /> Revisa la apertura
                    </>
                  ) : (
                    <>
                      <FiTarget /> Selecciona una respuesta
                    </>
                  )}
                </div>
              </div>
            </article>

            <aside className="act3geo-right-panel">
              <article
                className="act3geo-tip-card act3geo-byte-card act3geo-open-pistas-card act3geo-assistant-card"
                role="button"
                tabIndex={0}
                onClick={() => !pausado && abrirModalPistas()}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    if (!pausado) abrirModalPistas();
                  }
                }}
              >
                <div className="act3geo-tip-img-box act3geo-byte-img-box">
                  <img src={bytePista} alt="Byte dando pistas" />
                </div>

                <div className="act3geo-open-pistas-info">
                  <h3>Pista de Byte</h3>
                  <p>Elige una pista según el tipo de ángulo.</p>

                  <button
                    type="button"
                    className="act3geo-open-pistas-btn"
                    onClick={(evento) => {
                      evento.stopPropagation();
                      abrirModalPistas();
                    }}
                  >
                    <FiPlay /> Ver pista
                  </button>
                </div>
              </article>

              <article
                className="act3geo-tip-card act3geo-profe-card act3geo-profe-open-card act3geo-assistant-card"
                role="button"
                tabIndex={0}
                onClick={() => !pausado && abrirModalProfe()}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    abrirModalProfe();
                  }
                }}
              >
                <div className="act3geo-profe-card-avatar">
                  <img
                    src={profesorConsejo}
                    alt="Profesor Astro dando consejo"
                    className="act3geo-profe-img"
                  />
                </div>

                <div className="act3geo-profe-card-info">
                  <h3>Profesor Astro</h3>
                  <p>Observa bien la apertura de la puerta antes de elegir.</p>

                  <button
                    type="button"
                    className="act3geo-profe-open-btn"
                    onClick={(evento) => {
                      evento.stopPropagation();
                      abrirModalProfe();
                    }}
                  >
                    <FiPlay /> Ver explicación
                  </button>
                </div>
              </article>

              <section
                className="act3geo-side-stats"
                aria-label="Resumen de actividad"
              >
                <article>
                  <FiFlag />
                  <div>
                    <span>Retos</span>
                    <strong>
                      {retosCompletados}/{RETOS.length}
                    </strong>
                  </div>
                </article>

                <article>
                  <FiClock />
                  <div>
                    <span>Tiempo</span>
                    <strong>{formatearTiempo(segundos)}</strong>
                  </div>
                </article>

                <article>
                  <span className="act3geo-star">★</span>
                  <div>
                    <span>XP</span>
                    <strong>{xpGanado}</strong>
                  </div>
                </article>

                <article>
                  <span className="act3geo-gem">◆</span>
                  <div>
                    <span>Cristales</span>
                    <strong>{cristales}</strong>
                  </div>
                </article>

                <article>
                  <FiShield />
                  <div>
                    <span>Errores</span>
                    <strong>{erroresTotales}</strong>
                  </div>
                </article>
              </section>
            </aside>
          </section>
 

        <PilotEvidenceStatus pilot={pilot}/>
        <ContinuacionDeMision expansion={mission} onComplete={()=>{setModalCompletado(true);}} onRestart={reiniciarActividad}/>
</section>

        {modalPistasOpen && (
          <div
            className="act3geo-pistas-modal-overlay"
            onClick={cerrarModalPistas}
          >
            <section
              className={`act3geo-pistas-modal act3geo-pistas-modal-${pistaActiva.personaje} ${
                estadoPista === "reproduciendo"
                  ? "act3geo-pistas-modal-playing"
                  : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act3geo-pistas-title"
            >
              <button
                type="button"
                className="act3geo-pistas-close"
                onClick={cerrarModalPistas}
                aria-label="Cerrar pistas"
              >
                <FiX />
              </button>

              <div className="act3geo-pistas-hero">
                <video
                  key={pistaActiva.id}
                  ref={videoPistaRef}
                  src={pistaActiva.video}
                  className="act3geo-pistas-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasPistaRef}
                  className="act3geo-pistas-canvas"
                  role="img"
                  aria-label={`${pistaActiva.etiqueta} dando una pista`}
                />

                <span className="act3geo-pistas-orbit" aria-hidden="true" />
              </div>

              <div className="act3geo-pistas-content">
                <span className="act3geo-pistas-badge">
                  <FiVolume2 /> {pistaActiva.etiqueta}
                </span>

                <h2 id="act3geo-pistas-title">{pistaActiva.tituloModal}</h2>

                <div className="act3geo-pistas-cloud">
                  <span className="act3geo-pistas-cloud-dot act3geo-pistas-cloud-dot-one" />
                  <span className="act3geo-pistas-cloud-dot act3geo-pistas-cloud-dot-two" />

                  <p>
                    {textoPista || TEXTO_INICIAL_PISTA_ACT3}
                    {estadoPista === "reproduciendo" && (
                      <span className="act3geo-pistas-cursor" />
                    )}
                  </p>
                </div>

                <div className="act3geo-pistas-controls">
                  <button
                    type="button"
                    className="act3geo-pistas-play"
                    onClick={iniciarPista}
                    disabled={estadoPista === "reproduciendo"}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button
                    type="button"
                    onClick={pausarPista}
                    disabled={estadoPista !== "reproduciendo"}
                  >
                    <FiPause /> Pausar
                  </button>

                  <button type="button" onClick={reiniciarPista}>
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>
              </div>

              <aside className="act3geo-pistas-panel">
                <h3>Elige una pista</h3>

                <div className="act3geo-pistas-options">
                  {ORDEN_PISTAS_ACT3.map((id) => {
                    const pista = PISTAS_ACT3[id];

                    return (
                      <button
                        type="button"
                        key={id}
                        className={`act3geo-pistas-option ${
                          pistaSeleccionada === id
                            ? "act3geo-pistas-option-active"
                            : ""
                        }`}
                        onClick={() => seleccionarPista(id)}
                      >
                        <span>{pista.etiqueta}</span>
                        <strong>{pista.nombre}</strong>
                      </button>
                    );
                  })}
                </div>

                <div className="act3geo-pistas-transcript">
                  <h3>Texto de la pista</h3>

                  {pistaActiva.guion.map((linea, indice) => (
                    <p
                      key={`${pistaActiva.id}-${linea}-${indice}`}
                      className={
                        indice < indicePistaActivo
                          ? "act3geo-clue-line-done"
                          : indice === indicePistaActivo
                            ? "act3geo-clue-line-active"
                            : "act3geo-clue-line-pending"
                      }
                      style={
                        {
                          "--progreso-linea":
                            indice < indicePistaActivo
                              ? "100%"
                              : indice === indicePistaActivo
                                ? `${progresoLineaPista}%`
                                : "0%",
                        } as Record<string, string>
                      }
                    >
                      {linea}
                    </p>
                  ))}
                </div>
              </aside>

              <audio
                key={pistaActiva.audio}
                ref={audioPistaRef}
                src={pistaActiva.audio}
                preload="auto"
              />
            </section>
          </div>
        )}

        {modalSombraOpen && (
          <div
            className="act3geo-sombra-modal-overlay"
            onClick={cerrarModalSombra}
          >
            <section
              className={`act3geo-sombra-modal ${
                estadoSombra === "reproduciendo"
                  ? "act3geo-sombra-modal-playing"
                  : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act3geo-sombra-title"
            >
              <div className="act3geo-sombra-decoration" aria-hidden="true">
                <span className="act3geo-sombra-glow act3geo-sombra-glow-one" />
                <span className="act3geo-sombra-glow act3geo-sombra-glow-two" />
                <span className="act3geo-sombra-dot act3geo-sombra-dot-one" />
                <span className="act3geo-sombra-dot act3geo-sombra-dot-two" />
                <span className="act3geo-sombra-dot act3geo-sombra-dot-three" />
              </div>

              <button
                type="button"
                className="act3geo-sombra-close"
                onClick={cerrarModalSombra}
                aria-label="Cerrar mensaje de Sombra"
              >
                <FiX />
              </button>

              <div className="act3geo-sombra-hero">
                <video
                  ref={videoSombraRef}
                  src={videoSombraError}
                  className="act3geo-sombra-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasSombraRef}
                  className="act3geo-sombra-canvas"
                  role="img"
                  aria-label="Sombra animando al estudiante"
                />

                <span className="act3geo-sombra-orbit" aria-hidden="true" />
              </div>

              <div className="act3geo-sombra-content">
 <DetalleErroresDeMision items={[...(RETOS.map((r,i)=>({id:`native-${i}`,title:i===retoActual?"Reto geométrico " + (retoActual+1):`Reto geométrico ${i+1}`,answer:i===retoActual?String(seleccion??""):i<retosCompletados?"Validado en la misión":"",correct:i<retosCompletados?true:i===retoActual?Boolean(seleccion===reto.respuesta):null,hint:r.consejo,target:".act3geo-layout"})).filter((_,i)=>i<=retoActual)),...mission.items]} onCorrect={(item)=>{cerrarModalSombra(); setEstadoRespuesta("pendiente"); mission.beginCorrection(item);}} onRestart={reiniciarActividad}/>

                <span className="act3geo-sombra-badge">
                  <FiVolume2 /> Mensaje de Sombra
                </span>

                <h2 id="act3geo-sombra-title">Casi lo logras</h2>

                <div className="act3geo-sombra-cloud">
                  <span className="act3geo-sombra-cloud-dot act3geo-sombra-cloud-dot-one" />
                  <span className="act3geo-sombra-cloud-dot act3geo-sombra-cloud-dot-two" />

                  <p>
                    {textoSombra || TEXTO_INICIAL_SOMBRA}
                    {estadoSombra === "reproduciendo" && (
                      <span className="act3geo-typing-cursor" />
                    )}
                  </p>
                </div>

                <div className="act3geo-sombra-controls">
                  <button
                    type="button"
                    className="act3geo-sombra-play"
                    onClick={iniciarSombra}
                    disabled={estadoSombra === "reproduciendo"}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button
                    type="button"
                    onClick={pausarSombra}
                    disabled={estadoSombra !== "reproduciendo"}
                  >
                    <FiPause /> Pausar
                  </button>

                  <button type="button" onClick={repetirSombra}>
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>

                <button
                  type="button"
                  className="act3geo-sombra-try-btn"
                  onClick={volverAIntentarlo}
                >
                  Volver a intentarlo
                </button>
              </div>

              <aside className="act3geo-sombra-transcript">
                <h3>Texto completo</h3>

                {GUION_SOMBRA_ERROR.map((linea, indice) => (
                  <p
                    key={`${linea}-${indice}`}
                    className={
                      indice < indiceSombraActivo
                        ? "act3geo-sombra-line-done"
                        : indice === indiceSombraActivo
                          ? "act3geo-sombra-line-active"
                          : "act3geo-sombra-line-pending"
                    }
                    style={
                      {
                        "--progreso-sombra":
                          indice < indiceSombraActivo
                            ? "100%"
                            : indice === indiceSombraActivo
                              ? `${progresoLineaSombra}%`
                              : "0%",
                      } as Record<string, string>
                    }
                  >
                    {linea}
                  </p>
                ))}
              </aside>

              <audio
                ref={audioSombraRef}
                src={audioSombraError}
                preload="auto"
              />
            </section>
          </div>
        )}

        {modalProfeOpen && (
          <div
            className="act3geo-profe-modal-overlay"
            onClick={cerrarModalProfe}
          >
            <section
              className={`act3geo-profe-modal ${
                estadoProfe === "reproduciendo"
                  ? "act3geo-profe-modal-playing"
                  : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act3geo-profe-modal-title"
            >
              <button
                type="button"
                className="act3geo-profe-close"
                onClick={cerrarModalProfe}
                aria-label="Cerrar explicación"
              >
                <FiX />
              </button>

              <div className="act3geo-profe-modal-hero">
                <video
                  ref={videoProfeRef}
                  src={videoProfeAstro}
                  className="act3geo-profe-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasProfeRef}
                  className="act3geo-profe-canvas"
                  role="img"
                  aria-label="Profesor Astro explicando los tipos de ángulos"
                />

                <span className="act3geo-profe-planet" aria-hidden="true" />
              </div>

              <div className="act3geo-profe-modal-content">
                <span className="act3geo-profe-modal-badge">
                  <FiVolume2 /> Profesor Astro
                </span>

                <h2 id="act3geo-profe-modal-title">Observa antes de elegir</h2>

                <div className="act3geo-profe-cloud">
                  <span className="act3geo-profe-cloud-dot act3geo-profe-cloud-dot-one" />
                  <span className="act3geo-profe-cloud-dot act3geo-profe-cloud-dot-two" />

                  <p>
                    {textoProfe || TEXTO_INICIAL_PROFE}
                    {estadoProfe === "reproduciendo" && (
                      <span className="act3geo-typing-cursor" />
                    )}
                  </p>
                </div>

                <div className="act3geo-profe-modal-controls">
                  <button
                    type="button"
                    className="act3geo-profe-modal-play"
                    onClick={reproducirProfe}
                    disabled={estadoProfe === "reproduciendo"}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button
                    type="button"
                    onClick={pausarProfe}
                    disabled={estadoProfe !== "reproduciendo"}
                  >
                    <FiPause /> Pausar
                  </button>

                  <button type="button" onClick={reiniciarProfe}>
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>
              </div>

              <aside className="act3geo-profe-transcript">
                <h3>Texto del profesor</h3>

                {GUION_PROFE_ASTRO.map((linea, indice) => (
                  <p
                    key={`${linea}-${indice}`}
                    className={
                      indice === indiceProfeActivo
                        ? "act3geo-profe-transcript-active"
                        : ""
                    }
                    style={
                      indice === indiceProfeActivo
                        ? ({
                            "--act3geo-profe-progress": `${progresoLineaProfe}%`,
                          } as Record<string, string>)
                        : undefined
                    }
                  >
                    {linea}
                  </p>
                ))}
              </aside>

              <audio ref={audioProfeRef} src={audioProfeAstro} preload="auto" />
            </section>
          </div>
        )}

        {modalCompletado && (
          <div
            className="act3geo-complete-modal-overlay"
            onClick={cerrarModalCompletado}
          >
            <section
              className={`act3geo-complete-modal ${
                estadoCierre === "reproduciendo"
                  ? "act3geo-complete-modal-playing"
                  : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act3geo-complete-title"
            >
              <img
                src={bannerActividadCompletada}
                alt="Trofeo de misión completada"
                className="act3geo-complete-bg-image"
                aria-hidden="true"
              />

              <div className="act3geo-complete-party" aria-hidden="true">
                <span className="act3geo-complete-confetti act3geo-complete-confetti-one" />
                <span className="act3geo-complete-confetti act3geo-complete-confetti-two" />
                <span className="act3geo-complete-confetti act3geo-complete-confetti-three" />
                <span className="act3geo-complete-confetti act3geo-complete-confetti-four" />
                <span className="act3geo-complete-confetti act3geo-complete-confetti-five" />
                <span className="act3geo-complete-confetti act3geo-complete-confetti-six" />
                <span className="act3geo-complete-confetti act3geo-complete-confetti-seven" />
                <span className="act3geo-complete-confetti act3geo-complete-confetti-eight" />
                <span className="act3geo-complete-confetti act3geo-complete-confetti-nine" />
                <span className="act3geo-complete-confetti act3geo-complete-confetti-ten" />
                <span className="act3geo-complete-floating-star act3geo-complete-floating-star-one">
                  ★
                </span>
                <span className="act3geo-complete-floating-star act3geo-complete-floating-star-two">
                  ★
                </span>
                <span className="act3geo-complete-floating-star act3geo-complete-floating-star-three">
                  ★
                </span>
              </div>

              <button
                type="button"
                className="act3geo-complete-close"
                onClick={cerrarModalCompletado}
                aria-label="Cerrar misión completada"
              >
                <FiX />
              </button>

              <div className="act3geo-complete-hero">
                <span className="act3geo-complete-check">
                  <FiCheck />
                </span>

                <video
                  ref={videoCierreRef}
                  src={videoNovaExplicando}
                  className="act3geo-complete-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasCierreRef}
                  className="act3geo-complete-canvas"
                  role="img"
                  aria-label="Nova celebrando la misión completada"
                />

                <span className="act3geo-complete-orbit" />
                <span className="act3geo-complete-spark act3geo-complete-spark-one" />
                <span className="act3geo-complete-spark act3geo-complete-spark-two" />
              </div>

              <div className="act3geo-complete-content"><AudioRetroalimentacion/>
                <span className="act3geo-complete-badge">
                  <GiTrophyCup /> Actividad completada
                </span>

                <h2 id="act3geo-complete-title">¡Misión completada!</h2>

                <div className="act3geo-complete-cloud">
                  <span className="act3geo-complete-cloud-dot act3geo-complete-cloud-dot-one" />
                  <span className="act3geo-complete-cloud-dot act3geo-complete-cloud-dot-two" />

                  <p>
                    {textoCierre || TEXTO_INICIAL_CIERRE}
                    {estadoCierre === "reproduciendo" && (
                      <span className="act3geo-typing-cursor" />
                    )}
                  </p>
                </div>

                <div className="act3geo-complete-controls">
                  <button
                    type="button"
                    className="act3geo-complete-play"
                    onClick={reproducirCierre}
                    disabled={estadoCierre === "reproduciendo"}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button
                    type="button"
                    onClick={pausarCierre}
                    disabled={estadoCierre !== "reproduciendo"}
                  >
                    <FiPause /> Pausar
                  </button>

                  <button type="button" onClick={reiniciarCierre}>
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>

                <div className="act3geo-complete-summary">
                  <article>
                    <FiCheck />
                    <div>
                      <span>Retos</span>
                      <strong>
                        {RETOS.length}/{RETOS.length}
                      </strong>
                    </div>
                  </article>

                  <article>
                    <FiTarget />
                    <div>
                      <span>Precisión</span>
                      <strong>
                        {Math.round(
                          (RETOS.length /
                            Math.max(RETOS.length + erroresTotales, 1)) *
                            100,
                        )}
                        %
                      </strong>
                    </div>
                  </article>

                  <article>
                    <span className="act3geo-complete-star">★</span>
                    <div>
                      <span>Recompensa</span>
                      <strong>+120 XP</strong>
                    </div>
                  </article>
                </div>
              </div>

              <aside className="act3geo-complete-side">
                <article className="act3geo-complete-transcript">
                  <h3>Texto completo</h3>

                  {GUION_CIERRE_NOVA.map((linea, indice) => (
                    <p
                      key={`${linea}-${indice}`}
                      className={
                        indice < indiceCierreActivo
                          ? "act3geo-complete-line-done"
                          : indice === indiceCierreActivo
                            ? "act3geo-complete-line-active"
                            : "act3geo-complete-line-pending"
                      }
                      style={
                        {
                          "--progreso-complete":
                            indice < indiceCierreActivo
                              ? "100%"
                              : indice === indiceCierreActivo
                                ? `${progresoLineaCierre}%`
                                : "0%",
                        } as CSSProperties
                      }
                    >
                      {linea}
                    </p>
                  ))}
                </article>

                <div className="act3geo-complete-actions">
                  <button
                    type="button"
                    className="act3geo-complete-next"
                    onClick={() =>
                      irARuta("/actividades/geometria/actividad-4")
                    }
                  >
                    <FiArrowRight /> Siguiente actividad
                  </button>

                  <button type="button" onClick={reiniciarActividad}>
                    <FiRotateCcw /> Repetir actividad
                  </button>

                  <button
                    type="button"
                    onClick={() => irARuta("/actividades/geometria")}
                  >
                    <FiLogOut /> Volver a actividades
                  </button>
                </div>
              </aside>

              <audio
                ref={audioCierreRef}
                src={audioCierreNova}
                preload="auto"
              />
            </section>
          </div>
        )}

        <footer className="act3geo-footer">
          <div className="act3geo-footer-icons">
            <button
              type="button"
              onClick={() => navigate("/login")}
              aria-label="Cerrar sesión"
            >
              <FiLogOut />
            </button>

            <button type="button" aria-label="Ayuda">
              <FiHelpCircle />
            </button>

            <button type="button" aria-label="Configuración">
              <FiSettings />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Actividad3MathGeometry;
