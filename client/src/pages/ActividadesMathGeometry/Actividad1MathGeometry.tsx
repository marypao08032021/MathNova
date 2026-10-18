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

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSessionUser,
  hasAuthSession,
  isGuestSession,
} from "../../utils/authSession";

import "./Actividad1MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividad1/hero-banner-act1-mathgeometry.png";

import profesorPista from "../../assets/mathGeometry/actividad1/profesor-dando-pista.png";
import sombraConfusion from "../../assets/mathGeometry/actividad1/sombra-confusion.png";
import bytePista from "../../assets/mathGeometry/actividad1/byte-pista.png";

import trianguloFigura from "../../assets/mathGeometry/actividad1/triangulo-a-construir-mathgeometry.png";
import cuadradoFigura from "../../assets/mathGeometry/actividad1/cuadrado-a-construir-mathgeometry.png";
import rectanguloFigura from "../../assets/mathGeometry/actividad1/rectangulo-a-construir-mathgeometry.png";

import incisoTriangulo from "../../assets/mathGeometry/actividad1/inciso-a-triangulo-mathgeometry.png";
import incisoCuadrado from "../../assets/mathGeometry/actividad1/inciso-b-cuadrado-mathgeometry.png";
import incisoRectangulo from "../../assets/mathGeometry/actividad1/inciso-c-rectangulo-mathgeometry.png";

import audioBienvenida from "../../assets/mathGeometry/actividad1/act_1_nueva_introduccion_bienvenida_MathGeometry.mp3";
import videoNovaExplicando from "../../assets/mathGeometry/actividad1/nova_explicando_act_1_MathGeometry.mp4";
import audioNovaCompletado from "../../assets/mathGeometry/actividad1/nova_actividad_completada_MathGeometry.mp3";
import bannerCompletado from "../../assets/mathGeometry/actividad1/activida_completada_banner_MathGeometry.png";

import videoProfeAstro from "../../assets/mathGeometry/actividad1/instrucciones_profe_astro_MathGeometry.mp4";
import audioProfeAstro from "../../assets/mathGeometry/actividad1/act_1_nueva_profe_astro_MathGeometry.mp3";

import videoBytePistas from "../../assets/mathGeometry/actividad1/byte_aciertos_y_pistas_MathGeometry.mp4";
import audioByteTriangulo from "../../assets/mathGeometry/actividad1/act_1_pista_byte_triangulo_MathGeometry.mp3";
import audioByteCuadrado from "../../assets/mathGeometry/actividad1/act_1_pista_byte_cuadrado_MathGeometry.mp3";
import audioByteRectangulo from "../../assets/mathGeometry/actividad1/act_1_pista_byte_rectangulo_MathGeometry.mp3";

import videoSombraError from "../../assets/mathGeometry/actividad1/Act_1_sombra_error_MathGeometry_.mp4";
import audioSombraError from "../../assets/mathGeometry/actividad1/act_1_sombra_error_MathGeometry.mp3";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiClock,
  FiCheck,
  FiPause,
  FiTarget,
  FiFlag,
  FiPlay,
  FiRotateCcw,
  FiX,
  FiVolume2,
  FiArrowRight,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

type FiguraId = "triangulo" | "cuadrado" | "rectangulo";
type OpcionId = "triangulo" | "cuadrado" | "rectangulo";
type PistaByteId = "triangulo" | "cuadrado" | "rectangulo";
type EstadoExplicacion = "inicio" | "reproduciendo" | "pausado" | "terminado";

type SessionUser = {
  rol?: string;
  role?: string;
  tipo_usuario?: string;
  role_id?: number | string;
  roleId?: number | string;
  id_rol?: number | string;
};

/*
  AQUÍ AJUSTAS LA VELOCIDAD DEL TEXTO:
  - 1 = normal
  - 1.15 = un poquito más rápido
  - 1.3 = más rápido
*/
const VELOCIDAD_TEXTO = 1.6;

/*
  VELOCIDAD DEL TEXTO DE BYTE:
  - Si el texto de Byte se queda atrás, sube a 2.0 o 2.2.
  - Si el texto de Byte se adelanta mucho, baja a 1.45 o 1.55.
  NO toca al Profesor Astro.
*/
const VELOCIDAD_TEXTO_BYTE = 1.85;

/*
  CADA CUÁNTO SE ACTUALIZA EL TEXTO DE BYTE.
  70ms se ve más suave y evita que se trabe por tantos renders.
*/
const REFRESCO_TEXTO_BYTE_MS = 70;

/*
  Cuando termina el audio de Byte, espera tantito y vuelve
  al mensaje inicial de "Presiona reproducir...".
*/
const REINICIO_BYTE_AL_TERMINAR_MS = 650;

/*
  TEXTO EXACTO DEL AUDIO.
  Cada bloque aparece conforme avanza el audio.
*/
const guionBienvenida = [
  {
    inicio: 0,
    fin: 2.6,
    texto: "¡Hola, explorador de MathNova!",
  },
  {
    inicio: 2.6,
    fin: 8.5,
    texto:
      "Observa cada figura y elige una de las opciones que se muestran: triángulo, cuadrado o rectángulo.",
  },
  {
    inicio: 8.5,
    fin: 12.0,
    texto: "Fíjate en sus lados y en su forma antes de responder.",
  },
  {
    inicio: 12.0,
    fin: 14.1,
    texto: "¡Vamos a comenzar la misión!",
  },
];

const textoInicialBienvenida =
  "Presiona iniciar para escuchar la explicación de Nova.";

const textoFinalBienvenida = "¡Vamos a comenzar la misión!";

const guionNovaCompletado = [
  "¡Misión completada!",
  "Hoy identificaste figuras geométricas observando sus lados y su forma.",
  "Aprendiste a identificar triángulos, cuadrados y rectángulos observando sus lados y su forma.",
  "Cada figura completada quedó registrada como evidencia de tu avance.",
  "¡Muy buen trabajo, explorador! Nos vemos en la siguiente misión de MathNova.",
];

const textoInicialCompletado =
  "Presiona reproducir para escuchar el cierre de Nova.";

const textoFinalCompletado =
  "¡Muy buen trabajo, explorador! Nos vemos en la siguiente misión de MathNova.";

const RUTA_ACTIVIDAD_2 = "/actividades/geometria/actividad-2";
const RUTA_ACTIVIDADES_GEOMETRIA = "/actividades/geometria";

const guionProfeAstro = [
  "En la pantalla verás varias figuras geométricas ya formadas.",
  "Tu tarea será observar cada imagen y elegir una de las opciones que aparecen: triángulo, cuadrado o rectángulo.",
  "Fíjate muy bien en la forma de cada figura.",
  "Si tiene tres lados, puede ser un triángulo.",
  "Si tiene cuatro lados iguales, puede ser un cuadrado.",
  "Y si tiene cuatro lados, pero dos son más largos que los otros, puede ser un rectángulo.",
  "Cuando selecciones tus respuestas, revisaremos juntos si elegiste las figuras correctas.",
];

const textoInicialProfe =
  "Presiona reproducir para escuchar el consejo del Profesor Astro.";

const textoFinalProfe =
  "Cuando selecciones tus respuestas, revisaremos juntos si elegiste las figuras correctas.";

const pistasByte: Record<
  PistaByteId,
  {
    nombre: string;
    tituloModal: string;
    etiqueta: string;
    audio: string;
    guion: string[];
  }
> = {
  triangulo: {
    nombre: "Triángulo",
    tituloModal: "Pista para el triángulo",
    etiqueta: "3 lados",
    audio: audioByteTriangulo,
    guion: [
      "Pista espacial:",
      "Un triángulo tiene tres lados.",
      "Busca la figura cerrada que tenga tres lados.",
      "¡Creo que ya casi lo tienes!",
    ],
  },
  cuadrado: {
    nombre: "Cuadrado",
    tituloModal: "Pista para el cuadrado",
    etiqueta: "4 lados iguales",
    audio: audioByteCuadrado,
    guion: [
      "Pista de explorador:",
      "Un cuadrado tiene cuatro lados iguales.",
      "Busca una figura pareja con cuatro lados iguales, como una ventanita espacial.",
      "¡A mí me encantan las ventanitas espaciales!",
    ],
  },
  rectangulo: {
    nombre: "Rectángulo",
    tituloModal: "Pista para el rectángulo",
    etiqueta: "2 lados largos y 2 cortos",
    audio: audioByteRectangulo,
    guion: [
      "Pista geométrica:",
      "Un rectángulo tiene cuatro lados.",
      "Dos lados son más largos y dos lados son más cortos.",
      "Busca una figura que parezca una pantalla o una puerta.",
      "¡Eso puede ayudarte a encontrarla!",
    ],
  },
};

const textoInicialByte =
  "Elige si necesitas una pista para triángulo, cuadrado o rectángulo.";

const ordenPistasByte: PistaByteId[] = ["triangulo", "cuadrado", "rectangulo"];

const guionSombraError = [
  "Casi lo logras.",
  "Observa otra vez cada figura y fíjate bien en su forma antes de responder.",
  "Recuerda: no pasa nada si te equivocas.",
  "En MathNova podemos volver a intentarlo.",
  "¡Vamos una vez más!",
];

const textoInicialSombra =
  "Presiona reproducir para escuchar el mensaje de Sombra.";

const textoFinalSombra = "¡Vamos una vez más!";

function obtenerEstadoGuionFlexible(
  tiempo: number,
  duracionAudio: number,
  guion: string[],
  velocidad = 1.25,
) {
  const duracionSegura =
    Number.isFinite(duracionAudio) && duracionAudio > 0 ? duracionAudio : 34;

  const totalLetras = guion.reduce((total, texto) => total + texto.length, 0);
  let inicioAcumulado = 0;

  for (let indice = 0; indice < guion.length; indice += 1) {
    const texto = guion[indice];
    const duracionLinea = Math.max(
      2.2,
      (texto.length / totalLetras) * duracionSegura,
    );
    const finLinea = inicioAcumulado + duracionLinea;

    if (tiempo >= inicioAcumulado && tiempo < finLinea) {
      const progresoNatural = Math.min(
        1,
        Math.max(0, (tiempo - inicioAcumulado) / duracionLinea),
      );

      const progresoTexto = Math.min(1, progresoNatural * velocidad);
      const letrasVisibles = Math.max(
        1,
        Math.floor(texto.length * progresoTexto),
      );

      return {
        texto: texto.slice(0, letrasVisibles),
        indice,
        progresoLinea: Math.round(progresoTexto * 100),
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

function obtenerEstadoGuionByte(
  tiempo: number,
  duracionAudio: number,
  guion: string[],
) {
  const duracionSegura =
    Number.isFinite(duracionAudio) && duracionAudio > 0 ? duracionAudio : 12;

  /*
    Byte usa un cálculo diferente al Profesor Astro:
    - Las frases cortas duran menos.
    - El texto se actualiza más suave.
    - El subrayado avanza con el tiempo real del audio.
  */
  const duracionDisponible = Math.max(1, duracionSegura * 0.96);

  const pesos = guion.map((texto) => {
    const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
    const esTituloCorto = texto.includes(":") && palabras <= 3;

    return Math.max(
      esTituloCorto ? 0.75 : 1.05,
      palabras * 0.36 + texto.length * 0.012,
    );
  });

  const totalPesos = pesos.reduce((total, peso) => total + peso, 0) || 1;
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
        Math.max(0, progresoNatural * VELOCIDAD_TEXTO_BYTE),
      );

      const letrasVisibles = Math.max(
        1,
        Math.ceil(texto.length * progresoTexto),
      );

      return {
        texto: texto.slice(0, letrasVisibles),
        indice,
        /* El subrayado sí va con el audio, no con la velocidad del texto. */
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

function obtenerTextoPorTiempo(tiempo: number) {
  const lineaActual =
    guionBienvenida.find(
      (linea) => tiempo >= linea.inicio && tiempo < linea.fin,
    ) || guionBienvenida[guionBienvenida.length - 1];

  const duracion = lineaActual.fin - lineaActual.inicio;

  const progreso = Math.min(
    1,
    Math.max(0, ((tiempo - lineaActual.inicio) / duracion) * VELOCIDAD_TEXTO),
  );

  const letrasVisibles = Math.max(
    1,
    Math.floor(lineaActual.texto.length * progreso),
  );

  return lineaActual.texto.slice(0, letrasVisibles);
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

    const esClaro = r > 224 && g > 224 && b > 224;
    const casiSinColor =
      Math.abs(r - g) < 34 && Math.abs(r - b) < 34 && Math.abs(g - b) < 34;

    return esClaro && casiSinColor;
  };

  const agregar = (index: number) => {
    if (index < 0 || index >= total) return;
    if (visitado[index]) return;
    if (!esFondoClaro(index)) return;

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

    const pixel = index * 4;
    data[pixel + 3] = 0;

    const x = index % width;
    const y = Math.floor(index / width);

    if (x > 0) agregar(index - 1);
    if (x < width - 1) agregar(index + 1);
    if (y > 0) agregar(index - width);
    if (y < height - 1) agregar(index + width);
  }

  ctx.putImageData(imageData, 0, 0);
}

/*
  Dibuja el video sin estirarlo.
  Esto arregla que Byte o Sombra se vean deformados cuando el MP4
  no coincide exactamente con el tamaño del canvas.
*/
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
function obtenerEstadoGuionSombra(tiempo: number, duracionAudio: number) {
  const duracionSegura =
    Number.isFinite(duracionAudio) && duracionAudio > 0 ? duracionAudio : 11;

  /*
    AQUÍ CONTROLAS CUÁNDO CAMBIA CADA FRASE DE SOMBRA.
    Si quieres que cambie más rápido, baja el "fin" de cada línea.
  */
  const tiemposSombra = [
    { inicio: 0.0, fin: 0.12 }, // Casi lo logras.
    { inicio: 0.12, fin: 0.46 }, // Observa otra vez...
    { inicio: 0.46, fin: 0.62 }, // Recuerda...
    { inicio: 0.62, fin: 0.8 }, // En MathNova...
    { inicio: 0.8, fin: 1.0 }, // ¡Vamos una vez más!
  ];

  for (let indice = 0; indice < guionSombraError.length; indice += 1) {
    const rango = tiemposSombra[indice];
    const inicioLinea = rango.inicio * duracionSegura;
    const finLinea = rango.fin * duracionSegura;

    if (tiempo >= inicioLinea && tiempo < finLinea) {
      const texto = guionSombraError[indice];

      const progresoNatural = Math.min(
        1,
        Math.max(0, (tiempo - inicioLinea) / (finLinea - inicioLinea)),
      );

      /*
        Esto solo controla qué tan rápido aparecen las letras dentro
        de esa frase, no cuándo cambia de frase.
      */
      const velocidadLetras = 2.2;

      const progresoTexto = Math.min(1, progresoNatural * velocidadLetras);

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
  }

  return {
    texto: guionSombraError[guionSombraError.length - 1],
    indice: guionSombraError.length - 1,
    progresoLinea: 100,
  };
}
function formatearTiempo(segundos: number) {
  const minutos = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");

  const segundosRestantes = (segundos % 60)
    .toString()
    .padStart(2, "0");

  return `${minutos}:${segundosRestantes}`;
}

function Actividad1MathGeometry() {
 const mission=useMissionExpansion("mathgeometry-actividad-1");
  const [menuOpen, setMenuOpen] = useState(false);
  const [actividadPausada, setActividadPausada] = useState(false);
  const [textoBienvenida, setTextoBienvenida] = useState("");
  const [estadoExplicacion, setEstadoExplicacion] =
    useState<EstadoExplicacion>("inicio");

  const videoNovaRef = useRef<HTMLVideoElement | null>(null);
  const canvasNovaRef = useRef<HTMLCanvasElement | null>(null);
  const audioNovaRef = useRef<HTMLAudioElement | null>(null);

  const videoProfeRef = useRef<HTMLVideoElement | null>(null);
  const canvasProfeRef = useRef<HTMLCanvasElement | null>(null);
  const audioProfeRef = useRef<HTMLAudioElement | null>(null);

  const videoByteRef = useRef<HTMLVideoElement | null>(null);
  const canvasByteRef = useRef<HTMLCanvasElement | null>(null);
  const audioByteRef = useRef<HTMLAudioElement | null>(null);

  const videoCompletadoRef = useRef<HTMLVideoElement | null>(null);
  const canvasCompletadoRef = useRef<HTMLCanvasElement | null>(null);
  const audioCompletadoRef = useRef<HTMLAudioElement | null>(null);

  const videoSombraRef = useRef<HTMLVideoElement | null>(null);
  const canvasSombraRef = useRef<HTMLCanvasElement | null>(null);
  const audioSombraRef = useRef<HTMLAudioElement | null>(null);

  const [modalProfeOpen, setModalProfeOpen] = useState(false);
  const [textoProfe, setTextoProfe] = useState("");
  const [estadoProfe, setEstadoProfe] = useState<EstadoExplicacion>("inicio");
  const [indiceProfeActivo, setIndiceProfeActivo] = useState(-1);
  const [progresoLineaProfe, setProgresoLineaProfe] = useState(0);
  const [autoPlayProfe, setAutoPlayProfe] = useState(false);

  const [modalByteOpen, setModalByteOpen] = useState(false);
  const [pistaByteSeleccionada, setPistaByteSeleccionada] =
    useState<PistaByteId | null>(null);
  const [textoByte, setTextoByte] = useState("");
  const [estadoByte, setEstadoByte] = useState<EstadoExplicacion>("inicio");
  const [indiceByteActivo, setIndiceByteActivo] = useState(-1);
  const [progresoLineaByte, setProgresoLineaByte] = useState(0);
  const [autoPlayByte, setAutoPlayByte] = useState(false);

  const [modalCompletadoOpen, setModalCompletadoOpen] = useState(false);
  const [textoCompletado, setTextoCompletado] = useState("");
  const [estadoCompletado, setEstadoCompletado] =
    useState<EstadoExplicacion>("inicio");
  const [indiceCompletadoActivo, setIndiceCompletadoActivo] = useState(-1);
  const [progresoLineaCompletado, setProgresoLineaCompletado] = useState(0);
  const [autoPlayCompletado, setAutoPlayCompletado] = useState(false);

  const [modalSombraOpen, setModalSombraOpen] = useState(false);
  const [textoSombra, setTextoSombra] = useState("");
  const [estadoSombra, setEstadoSombra] = useState<EstadoExplicacion>("inicio");
  const [indiceSombraActivo, setIndiceSombraActivo] = useState(-1);
  const [progresoLineaSombra, setProgresoLineaSombra] = useState(0);
  const [autoPlaySombra, setAutoPlaySombra] = useState(false);

  const [estadoRevision, setEstadoRevision] = useState<
    "pendiente" | "falta" | "correcto"
  >("pendiente");

  const [errores, setErrores] = useState(0);
  const [segundos, setSegundos] = useState(0);

  const reinicioByteTimeoutRef = useRef<number | null>(null);
  const ultimoTextoByteRef = useRef("");
  const ultimoIndiceByteRef = useRef(-1);
  const ultimoProgresoByteRef = useRef(0);

  const [selecciones, setSelecciones] = useState<
    Record<FiguraId, OpcionId | "">
  >({
    triangulo: "",
    cuadrado: "",
    rectangulo: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const hayModalAbierto =
      modalProfeOpen ||
      modalByteOpen ||
      modalCompletadoOpen ||
      modalSombraOpen;

    if (actividadPausada || hayModalAbierto) return;

    const temporizador = window.setInterval(() => {
      setSegundos((valorActual) => valorActual + 1);
    }, 1000);

    return () => {
      window.clearInterval(temporizador);
    };
  }, [
    actividadPausada,
    modalProfeOpen,
    modalByteOpen,
    modalCompletadoOpen,
    modalSombraOpen,
  ]);


  const obtenerDashboardPrincipal = () => {
    if (isGuestSession() && !hasAuthSession()) {
      return "/dashboard";
    }

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
      rol === "docente" ||
      rol === "profesor" ||
      rol === "maestro" ||
      rol === "docente_estudiante" ||
      rol === "docente-estudiante" ||
      rol === "docente_alumno" ||
      rol === "docente-alumno" ||
      rol === "maestro_estudiante" ||
      rol === "maestro-estudiante" ||
      rol === "mixto" ||
      roleId === 1 ||
      roleId === 4
    ) {
      return "/dashboard-docente";
    }

    return "/dashboard";
  };

  const pistaByteActiva = pistaByteSeleccionada
    ? pistasByte[pistaByteSeleccionada]
    : null;

  useEffect(() => {
    const bloquearPantalla =
      menuOpen ||
      modalProfeOpen ||
      modalByteOpen ||
      modalCompletadoOpen ||
      modalSombraOpen;

    const anchoScrollbar =
      window.innerWidth - document.documentElement.clientWidth;

    if (bloquearPantalla) {
      document.body.classList.add("act1geo-body-locked");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${Math.max(anchoScrollbar, 0)}px`;
      document.documentElement.style.setProperty(
        "--act1geo-scrollbar-width",
        `${Math.max(anchoScrollbar, 0)}px`,
      );
    } else {
      document.body.classList.remove("act1geo-body-locked");
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
      document.documentElement.style.removeProperty(
        "--act1geo-scrollbar-width",
      );
    }

    return () => {
      document.body.classList.remove("act1geo-body-locked");
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "";
      document.documentElement.style.removeProperty(
        "--act1geo-scrollbar-width",
      );
    };
  }, [
    menuOpen,
    modalProfeOpen,
    modalByteOpen,
    modalCompletadoOpen,
    modalSombraOpen,
  ]);

  useEffect(() => {
    return () => {
      if (reinicioByteTimeoutRef.current) {
        window.clearTimeout(reinicioByteTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    if (!audio) return;

    const terminarExplicacion = () => {
      setEstadoExplicacion("terminado");
      setTextoBienvenida(textoFinalBienvenida);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarExplicacion);

    return () => {
      audio.removeEventListener("ended", terminarExplicacion);
    };
  }, []);

  useEffect(() => {
    if (estadoExplicacion !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioNovaRef.current;
      if (!audio) return;

      setTextoBienvenida(obtenerTextoPorTiempo(audio.currentTime));
    }, 25);

    return () => {
      window.clearInterval(intervalo);
    };
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

    const dibujarVideoSinFondo = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarVideoSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);

    animationFrame = window.requestAnimationFrame(dibujarVideoSinFondo);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    if (!modalProfeOpen) return;

    const audio = audioProfeRef.current;
    const video = videoProfeRef.current;

    if (!audio) return;

    const terminarConsejo = () => {
      setEstadoProfe("terminado");
      setTextoProfe(textoFinalProfe);
      setIndiceProfeActivo(guionProfeAstro.length - 1);
      setProgresoLineaProfe(100);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarConsejo);

    return () => {
      audio.removeEventListener("ended", terminarConsejo);
    };
  }, [modalProfeOpen]);

  useEffect(() => {
    if (!modalProfeOpen || estadoProfe !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioProfeRef.current;
      if (!audio) return;

      const estadoGuion = obtenerEstadoGuionFlexible(
        audio.currentTime,
        audio.duration,
        guionProfeAstro,
        1.35,
      );

      setTextoProfe(estadoGuion.texto);
      setIndiceProfeActivo(estadoGuion.indice);
      setProgresoLineaProfe(estadoGuion.progresoLinea);
    }, 25);

    return () => {
      window.clearInterval(intervalo);
    };
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

    const dibujarProfeSinFondo = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarProfeSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarProfeSinFondo);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalProfeOpen]);

  useEffect(() => {
    if (!modalProfeOpen || !autoPlayProfe) return;

    const timeout = window.setTimeout(() => {
      setAutoPlayProfe(false);
      iniciarProfeAstro();
    }, 80);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [modalProfeOpen, autoPlayProfe]);

  useEffect(() => {
    if (!modalByteOpen || !pistaByteActiva) return;

    const audio = audioByteRef.current;
    const video = videoByteRef.current;

    if (!audio) return;

    const terminarPista = () => {
      setEstadoByte("terminado");
      setTextoByte(pistaByteActiva.guion[pistaByteActiva.guion.length - 1]);
      setIndiceByteActivo(pistaByteActiva.guion.length - 1);
      setProgresoLineaByte(100);

      ultimoTextoByteRef.current =
        pistaByteActiva.guion[pistaByteActiva.guion.length - 1];
      ultimoIndiceByteRef.current = pistaByteActiva.guion.length - 1;
      ultimoProgresoByteRef.current = 100;

      if (video) {
        video.pause();
        video.currentTime = 0;
      }

      if (reinicioByteTimeoutRef.current) {
        window.clearTimeout(reinicioByteTimeoutRef.current);
      }

      reinicioByteTimeoutRef.current = window.setTimeout(() => {
        if (audioByteRef.current) {
          audioByteRef.current.currentTime = 0;
        }

        if (videoByteRef.current) {
          videoByteRef.current.currentTime = 0;
          videoByteRef.current.pause();
        }

        setEstadoByte("inicio");
        setTextoByte("");
        setIndiceByteActivo(-1);
        setProgresoLineaByte(0);

        ultimoTextoByteRef.current = "";
        ultimoIndiceByteRef.current = -1;
        ultimoProgresoByteRef.current = 0;
      }, REINICIO_BYTE_AL_TERMINAR_MS);
    };

    audio.addEventListener("ended", terminarPista);

    return () => {
      audio.removeEventListener("ended", terminarPista);
    };
  }, [modalByteOpen, pistaByteActiva]);

  useEffect(() => {
    if (!modalByteOpen || estadoByte !== "reproduciendo" || !pistaByteActiva) {
      return;
    }

    const intervalo = window.setInterval(() => {
      const audio = audioByteRef.current;
      if (!audio) return;

      const estadoGuion = obtenerEstadoGuionByte(
        audio.currentTime,
        audio.duration,
        pistaByteActiva.guion,
      );

      if (estadoGuion.texto !== ultimoTextoByteRef.current) {
        ultimoTextoByteRef.current = estadoGuion.texto;
        setTextoByte(estadoGuion.texto);
      }

      if (estadoGuion.indice !== ultimoIndiceByteRef.current) {
        ultimoIndiceByteRef.current = estadoGuion.indice;
        setIndiceByteActivo(estadoGuion.indice);
      }

      if (
        Math.abs(estadoGuion.progresoLinea - ultimoProgresoByteRef.current) >= 3
      ) {
        ultimoProgresoByteRef.current = estadoGuion.progresoLinea;
        setProgresoLineaByte(estadoGuion.progresoLinea);
      }
    }, REFRESCO_TEXTO_BYTE_MS);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [modalByteOpen, estadoByte, pistaByteActiva]);

  useEffect(() => {
    if (!modalByteOpen) return;

    const video = videoByteRef.current;
    const canvas = canvasByteRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) return;

    const canvasWidth = 300;
    const canvasHeight = 533;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujarByteSinFondo = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 50 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarByteSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarByteSinFondo);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalByteOpen]);

  useEffect(() => {
    if (!modalByteOpen || !autoPlayByte || !pistaByteActiva) return;

    const timeout = window.setTimeout(() => {
      setAutoPlayByte(false);
      iniciarByte();
    }, 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [modalByteOpen, autoPlayByte, pistaByteActiva]);

  useEffect(() => {
    if (!modalSombraOpen) return;

    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;

    if (!audio) return;

    const terminarSombra = () => {
      setEstadoSombra("terminado");
      setTextoSombra(textoFinalSombra);
      setIndiceSombraActivo(guionSombraError.length - 1);
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

      const estadoGuion = obtenerEstadoGuionSombra(
        audio.currentTime,
        audio.duration,
      );

      setTextoSombra(estadoGuion.texto);
      setIndiceSombraActivo(estadoGuion.indice);
      setProgresoLineaSombra(estadoGuion.progresoLinea);
    }, 30);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [modalSombraOpen, estadoSombra]);

  useEffect(() => {
    if (!modalSombraOpen) return;

    const video = videoSombraRef.current;
    const canvas = canvasSombraRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) return;

    const canvasWidth = 360;
    const canvasHeight = 640;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujarSombraSinFondo = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarSombraSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarSombraSinFondo);

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
    }, 120);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [modalSombraOpen, autoPlaySombra]);

  useEffect(() => {
    if (!modalCompletadoOpen) return;

    const audio = audioCompletadoRef.current;
    const video = videoCompletadoRef.current;

    if (!audio) return;

    const terminarCierre = () => {
      setEstadoCompletado("terminado");
      setTextoCompletado(textoFinalCompletado);
      setIndiceCompletadoActivo(guionNovaCompletado.length - 1);
      setProgresoLineaCompletado(100);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarCierre);

    return () => {
      audio.removeEventListener("ended", terminarCierre);
    };
  }, [modalCompletadoOpen]);

  useEffect(() => {
    if (!modalCompletadoOpen || estadoCompletado !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioCompletadoRef.current;
      if (!audio) return;

      const estadoGuion = obtenerEstadoGuionFlexible(
        audio.currentTime,
        audio.duration,
        guionNovaCompletado,
        1.45,
      );

      setTextoCompletado(estadoGuion.texto);
      setIndiceCompletadoActivo(estadoGuion.indice);
      setProgresoLineaCompletado(estadoGuion.progresoLinea);
    }, 35);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [modalCompletadoOpen, estadoCompletado]);

  useEffect(() => {
    if (!modalCompletadoOpen) return;

    const video = videoCompletadoRef.current;
    const canvas = canvasCompletadoRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) return;

    const canvasWidth = 360;
    const canvasHeight = 640;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujarNovaCompletado = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarNovaCompletado);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoSinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoBlancoDeBordes(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarNovaCompletado);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalCompletadoOpen]);

  useEffect(() => {
    if (!modalCompletadoOpen || !autoPlayCompletado) return;

    const timeout = window.setTimeout(() => {
      setAutoPlayCompletado(false);
      iniciarCompletado();
    }, 120);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [modalCompletadoOpen, autoPlayCompletado]);

  const pausarTodoElContenido = () => {
    audioNovaRef.current?.pause();
    videoNovaRef.current?.pause();

    audioProfeRef.current?.pause();
    videoProfeRef.current?.pause();

    audioByteRef.current?.pause();
    videoByteRef.current?.pause();

    audioSombraRef.current?.pause();
    videoSombraRef.current?.pause();

    audioCompletadoRef.current?.pause();
    videoCompletadoRef.current?.pause();

    if (estadoExplicacion === "reproduciendo") {
      setEstadoExplicacion("pausado");
    }

    if (estadoProfe === "reproduciendo") {
      setEstadoProfe("pausado");
    }

    if (estadoByte === "reproduciendo") {
      setEstadoByte("pausado");
    }

    if (estadoSombra === "reproduciendo") {
      setEstadoSombra("pausado");
    }

    if (estadoCompletado === "reproduciendo") {
      setEstadoCompletado("pausado");
    }
  };

  const alternarPausaActividad = () => {
    if (actividadPausada) {
      setActividadPausada(false);
      return;
    }

    pausarTodoElContenido();
    setActividadPausada(true);
  };

  const pausarExplicacion = () => {
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    audio?.pause();
    video?.pause();

    if (estadoExplicacion === "reproduciendo") {
      setEstadoExplicacion("pausado");
    }
  };

  const iniciarExplicacion = async () => {
    if (actividadPausada) return;
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    if (!audio || !video) return;

    try {
      if (estadoExplicacion === "terminado" || audio.ended) {
        audio.currentTime = 0;
        video.currentTime = 0;
        setTextoBienvenida("");
      }

      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoExplicacion("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoExplicacion("pausado");
    }
  };

  const repetirExplicacion = async () => {
    if (actividadPausada) return;
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    if (!audio || !video) return;

    audio.pause();
    video.pause();

    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoBienvenida("");

    try {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoExplicacion("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoExplicacion("pausado");
    }
  };

  const abrirConsejoProfe = (reproducir = false) => {
    pausarExplicacion();
    setModalProfeOpen(true);

    if (reproducir) {
      setAutoPlayProfe(true);
    }
  };

  const pausarProfeAstro = () => {
    const audio = audioProfeRef.current;
    const video = videoProfeRef.current;

    audio?.pause();
    video?.pause();

    if (estadoProfe === "reproduciendo") {
      setEstadoProfe("pausado");
    }
  };

  const iniciarProfeAstro = async () => {
    if (actividadPausada) return;
    if (!modalProfeOpen) {
      abrirConsejoProfe(true);
      return;
    }

    const audio = audioProfeRef.current;
    const video = videoProfeRef.current;

    if (!audio || !video) return;

    try {
      if (estadoProfe === "terminado" || audio.ended) {
        audio.currentTime = 0;
        video.currentTime = 0;
        setTextoProfe("");
        setIndiceProfeActivo(-1);
        setProgresoLineaProfe(0);
      }

      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoProfe("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoProfe("pausado");
    }
  };

  const repetirProfeAstro = async () => {
    if (actividadPausada) return;
    if (!modalProfeOpen) {
      abrirConsejoProfe(true);
      return;
    }

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
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoProfe("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoProfe("pausado");
    }
  };

  const cerrarConsejoProfe = () => {
    pausarProfeAstro();
    setModalProfeOpen(false);
    setAutoPlayProfe(false);
  };

  const abrirPistasByte = () => {
    pausarExplicacion();
    pausarProfeAstro();
    pausarSombra();
    setModalByteOpen(true);
  };

  const seleccionarPistaByte = (pista: PistaByteId, reproducir = true) => {
    pausarByte();

    if (reinicioByteTimeoutRef.current) {
      window.clearTimeout(reinicioByteTimeoutRef.current);
      reinicioByteTimeoutRef.current = null;
    }

    setPistaByteSeleccionada(pista);
    setTextoByte("");
    setEstadoByte("inicio");
    setIndiceByteActivo(-1);
    setProgresoLineaByte(0);

    ultimoTextoByteRef.current = "";
    ultimoIndiceByteRef.current = -1;
    ultimoProgresoByteRef.current = 0;

    const audio = audioByteRef.current;
    const video = videoByteRef.current;

    if (audio) {
      audio.currentTime = 0;
      audio.load();
    }

    if (video) {
      video.currentTime = 0;
    }

    if (reproducir) {
      setAutoPlayByte(true);
    }
  };

  const pausarByte = () => {
    const audio = audioByteRef.current;
    const video = videoByteRef.current;

    if (reinicioByteTimeoutRef.current && estadoByte !== "terminado") {
      window.clearTimeout(reinicioByteTimeoutRef.current);
      reinicioByteTimeoutRef.current = null;
    }

    audio?.pause();
    video?.pause();

    if (estadoByte === "reproduciendo") {
      setEstadoByte("pausado");
    }
  };

  const iniciarByte = async () => {
    if (actividadPausada) return;
    if (!modalByteOpen) {
      abrirPistasByte();
      return;
    }

    if (!pistaByteActiva) {
      setPistaByteSeleccionada("triangulo");
      setAutoPlayByte(true);
      return;
    }

    const audio = audioByteRef.current;
    const video = videoByteRef.current;

    if (!audio || !video) return;

    try {
      if (reinicioByteTimeoutRef.current) {
        window.clearTimeout(reinicioByteTimeoutRef.current);
        reinicioByteTimeoutRef.current = null;
      }

      if (estadoByte === "terminado" || audio.ended) {
        audio.currentTime = 0;
        video.currentTime = 0;
        setTextoByte("");
        setIndiceByteActivo(-1);
        setProgresoLineaByte(0);

        ultimoTextoByteRef.current = "";
        ultimoIndiceByteRef.current = -1;
        ultimoProgresoByteRef.current = 0;
      }

      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoByte("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoByte("pausado");
    }
  };

  const repetirByte = async () => {
    if (actividadPausada) return;
    if (!modalByteOpen) {
      abrirPistasByte();
      return;
    }

    if (!pistaByteActiva) {
      setPistaByteSeleccionada("triangulo");
      setAutoPlayByte(true);
      return;
    }

    const audio = audioByteRef.current;
    const video = videoByteRef.current;

    if (!audio || !video) return;

    audio.pause();
    video.pause();

    if (reinicioByteTimeoutRef.current) {
      window.clearTimeout(reinicioByteTimeoutRef.current);
      reinicioByteTimeoutRef.current = null;
    }

    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoByte("");
    setIndiceByteActivo(-1);
    setProgresoLineaByte(0);

    ultimoTextoByteRef.current = "";
    ultimoIndiceByteRef.current = -1;
    ultimoProgresoByteRef.current = 0;

    try {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoByte("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoByte("pausado");
    }
  };

  const cerrarPistasByte = () => {
    pausarByte();

    if (reinicioByteTimeoutRef.current) {
      window.clearTimeout(reinicioByteTimeoutRef.current);
      reinicioByteTimeoutRef.current = null;
    }

    const audio = audioByteRef.current;
    const video = videoByteRef.current;

    if (audio) {
      audio.currentTime = 0;
    }

    if (video) {
      video.currentTime = 0;
      video.pause();
    }

    setModalByteOpen(false);
    setAutoPlayByte(false);
    setEstadoByte("inicio");
    setTextoByte("");
    setIndiceByteActivo(-1);
    setProgresoLineaByte(0);

    ultimoTextoByteRef.current = "";
    ultimoIndiceByteRef.current = -1;
    ultimoProgresoByteRef.current = 0;
  };

  const pausarSombra = () => {
    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;

    audio?.pause();
    video?.pause();

    if (estadoSombra === "reproduciendo") {
      setEstadoSombra("pausado");
    }
  };

  const abrirSombra = (reproducir = true) => {
    pausarExplicacion();
    pausarProfeAstro();
    pausarByte();
    pausarCompletado();
    setModalSombraOpen(true);

    if (reproducir) {
      setAutoPlaySombra(true);
    }
  };

  const iniciarSombra = async () => {
    if (actividadPausada) return;
    if (!modalSombraOpen) {
      abrirSombra(true);
      return;
    }

    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;

    if (!audio || !video) return;

    try {
      if (estadoSombra === "terminado" || audio.ended) {
        audio.currentTime = 0;
        video.currentTime = 0;
        setTextoSombra("");
        setIndiceSombraActivo(-1);
        setProgresoLineaSombra(0);
      }

      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoSombra("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoSombra("pausado");
    }
  };

  const repetirSombra = async () => {
    if (actividadPausada) return;
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
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoSombra("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoSombra("pausado");
    }
  };

  const cerrarSombra = () => {
    pausarSombra();

    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;

    if (audio) {
      audio.currentTime = 0;
    }

    if (video) {
      video.currentTime = 0;
      video.pause();
    }

    setModalSombraOpen(false);
    setAutoPlaySombra(false);
    setEstadoSombra("inicio");
    setTextoSombra("");
    setIndiceSombraActivo(-1);
    setProgresoLineaSombra(0);
  };

  const pausarCompletado = () => {
    const audio = audioCompletadoRef.current;
    const video = videoCompletadoRef.current;

    audio?.pause();
    video?.pause();

    if (estadoCompletado === "reproduciendo") {
      setEstadoCompletado("pausado");
    }
  };

  const abrirCompletado = (reproducir = true) => {
 mission.finishNative(); if(!mission.ready || !mission.allCorrect){mission.review();return;}

    pausarExplicacion();
    pausarProfeAstro();
    pausarByte();
    pausarSombra();
    setModalCompletadoOpen(true);

    if (reproducir) {
      setAutoPlayCompletado(true);
    }
  };

  const iniciarCompletado = async () => {
    if (actividadPausada) return;
    if (!modalCompletadoOpen) {
      abrirCompletado(true);
      return;
    }

    const audio = audioCompletadoRef.current;
    const video = videoCompletadoRef.current;

    if (!audio || !video) return;

    try {
      if (estadoCompletado === "terminado" || audio.ended) {
        audio.currentTime = 0;
        video.currentTime = 0;
        setTextoCompletado("");
        setIndiceCompletadoActivo(-1);
        setProgresoLineaCompletado(0);
      }

      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoCompletado("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoCompletado("pausado");
    }
  };

  const repetirCompletado = async () => {
    if (actividadPausada) return;
    const audio = audioCompletadoRef.current;
    const video = videoCompletadoRef.current;

    if (!audio || !video) return;

    audio.pause();
    video.pause();

    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoCompletado("");
    setIndiceCompletadoActivo(-1);
    setProgresoLineaCompletado(0);

    try {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoCompletado("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoCompletado("pausado");
    }
  };

  const cerrarCompletado = () => {
    pausarCompletado();

    const audio = audioCompletadoRef.current;
    const video = videoCompletadoRef.current;

    if (audio) {
      audio.currentTime = 0;
    }

    if (video) {
      video.currentTime = 0;
      video.pause();
    }

    setModalCompletadoOpen(false);
    setAutoPlayCompletado(false);
    setEstadoCompletado("inicio");
    setTextoCompletado("");
    setIndiceCompletadoActivo(-1);
    setProgresoLineaCompletado(0);
  };

  /*
    Se usa únicamente desde el modal de error.
    Reinicia las respuestas, pero CONSERVA el conteo de errores acumulado.
  */
  const volverAIntentarlo = () => {
 cerrarSombra(); setEstadoRevision("pendiente"); mission.beginCorrection();
 };

  /*
    Se usa para repetir completamente la actividad después de completarla.
    Aquí sí comienza una partida nueva y los errores regresan a cero.
  */
  const reiniciarActividad = () => {
    mission.reset();
    pilot.resetSession();
    cerrarCompletado();
    cerrarSombra();
    setSelecciones({
      triangulo: "",
      cuadrado: "",
      rectangulo: "",
    });
    setEstadoRevision("pendiente");
    setErrores(0);
    setSegundos(0);
  };

  const irASiguienteActividad = () => {
    pausarCompletado();
    navigate(RUTA_ACTIVIDAD_2);
  };

  const volverAActividades = () => {
    pausarCompletado();
    navigate(RUTA_ACTIVIDADES_GEOMETRIA);
  };

  const comprobarActividad = () => {
    pilot.recordAll();
    pausarExplicacion();
    pausarProfeAstro();
    pausarByte();

    if (todoCorrecto) {
      setEstadoRevision("correcto");
      abrirCompletado(true);
      return;
    }

    setEstadoRevision("falta");
    setErrores((cantidadActual) => cantidadActual + 1);
    abrirSombra(true);
  };
  const irARuta = (ruta: string) => {
    pausarExplicacion();
    pausarProfeAstro();
    pausarByte();
    pausarCompletado();
    pausarSombra();
    setMenuOpen(false);
    navigate(ruta, { replace: true });
  };

  const opciones = [
    {
      id: "triangulo" as OpcionId,
      letra: "A",
      nombre: "Triángulo",
      img: incisoTriangulo,
    },
    {
      id: "cuadrado" as OpcionId,
      letra: "B",
      nombre: "Cuadrado",
      img: incisoCuadrado,
    },
    {
      id: "rectangulo" as OpcionId,
      letra: "C",
      nombre: "Rectángulo",
      img: incisoRectangulo,
    },
  ];

  const figuras = [
    {
      id: "triangulo" as FiguraId,
      etiquetaAccesible: "Figura geométrica 1",
      img: trianguloFigura,
      correcta: "triangulo" as OpcionId,
    },
    {
      id: "cuadrado" as FiguraId,
      etiquetaAccesible: "Figura geométrica 2",
      img: cuadradoFigura,
      correcta: "cuadrado" as OpcionId,
    },
    {
      id: "rectangulo" as FiguraId,
      etiquetaAccesible: "Figura geométrica 3",
      img: rectanguloFigura,
      correcta: "rectangulo" as OpcionId,
    },
  ];

  const figurasCompletadas = figuras.filter(
    (figura) => selecciones[figura.id] === figura.correcta,
  ).length;

  const todoCorrecto = figurasCompletadas === figuras.length;

  const pilot=useGeometryEvidence("mathgeometry-actividad-1",mission,()=>({
      selecciones,
      errores,
    }));

  useAutoProgreso({
    completada: modalCompletadoOpen,
    codigo: "mathgeometry-actividad-1",
    mundo: "MathGeometry",
    tema: "Figuras geométricas",
    titulo: "El Constructor de Caminos",
    aciertos: figurasCompletadas + mission.correctCount,
    totalPreguntas: mission.total,
    tiempoSegundos: segundos,
    xpBase: 50,
    respuestas: pilot.evidence(),
  });

  const obtenerClaseLineaProfe = (indice: number) => {
    if (estadoProfe === "terminado") return "act1geo-transcript-line-done";
    if (indiceProfeActivo < 0) return "act1geo-transcript-line-pending";
    if (indice < indiceProfeActivo) return "act1geo-transcript-line-done";
    if (indice === indiceProfeActivo) return "act1geo-transcript-line-active";
    return "act1geo-transcript-line-pending";
  };

  const obtenerProgresoLineaProfe = (indice: number) => {
    if (estadoProfe === "terminado") return "100%";
    if (indiceProfeActivo < 0) return "0%";
    if (indice < indiceProfeActivo) return "100%";
    if (indice === indiceProfeActivo) return `${progresoLineaProfe}%`;
    return "0%";
  };

  const obtenerClaseLineaByte = (indice: number) => {
    if (estadoByte === "terminado") return "act1geo-byte-line-done";
    if (indiceByteActivo < 0) return "act1geo-byte-line-pending";
    if (indice < indiceByteActivo) return "act1geo-byte-line-done";
    if (indice === indiceByteActivo) return "act1geo-byte-line-active";
    return "act1geo-byte-line-pending";
  };

  const obtenerProgresoLineaByte = (indice: number) => {
    if (estadoByte === "terminado") return "100%";
    if (indiceByteActivo < 0) return "0%";
    if (indice < indiceByteActivo) return "100%";
    if (indice === indiceByteActivo) return `${progresoLineaByte}%`;
    return "0%";
  };

  const obtenerClaseLineaCompletado = (indice: number) => {
    if (estadoCompletado === "terminado") return "act1geo-complete-line-done";
    if (indiceCompletadoActivo < 0) return "act1geo-complete-line-pending";
    if (indice < indiceCompletadoActivo) return "act1geo-complete-line-done";
    if (indice === indiceCompletadoActivo)
      return "act1geo-complete-line-active";
    return "act1geo-complete-line-pending";
  };

  const obtenerProgresoLineaCompletado = (indice: number) => {
    if (estadoCompletado === "terminado") return "100%";
    if (indiceCompletadoActivo < 0) return "0%";
    if (indice < indiceCompletadoActivo) return "100%";
    if (indice === indiceCompletadoActivo) return `${progresoLineaCompletado}%`;
    return "0%";
  };

  const obtenerClaseLineaSombra = (indice: number) => {
    if (estadoSombra === "terminado") return "act1geo-sombra-line-done";
    if (indiceSombraActivo < 0) return "act1geo-sombra-line-pending";
    if (indice < indiceSombraActivo) return "act1geo-sombra-line-done";
    if (indice === indiceSombraActivo) return "act1geo-sombra-line-active";
    return "act1geo-sombra-line-pending";
  };

  const obtenerProgresoLineaSombra = (indice: number) => {
    if (estadoSombra === "terminado") return "100%";
    if (indiceSombraActivo < 0) return "0%";
    if (indice < indiceSombraActivo) return "100%";
    if (indice === indiceSombraActivo) return `${progresoLineaSombra}%`;
    return "0%";
  };

  return (
    <main
      className={`act1geo-page mn-activity ${actividadPausada ? "act1geo-paused" : ""}`}
    >
      <button
        type="button"
        className={`act1geo-hamburger-btn ${
          menuOpen ? "act1geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="act1geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`act1geo-sidebar ${menuOpen ? "act1geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act1geo-sidebar-logo" />

        <nav className="act1geo-sidebar-menu">
          <button
            type="button"
            className="act1geo-menu-item"
            onClick={() => irARuta(obtenerDashboardPrincipal())}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="act1geo-menu-item act1geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="act1geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="act1geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="act1geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="act1geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mn-sidebar-mission"><span>Tu misión</span><strong>{activityCurriculum["mathgeometry-actividad-1"].objective}</strong></div>
      </aside>

      <section className="act1geo-content">
        <img src={heroBanner} alt="Banner Actividad 1" className="act1geo-bg" />

        <section className="act1geo-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathgeometry-actividad-1"]} />
        


          <header className="act1geo-topbar">
            <div className="act1geo-title-area">
              <h1>Actividad 1 - El Constructor de Caminos</h1>

              <p className="act1geo-subtitle">
                Observa figuras básicas e identifica si son triángulos,
                cuadrados o rectángulos.
              </p>

              <div className="act1geo-pills">
                <span>Introducción</span>
                <span>8–12 min</span>
                <span>Conteo de errores</span>
              </div>
            </div>

            <div className="act1geo-actions-top">
              <button type="button" onClick={alternarPausaActividad}>
                {actividadPausada ? <FiPlay /> : <FiPause />}
                {actividadPausada ? "Continuar" : "Pausar"}
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
            className={`act1geo-intro-row ${
              estadoExplicacion === "reproduciendo"
                ? "act1geo-intro-playing"
                : ""
            }`}
          >
            <div className="act1geo-nova-stage">
              <video
                ref={videoNovaRef}
                src={videoNovaExplicando}
                className="act1geo-nova-source-video"
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
              />

              <canvas
                ref={canvasNovaRef}
                className="act1geo-nova-canvas"
                role="img"
                aria-label="Nova explicando la actividad"
              />

              <span className="act1geo-nova-shadow"></span>
            </div>

            <article className="act1geo-speech-cloud">
              <div className="act1geo-speech-main">
                <span className="act1geo-cloud-label">Nova explica</span>

                <p>
                  {textoBienvenida || textoInicialBienvenida}

                  {estadoExplicacion === "reproduciendo" && (
                    <span className="act1geo-typing-cursor"></span>
                  )}
                </p>
              </div>

              <div
                className="act1geo-nova-mini-controls"
                aria-label="Controles de audio de Nova"
              >
                <span
                  className="act1geo-nova-control-glow"
                  aria-hidden="true"
                ></span>

                <button
                  type="button"
                  className="act1geo-nova-control-btn act1geo-nova-control-play"
                  onClick={iniciarExplicacion}
                  aria-label="Reproducir explicación"
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  className="act1geo-nova-control-btn act1geo-nova-control-pause"
                  onClick={pausarExplicacion}
                  aria-label="Pausar explicación"
                >
                  <FiPause />
                </button>

                <button
                  type="button"
                  className="act1geo-nova-control-btn act1geo-nova-control-repeat"
                  onClick={repetirExplicacion}
                  aria-label="Repetir explicación"
                >
                  <FiRotateCcw />
                </button>
              </div>
            </article>

            <audio ref={audioNovaRef} src={audioBienvenida} preload="auto" />
          </section>

          <EnsayoOtrosMundos activityId="mathgeometry-actividad-1"/>
<section className="act1geo-layout">
            <article className="act1geo-board">
              {actividadPausada && (
                <div className="act1geo-activity-pause-overlay">
                  <FiPause />
                  <strong>Actividad pausada</strong>
                  <span>Presiona Continuar para seguir.</span>
                </div>
              )}

              <h2>Observa cada figura y elige su nombre correcto</h2>

              <div className="act1geo-rows">
                {figuras.map((figura) => (
                  <div className="act1geo-row" key={figura.id}>
                    <div className="act1geo-figure-card">
                      <img src={figura.img} alt={figura.etiquetaAccesible} />
                    </div>

                    <div className="act1geo-options">
                      {opciones.map((opcion) => {
                        const seleccionada =
                          selecciones[figura.id] === opcion.id;
                        const correcta = figura.correcta === opcion.id;

                        return (
                          <button
                            type="button"
                            key={opcion.id}
                            className={`act1geo-option-card ${
                              seleccionada ? "act1geo-selected" : ""
                            } ${
                              seleccionada && correcta ? "act1geo-correct" : ""
                            }`}
                            disabled={actividadPausada || (mission.correctOnly && selecciones[figura.id]===figura.correcta)}
                            onClick={() => {
                              if (actividadPausada || (mission.correctOnly && selecciones[figura.id] === figura.correcta)) return;
                              setEstadoRevision("pendiente");
                              setSelecciones((prev) => ({
                                ...prev,
                                [figura.id]: opcion.id,
                              }));
                            }}
                          >
                            <div className="act1geo-option-head">
                              <span>{opcion.letra}</span>
                              <strong>{opcion.nombre}</strong>

                              {seleccionada && correcta && (
                                <b>
                                  <FiCheck />
                                </b>
                              )}
                            </div>

                            <div className="act1geo-option-img-wrap">
                              <img src={opcion.img} alt={opcion.nombre} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <aside className="act1geo-right-panel">
              <article
                className={`act1geo-tip-card act1geo-profe-open-card ${
                  estadoProfe === "reproduciendo"
                    ? "act1geo-profe-card-playing"
                    : ""
                }`}
                role="button"
                tabIndex={0}
                onClick={() => abrirConsejoProfe(false)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    abrirConsejoProfe(false);
                  }
                }}
              >
                <img src={profesorPista} alt="Profesor Astro" />

                <div className="act1geo-profe-card-info">
                  <h3>Consejo del Profesor Astro</h3>

                  <div
                    className="act1geo-profe-card-controls"
                    aria-label="Controles del consejo del profesor"
                  >
                    <button
                      type="button"
                      className="act1geo-profe-mini-btn act1geo-profe-mini-play"
                      onClick={(evento) => {
                        evento.stopPropagation();
                        abrirConsejoProfe(true);
                      }}
                      aria-label="Reproducir consejo"
                    >
                      <FiPlay />
                    </button>

                    <button
                      type="button"
                      className="act1geo-profe-mini-btn"
                      onClick={(evento) => {
                        evento.stopPropagation();
                        pausarProfeAstro();
                      }}
                      aria-label="Pausar consejo"
                    >
                      <FiPause />
                    </button>

                    <button
                      type="button"
                      className="act1geo-profe-mini-btn act1geo-profe-mini-repeat"
                      onClick={(evento) => {
                        evento.stopPropagation();
                        repetirProfeAstro();
                      }}
                      aria-label="Reiniciar consejo"
                    >
                      <FiRotateCcw />
                    </button>
                  </div>

                  <span>Toca la tarjeta para ver la explicación</span>
                </div>
              </article>

              <article className="act1geo-tip-card">
                <img src={sombraConfusion} alt="Sombra confusión" />

                <div>
                  <h3>¡Cuidado con Sombra!</h3>

                  <p>
                    No confundas las figuras. Observa bien cuántos lados y
                    esquinas tiene cada una.
                  </p>
                </div>
              </article>

              <article
                className={`act1geo-tip-card act1geo-byte-open-card ${
                  estadoByte === "reproduciendo"
                    ? "act1geo-byte-card-playing"
                    : ""
                }`}
                role="button"
                tabIndex={0}
                onClick={abrirPistasByte}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    abrirPistasByte();
                  }
                }}
              >
                <img src={bytePista} alt="Byte pista" />

                <div className="act1geo-byte-card-info">
                  <h3>Pista de Byte</h3>

                  <p>Elige una pista para triángulo, cuadrado o rectángulo.</p>

                  <button
                    type="button"
                    className="act1geo-byte-card-button"
                    onClick={(evento) => {
                      evento.stopPropagation();
                      abrirPistasByte();
                    }}
                  >
                    <FiPlay /> Ver pista
                  </button>
                </div>
              </article>

              <div
                className={`act1geo-answer-box ${
                  todoCorrecto ? "act1geo-answer-ok" : ""
                }`}
              >
                <FiCheck />

                <span>
                  {estadoRevision === "falta"
                    ? "Aún faltan respuestas correctas"
                    : todoCorrecto
                      ? "Todo correcto, comprueba tu misión"
                      : "Selecciona las figuras correctas"}
                </span>
              </div>

              <button
                type="button"
                className="act1geo-check-btn"
                onClick={comprobarActividad}
                disabled={actividadPausada}
              >
                {todoCorrecto ? "Verificar misión" : "Comprobar"}
              </button>
            </aside>
          </section>
 


          <section className="act1geo-bottom-stats">
            <article>
              <FiFlag />

              <div>
                <span>Figuras completadas</span>
                <strong>{figurasCompletadas}/3</strong>
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
                <strong>{formatearTiempo(segundos)}</strong>
              </div>
            </article>

            <article className="act1geo-xp-card">
              <span className="act1geo-star">★</span>

              <div>
                <span>XP</span>
                <strong>40</strong>
              </div>
            </article>
          </section>
        <PilotEvidenceStatus pilot={pilot}/>
        <ContinuacionDeMision expansion={mission} onComplete={()=>{setModalCompletadoOpen(true);}} onRestart={reiniciarActividad}/>
</section>

        {modalProfeOpen && (
          <div
            className="act1geo-profe-modal-overlay"
            onClick={cerrarConsejoProfe}
          >
            <section
              className={`act1geo-profe-modal ${
                estadoProfe === "reproduciendo"
                  ? "act1geo-profe-modal-playing"
                  : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act1geo-profe-modal-title"
            >
              <button
                type="button"
                className="act1geo-profe-close"
                onClick={cerrarConsejoProfe}
                aria-label="Cerrar consejo"
              >
                <FiX />
              </button>

              <div className="act1geo-profe-modal-hero">
                <video
                  ref={videoProfeRef}
                  src={videoProfeAstro}
                  className="act1geo-profe-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasProfeRef}
                  className="act1geo-profe-canvas"
                  role="img"
                  aria-label="Profesor Astro explicando el consejo"
                />

                <span className="act1geo-profe-planet"></span>
              </div>

              <div className="act1geo-profe-modal-content">
                <span className="act1geo-profe-modal-badge">
                  <FiVolume2 /> Consejo del Profesor Astro
                </span>

                <h2 id="act1geo-profe-modal-title">Observa antes de elegir</h2>

                <div className="act1geo-profe-cloud">
                  <span className="act1geo-profe-cloud-dot act1geo-profe-cloud-dot-one"></span>
                  <span className="act1geo-profe-cloud-dot act1geo-profe-cloud-dot-two"></span>

                  <p>
                    {textoProfe || textoInicialProfe}
                    {estadoProfe === "reproduciendo" && (
                      <span className="act1geo-typing-cursor"></span>
                    )}
                  </p>
                </div>

                <div className="act1geo-profe-modal-controls">
                  <button
                    type="button"
                    className="act1geo-profe-modal-play"
                    onClick={iniciarProfeAstro}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button type="button" onClick={pausarProfeAstro}>
                    <FiPause /> Pausar
                  </button>

                  <button type="button" onClick={repetirProfeAstro}>
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>
              </div>

              <article className="act1geo-profe-transcript">
                <h3>Texto completo</h3>

                {guionProfeAstro.map((linea, indice) => (
                  <p
                    key={linea}
                    className={obtenerClaseLineaProfe(indice)}
                    style={
                      {
                        "--progreso-linea": obtenerProgresoLineaProfe(indice),
                      } as CSSProperties
                    }
                  >
                    {linea}
                  </p>
                ))}
              </article>

              <audio ref={audioProfeRef} src={audioProfeAstro} preload="auto" />
            </section>
          </div>
        )}

        {modalByteOpen && (
          <div className="act1geo-bytefix-overlay" onClick={cerrarPistasByte}>
            <section
              className={`act1geo-bytefix-modal ${
                estadoByte === "reproduciendo" ? "act1geo-bytefix-playing" : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act1geo-byte-modal-title"
            >
              <button
                type="button"
                className="act1geo-bytefix-close"
                onClick={cerrarPistasByte}
                aria-label="Cerrar pistas de Byte"
              >
                <FiX />
              </button>

              <div className="act1geo-bytefix-hero">
                <video
                  ref={videoByteRef}
                  src={videoBytePistas}
                  className="act1geo-bytefix-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasByteRef}
                  className="act1geo-bytefix-canvas"
                  role="img"
                  aria-label="Byte dando una pista"
                />

                <span className="act1geo-bytefix-orbit"></span>
                <span className="act1geo-bytefix-dot act1geo-bytefix-dot-one"></span>
                <span className="act1geo-bytefix-dot act1geo-bytefix-dot-two"></span>
              </div>

              <div className="act1geo-bytefix-content">
                <span className="act1geo-bytefix-badge">
                  <FiVolume2 /> Pista de Byte
                </span>

                <h2 id="act1geo-byte-modal-title">
                  {pistaByteActiva
                    ? pistaByteActiva.tituloModal
                    : "¿Qué pista necesitas?"}
                </h2>

                <div className="act1geo-bytefix-choice-grid">
                  {ordenPistasByte.map((pista) => (
                    <button
                      type="button"
                      key={pista}
                      className={`act1geo-bytefix-choice-btn ${
                        pistaByteSeleccionada === pista
                          ? "act1geo-bytefix-choice-active"
                          : ""
                      }`}
                      onClick={() => seleccionarPistaByte(pista, true)}
                    >
                      <strong>{pistasByte[pista].nombre}</strong>
                      <span>{pistasByte[pista].etiqueta}</span>
                    </button>
                  ))}
                </div>

                <div className="act1geo-bytefix-cloud">
                  <span className="act1geo-bytefix-cloud-bubble act1geo-bytefix-cloud-bubble-one"></span>
                  <span className="act1geo-bytefix-cloud-bubble act1geo-bytefix-cloud-bubble-two"></span>
                  <span className="act1geo-bytefix-cloud-bubble act1geo-bytefix-cloud-bubble-three"></span>

                  <p>
                    {pistaByteActiva
                      ? textoByte ||
                        `Presiona reproducir para escuchar la ${pistaByteActiva.tituloModal.toLowerCase()}.`
                      : textoInicialByte}
                    {estadoByte === "reproduciendo" && (
                      <span className="act1geo-typing-cursor"></span>
                    )}
                  </p>
                </div>

                <div className="act1geo-bytefix-controls">
                  <button
                    type="button"
                    className="act1geo-bytefix-play"
                    onClick={iniciarByte}
                    disabled={!pistaByteActiva}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button
                    type="button"
                    onClick={pausarByte}
                    disabled={!pistaByteActiva}
                  >
                    <FiPause /> Pausar
                  </button>

                  <button
                    type="button"
                    onClick={repetirByte}
                    disabled={!pistaByteActiva}
                  >
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>
              </div>

              <article className="act1geo-bytefix-transcript">
                <h3>
                  {pistaByteActiva ? "Texto de la pista" : "Elige una pista"}
                </h3>

                {pistaByteActiva ? (
                  pistaByteActiva.guion.map((linea, indice) => (
                    <p
                      key={linea}
                      className={obtenerClaseLineaByte(indice)}
                      style={
                        {
                          "--progreso-byte": obtenerProgresoLineaByte(indice),
                        } as CSSProperties
                      }
                    >
                      {linea}
                    </p>
                  ))
                ) : (
                  <div className="act1geo-bytefix-empty-help">
                    <strong>Selecciona una figura</strong>
                    <span>
                      Byte cambiará la explicación, la voz y el texto según la
                      pista.
                    </span>
                  </div>
                )}
              </article>

              <audio
                ref={audioByteRef}
                src={pistaByteActiva?.audio || ""}
                preload="auto"
              />
            </section>
          </div>
        )}

        {modalSombraOpen && (
          <div className="act1geo-sombra-modal-overlay" onClick={cerrarSombra}>
            <section
              className={`act1geo-sombra-modal ${
                estadoSombra === "reproduciendo"
                  ? "act1geo-sombra-modal-playing"
                  : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act1geo-sombra-title"
            >
              <div className="act1geo-sombra-decoration" aria-hidden="true">
                <span className="act1geo-sombra-glow act1geo-sombra-glow-one"></span>
                <span className="act1geo-sombra-glow act1geo-sombra-glow-two"></span>
                <span className="act1geo-sombra-dot act1geo-sombra-dot-one"></span>
                <span className="act1geo-sombra-dot act1geo-sombra-dot-two"></span>
                <span className="act1geo-sombra-dot act1geo-sombra-dot-three"></span>
              </div>

              <button
                type="button"
                className="act1geo-sombra-close"
                onClick={cerrarSombra}
                aria-label="Cerrar mensaje de Sombra"
              >
                <FiX />
              </button>

              <div className="act1geo-sombra-hero">
                <video
                  ref={videoSombraRef}
                  src={videoSombraError}
                  className="act1geo-sombra-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasSombraRef}
                  className="act1geo-sombra-canvas"
                  role="img"
                  aria-label="Sombra animando un mensaje para volver a intentar"
                />

                <span className="act1geo-sombra-orbit"></span>
              </div>

              <div className="act1geo-sombra-content">
 <DetalleErroresDeMision items={[...(figuras.map((f,i)=>({id:f.id,title:`Figura ${i+1}`,answer:selecciones[f.id],correct:selecciones[f.id]===f.correcta,hint:"Cuenta los lados, compara sus longitudes y revisa los ángulos antes de elegir el nombre.",target:".act1geo-layout"}))),...mission.items]} onCorrect={(item)=>{cerrarSombra(); setEstadoRevision("pendiente"); mission.beginCorrection(item);}} onRestart={reiniciarActividad}/>

                <span className="act1geo-sombra-badge">
                  <FiVolume2 /> Mensaje de Sombra
                </span>

                <h2 id="act1geo-sombra-title">Casi lo logras</h2>

                <div className="act1geo-sombra-cloud">
                  <span className="act1geo-sombra-cloud-dot act1geo-sombra-cloud-dot-one"></span>
                  <span className="act1geo-sombra-cloud-dot act1geo-sombra-cloud-dot-two"></span>

                  <p>
                    {textoSombra || textoInicialSombra}
                    {estadoSombra === "reproduciendo" && (
                      <span className="act1geo-typing-cursor"></span>
                    )}
                  </p>
                </div>

                <div className="act1geo-sombra-controls">
                  <button
                    type="button"
                    className="act1geo-sombra-play"
                    onClick={iniciarSombra}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button type="button" onClick={pausarSombra}>
                    <FiPause /> Pausar
                  </button>

                  <button type="button" onClick={repetirSombra}>
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>

                <button
                  type="button"
                  className="act1geo-sombra-try-btn"
                  onClick={volverAIntentarlo}
                >
                  Volver a intentarlo
                </button>
              </div>

              <aside className="act1geo-sombra-transcript">
                <h3>Texto completo</h3>

                {guionSombraError.map((linea, indice) => (
                  <p
                    key={linea}
                    className={obtenerClaseLineaSombra(indice)}
                    style={
                      {
                        "--progreso-sombra": obtenerProgresoLineaSombra(indice),
                      } as CSSProperties
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

        {modalCompletadoOpen && (
          <div
            className="act1geo-complete-modal-overlay"
            onClick={cerrarCompletado}
          >
            <section
              className={`act1geo-complete-modal ${
                estadoCompletado === "reproduciendo"
                  ? "act1geo-complete-modal-playing"
                  : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act1geo-complete-title"
            >
              <img
                src={bannerCompletado}
                alt="Trofeo de actividad completada"
                className="act1geo-complete-bg-image"
                aria-hidden="true"
              />

              <div className="act1geo-complete-party" aria-hidden="true">
                <span className="act1geo-complete-confetti act1geo-complete-confetti-one"></span>
                <span className="act1geo-complete-confetti act1geo-complete-confetti-two"></span>
                <span className="act1geo-complete-confetti act1geo-complete-confetti-three"></span>
                <span className="act1geo-complete-confetti act1geo-complete-confetti-four"></span>
                <span className="act1geo-complete-confetti act1geo-complete-confetti-five"></span>
                <span className="act1geo-complete-confetti act1geo-complete-confetti-six"></span>
                <span className="act1geo-complete-confetti act1geo-complete-confetti-seven"></span>
                <span className="act1geo-complete-confetti act1geo-complete-confetti-eight"></span>
                <span className="act1geo-complete-confetti act1geo-complete-confetti-nine"></span>
                <span className="act1geo-complete-confetti act1geo-complete-confetti-ten"></span>
                <span className="act1geo-complete-floating-star act1geo-complete-floating-star-one">
                  ★
                </span>
                <span className="act1geo-complete-floating-star act1geo-complete-floating-star-two">
                  ★
                </span>
                <span className="act1geo-complete-floating-star act1geo-complete-floating-star-three">
                  ★
                </span>
              </div>

              <button
                type="button"
                className="act1geo-complete-close"
                onClick={cerrarCompletado}
                aria-label="Cerrar misión completada"
              >
                <FiX />
              </button>

              <div className="act1geo-complete-hero">
                <span className="act1geo-complete-check">
                  <FiCheck />
                </span>

                <video
                  ref={videoCompletadoRef}
                  src={videoNovaExplicando}
                  className="act1geo-complete-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasCompletadoRef}
                  className="act1geo-complete-canvas"
                  role="img"
                  aria-label="Nova celebrando la actividad completada"
                />

                <span className="act1geo-complete-orbit"></span>
                <span className="act1geo-complete-spark act1geo-complete-spark-one"></span>
                <span className="act1geo-complete-spark act1geo-complete-spark-two"></span>
              </div>

              <div className="act1geo-complete-content"><AudioRetroalimentacion/>
                <span className="act1geo-complete-badge">
                  <GiTrophyCup /> Actividad completada
                </span>

                <h2 id="act1geo-complete-title">¡Misión completada!</h2>

                <div className="act1geo-complete-cloud">
                  <span className="act1geo-complete-cloud-dot act1geo-complete-cloud-dot-one"></span>
                  <span className="act1geo-complete-cloud-dot act1geo-complete-cloud-dot-two"></span>

                  <p>
                    {textoCompletado || textoInicialCompletado}
                    {estadoCompletado === "reproduciendo" && (
                      <span className="act1geo-typing-cursor"></span>
                    )}
                  </p>
                </div>

                <div className="act1geo-complete-controls">
                  <button
                    type="button"
                    className="act1geo-complete-play"
                    onClick={iniciarCompletado}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button type="button" onClick={pausarCompletado}>
                    <FiPause /> Pausar
                  </button>

                  <button type="button" onClick={repetirCompletado}>
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>

                <div className="act1geo-complete-summary">
                  <article>
                    <FiCheck />
                    <div>
                      <span>Aciertos</span>
                      <strong>{mission.total}/{mission.total}</strong>
                    </div>
                  </article>

                  <article>
                    <FiTarget />
                    <div>
                      <span>Precisión</span>
                      <strong>100%</strong>
                    </div>
                  </article>

                  <article>
                    <span className="act1geo-complete-star">★</span>
                    <div>
                      <span>Recompensa</span>
                      <strong>+50 pts</strong>
                    </div>
                  </article>
                </div>
              </div>

              <aside className="act1geo-complete-side">
                <article className="act1geo-complete-transcript">
                  <h3>Texto completo</h3>

                  {guionNovaCompletado.map((linea, indice) => (
                    <p
                      key={linea}
                      className={obtenerClaseLineaCompletado(indice)}
                      style={
                        {
                          "--progreso-complete":
                            obtenerProgresoLineaCompletado(indice),
                        } as CSSProperties
                      }
                    >
                      {linea}
                    </p>
                  ))}
                </article>

                <div className="act1geo-complete-actions">
                  <button
                    type="button"
                    className="act1geo-complete-next"
                    onClick={irASiguienteActividad}
                  >
                    <FiArrowRight /> Siguiente actividad
                  </button>

                  <button type="button" onClick={reiniciarActividad}>
                    <FiRotateCcw /> Repetir actividad
                  </button>

                  <button type="button" onClick={volverAActividades}>
                    <FiLogOut /> Volver a actividades
                  </button>
                </div>
              </aside>

              <audio
                ref={audioCompletadoRef}
                src={audioNovaCompletado}
                preload="auto"
              />
            </section>
          </div>
        )}

        <footer className="act1geo-footer">
          <div className="act1geo-footer-icons">
            <button
              type="button"
              onClick={() => irARuta(obtenerDashboardPrincipal())}
            >
              <FiLogOut />
            </button>

            <FiHelpCircle />
            <FiSettings />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Actividad1MathGeometry;
