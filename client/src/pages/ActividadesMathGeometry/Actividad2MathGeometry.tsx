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
import "./Actividad2MathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividad2/hero-banner-act2-mathgeometry.png";
import byteAct2 from "../../assets/mathGeometry/actividad2/byte-act2-mathgeometry.png";
import profesorExplicando from "../../assets/mathGeometry/actividad2/profesor-explicando.png";
import sombraError from "../../assets/mathGeometry/actividad2/sombra-error.png";
import mapaPuente from "../../assets/mathGeometry/actividad2/act2-mathgeometry-puente.png";
import mapaPuenteCompleto from "../../assets/mathGeometry/actividad2/act_2_puente_2_MathGeometry.png";
import piezaCamino3 from "../../assets/mathGeometry/actividad2/pieza-camino-3-mathgeometry.png";
import piezaCamino2 from "../../assets/mathGeometry/actividad2/pieza-camino-2-mathgeometry.png";
import piezaCamino1 from "../../assets/mathGeometry/actividad2/pieza-camino-1-mathgeometry.png";
import piezaCamino1DerechaRota from "../../assets/mathGeometry/actividad2/pieza_camino_1_derecha_rota_MathGeometry.png";
import piezaCamino1IzquierdaRota from "../../assets/mathGeometry/actividad2/pieza_camino_1_izquierda_rota_MathGeometry.png";
import piezaCamino2DerechaRota from "../../assets/mathGeometry/actividad2/pieza_camino_2_derecha_rota_MathGeometry.png";
import piezaCamino2IzquierdaRota from "../../assets/mathGeometry/actividad2/pieza_camino_2_izquierda_rota_MathGeometry.png";

import audioBienvenidaNova from "../../assets/mathGeometry/actividad2/act_2_nova_bienvenidaa_MathGeometry.mp3";
import videoNovaExplicando from "../../assets/mathGeometry/actividad2/nova_explicando_act_2_MathGeometry.mp4";
import videoNovaPuente from "../../assets/mathGeometry/actividad2/act_2_nova_pasando_el_puente_MathGeometry.mp4";
import videoBytePistasAct2 from "../../assets/mathGeometry/actividad2/byte_aciertos_y_pistas_act_2__MathGeometry.mp4";
import videoProfesorPistasAct2 from "../../assets/mathGeometry/actividad2/instrucciones_profe_astro_act_2_MathGeometry.mp4";
import audioProfesorAstro from "../../assets/mathGeometry/actividad2/act_2_profesor_astro_MathGeometry.mp3";

import audioPistaByteDiagonal from "../../assets/mathGeometry/actividad2/act_2_byte_pista_diagonal_MathGeometry.mp3";
import audioPistaByteRecto from "../../assets/mathGeometry/actividad2/act_2_pista_byte_camino_recto_MathGeometry.mp3";
import audioPistaProfesorGiro from "../../assets/mathGeometry/actividad2/act_2_pista_profesor_para_camino_con_giro_MathGeometry.mp3";
import videoSombraErrorAct2 from "../../assets/mathGeometry/actividad2/sombra_error_act_2_MathGeometry.mp4";
import audioSombraErrorAct2 from "../../assets/mathGeometry/actividad2/act_2_sombra_error_MathGeometry.mp3";
import audioCierreNovaAct2 from "../../assets/mathGeometry/actividad2/act_2_cierre_nova_MathGeometry.mp3";
import bannerCompletadoAct2 from "../../assets/mathGeometry/actividad2/activida_completada_banner_MathGeometry.png";

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

import { FaStar } from "react-icons/fa";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

type SegmentoId = "pieza3" | "pieza2" | "pieza1";
type EstadoExplicacion = "inicio" | "reproduciendo" | "pausado" | "terminado";
type EstadoPuenteAct2 =
  | "reposo"
  | "corriendo-correcto"
  | "corriendo-error"
  | "finalizado-correcto"
  | "finalizado-error";
type PistaAct2Id = "recto" | "giro" | "diagonal";
type PersonajePistaAct2 = "byte" | "profesor";

type SessionUser = {
  rol?: string;
  role?: string;
  tipo_usuario?: string;
  role_id?: number | string;
  roleId?: number | string;
  id_rol?: number | string;
};

const VELOCIDAD_TEXTO_NOVA_ACT2 = 1.55;
const VELOCIDAD_TEXTO_PISTA_ACT2 = 1.75;
const REFRESCO_TEXTO_PISTA_ACT2_MS = 45;

const DURACION_PUENTE_CORRECTO_ACT2_MS = 2700;
const DURACION_PUENTE_ERROR_ACT2_MS = 3350;
const TIEMPO_RUPTURA_PUENTE_ERROR_ACT2_MS = 1180;
const MINIMO_RESTANTE_PUENTE_ACT2_MS = 280;

const pistasAct2: Record<
  PistaAct2Id,
  {
    id: PistaAct2Id;
    nombre: string;
    tituloModal: string;
    etiqueta: string;
    personaje: PersonajePistaAct2;
    audio: string;
    video: string;
    guion: string[];
  }
> = {
  recto: {
    id: "recto",
    nombre: "Camino recto",
    tituloModal: "Pista para camino recto",
    etiqueta: "Byte",
    personaje: "byte",
    audio: audioPistaByteRecto,
    video: videoBytePistasAct2,
    guion: [
      "Byte:",
      "Pista de análisis:",
      "Si el camino es recto, busca un segmento que tenga la misma dirección.",
      "Puede ser horizontal o vertical.",
      "El segmento correcto debe tocar los dos puntos marcados.",
    ],
  },
  giro: {
    id: "giro",
    nombre: "Camino con giro",
    tituloModal: "Pista para camino con giro",
    etiqueta: "Profesor Astro",
    personaje: "profesor",
    audio: audioPistaProfesorGiro,
    video: videoProfesorPistasAct2,
    guion: [
      "Profesor Astro:",
      "Pista importante:",
      "Observa dónde termina el primer tramo del camino.",
      "El siguiente segmento debe empezar ahí y conectar con el próximo punto.",
      "Así la ruta podrá continuar.",
    ],
  },
  diagonal: {
    id: "diagonal",
    nombre: "Ruta diagonal",
    tituloModal: "Pista para ruta diagonal",
    etiqueta: "Byte",
    personaje: "byte",
    audio: audioPistaByteDiagonal,
    video: videoBytePistasAct2,
    guion: [
      "Byte:",
      "Pista diagonal:",
      "Mira la inclinación del camino.",
      "El segmento correcto debe estar inclinado igual y unir exactamente los dos puntos.",
      "No todos los segmentos diagonales encajan.",
    ],
  },
};

const ordenPistasAct2: PistaAct2Id[] = ["recto", "giro", "diagonal"];

const textoInicialPistaAct2 =
  "Elige una pista para saber qué tramo conecta mejor la ruta.";

const guionProfesorAstroAct2 = [
  "Profesor Astro:",
  "En la pantalla verás una ruta incompleta.",
  "Tu misión será observar los puntos marcados y elegir el segmento que los conecta correctamente.",
  "Recuerda: un segmento es una línea que une dos puntos.",
  "Fíjate bien en tres cosas:",
  "dónde empieza, dónde termina y hacia dónde va.",
  "Cuando elijas el segmento correcto, el camino se completará y Nova podrá avanzar.",
];

const textoInicialProfesorAstroAct2 =
  "Presiona reproducir para escuchar la explicación del Profesor Astro.";

const textoFinalProfesorAstroAct2 =
  "Cuando elijas el segmento correcto, el camino se completará y Nova podrá avanzar.";

const guionBienvenidaNova = [
  {
    inicio: 0,
    fin: 2.5,
    texto: "¡Hola, explorador!",
  },
  {
    inicio: 2.5,
    fin: 5.8,
    texto: "Hoy tenemos una nueva misión dentro de MathNova.",
  },
  {
    inicio: 5.8,
    fin: 10.0,
    texto:
      "Una parte del camino se perdió y necesito tu ayuda para poder avanzar.",
  },
  {
    inicio: 10.0,
    fin: 14.0,
    texto: "En el mapa verás puntos marcados y un espacio vacío en la ruta.",
  },
  {
    inicio: 14.0,
    fin: 19.8,
    texto:
      "Tu tarea será elegir el segmento correcto para unir los puntos y reconstruir el camino.",
  },
  {
    inicio: 19.8,
    fin: 24.5,
    texto:
      "Observa con atención, compara las opciones y ayúdame a llegar al destino.",
  },
  {
    inicio: 24.5,
    fin: 27.6,
    texto: "¡Vamos a recuperar la ruta perdida!",
  },
];

const textoInicialBienvenidaNova =
  "Presiona iniciar para escuchar la explicación de Nova.";

const textoFinalBienvenidaNova = "¡Vamos a recuperar la ruta perdida!";

const guionSombraErrorAct2 = [
  "Mmm… casi lo logras.",
  "Observa otra vez los puntos de unión.",
  "Tal vez el segmento no llega al otro punto o va en otra dirección.",
  "No pasa nada si te equivocas.",
  "Mira con calma y vuelve a intentarlo.",
];

const textoInicialSombraAct2 =
  "Presiona reproducir para escuchar el mensaje de Sombra.";

const textoFinalSombraAct2 = "Mira con calma y vuelve a intentarlo.";

const guionCompletadoAct2 = [
  "¡Misión completada!",
  "Hoy reconstruiste rutas usando segmentos de recta.",
  "Aprendiste que un segmento une dos puntos y que debe coincidir con la dirección del camino.",
  "Cada ruta completada quedó registrada como evidencia de tu avance.",
  "¡Muy buen trabajo, explorador! Nos vemos en la siguiente misión de MathNova.",
];

const textoInicialCompletadoAct2 =
  "Presiona reproducir para escuchar el cierre de Nova.";

const textoFinalCompletadoAct2 =
  "¡Muy buen trabajo, explorador! Nos vemos en la siguiente misión de MathNova.";

function obtenerTextoNovaAct2PorTiempo(tiempo: number) {
  const lineaActual =
    guionBienvenidaNova.find(
      (linea) => tiempo >= linea.inicio && tiempo < linea.fin,
    ) || guionBienvenidaNova[guionBienvenidaNova.length - 1];

  const duracion = lineaActual.fin - lineaActual.inicio;
  const progreso = Math.min(
    1,
    Math.max(
      0,
      ((tiempo - lineaActual.inicio) / duracion) * VELOCIDAD_TEXTO_NOVA_ACT2,
    ),
  );

  const letrasVisibles = Math.max(
    1,
    Math.floor(lineaActual.texto.length * progreso),
  );

  return lineaActual.texto.slice(0, letrasVisibles);
}

function obtenerEstadoGuionPistaAct2(
  tiempo: number,
  duracionAudio: number,
  guion: string[],
) {
  const duracionSegura =
    Number.isFinite(duracionAudio) && duracionAudio > 0 ? duracionAudio : 13;

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
        progresoNatural * VELOCIDAD_TEXTO_PISTA_ACT2,
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

function limpiarFondoClaroNovaAct2(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  try {
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
  } catch {
    /* Si el navegador no permite leer el frame, se deja el video dibujado. */
  }
}

function dibujarVideoNovaAct2SinEstirar(
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

function formatearTiempoAct2(segundos: number) {
  const minutos = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");

  const segundosRestantes = (segundos % 60)
    .toString()
    .padStart(2, "0");

  return `${minutos}:${segundosRestantes}`;
}

function Actividad2MathGeometry() {
 const mission=useMissionExpansion("mathgeometry-actividad-2");
  const [menuOpen, setMenuOpen] = useState(false);
  const [actividadPausadaAct2, setActividadPausadaAct2] = useState(false);
  const [segmentoSeleccionado, setSegmentoSeleccionado] =
    useState<SegmentoId | null>(null);
  const [segmentoColocado, setSegmentoColocado] = useState<SegmentoId | null>(
    null,
  );
  const [revisado, setRevisado] = useState(false);
  const [erroresAct2, setErroresAct2] = useState(0);
  const [segundosAct2, setSegundosAct2] = useState(0);
  const [estadoPuenteAct2, setEstadoPuenteAct2] =
    useState<EstadoPuenteAct2>("reposo");
  const [piezaRotaVisibleAct2, setPiezaRotaVisibleAct2] = useState(false);

  const videoPuenteRef = useRef<HTMLVideoElement | null>(null);
  const canvasPuenteRef = useRef<HTMLCanvasElement | null>(null);
  const timeoutPuenteRef = useRef<number | null>(null);
  const timeoutInicioPuenteRef = useRef<number | null>(null);
  const tiempoRestantePuenteRef = useRef<number | null>(null);
  const timeoutRupturaPuenteRef = useRef<number | null>(null);
  const timeoutInicioRupturaPuenteRef = useRef<number | null>(null);
  const tiempoRestanteRupturaPuenteRef = useRef<number | null>(null);
  const resultadoPendientePuenteRef = useRef<"correcto" | "error" | null>(null);
  const [puentePausadoAct2, setPuentePausadoAct2] = useState(false);

  const [textoBienvenidaNova, setTextoBienvenidaNova] = useState("");
  const [estadoBienvenidaNova, setEstadoBienvenidaNova] =
    useState<EstadoExplicacion>("inicio");

  const videoNovaRef = useRef<HTMLVideoElement | null>(null);
  const canvasNovaRef = useRef<HTMLCanvasElement | null>(null);
  const audioNovaRef = useRef<HTMLAudioElement | null>(null);

  const [modalPistasOpen, setModalPistasOpen] = useState(false);
  const [pistaSeleccionada, setPistaSeleccionada] =
    useState<PistaAct2Id>("recto");
  const [textoPista, setTextoPista] = useState("");
  const [estadoPista, setEstadoPista] = useState<EstadoExplicacion>("inicio");
  const [indicePistaActivo, setIndicePistaActivo] = useState(-1);
  const [progresoLineaPista, setProgresoLineaPista] = useState(0);
  const [autoPlayPista, setAutoPlayPista] = useState(false);

  const videoPistaRef = useRef<HTMLVideoElement | null>(null);
  const canvasPistaRef = useRef<HTMLCanvasElement | null>(null);
  const audioPistaRef = useRef<HTMLAudioElement | null>(null);

  const [modalProfesorOpen, setModalProfesorOpen] = useState(false);
  const [textoProfesor, setTextoProfesor] = useState("");
  const [estadoProfesor, setEstadoProfesor] =
    useState<EstadoExplicacion>("inicio");
  const [indiceProfesorActivo, setIndiceProfesorActivo] = useState(-1);
  const [progresoLineaProfesor, setProgresoLineaProfesor] = useState(0);
  const [autoPlayProfesor, setAutoPlayProfesor] = useState(false);

  const videoProfesorRef = useRef<HTMLVideoElement | null>(null);
  const canvasProfesorRef = useRef<HTMLCanvasElement | null>(null);
  const audioProfesorRef = useRef<HTMLAudioElement | null>(null);

  const [modalSombraOpen, setModalSombraOpen] = useState(false);
  const [textoSombra, setTextoSombra] = useState("");
  const [estadoSombra, setEstadoSombra] = useState<EstadoExplicacion>("inicio");
  const [indiceSombraActivo, setIndiceSombraActivo] = useState(-1);
  const [progresoLineaSombra, setProgresoLineaSombra] = useState(0);
  const [autoPlaySombra, setAutoPlaySombra] = useState(false);

  const videoSombraRef = useRef<HTMLVideoElement | null>(null);
  const canvasSombraRef = useRef<HTMLCanvasElement | null>(null);
  const audioSombraRef = useRef<HTMLAudioElement | null>(null);

  const [modalCompletadoOpen, setModalCompletadoOpen] = useState(false);
  const [textoCompletado, setTextoCompletado] = useState("");
  const [estadoCompletado, setEstadoCompletado] =
    useState<EstadoExplicacion>("inicio");
  const [indiceCompletadoActivo, setIndiceCompletadoActivo] = useState(-1);
  const [progresoLineaCompletado, setProgresoLineaCompletado] = useState(0);
  const [autoPlayCompletado, setAutoPlayCompletado] = useState(false);

  const videoCompletadoRef = useRef<HTMLVideoElement | null>(null);
  const canvasCompletadoRef = useRef<HTMLCanvasElement | null>(null);
  const audioCompletadoRef = useRef<HTMLAudioElement | null>(null);

  const navigate = useNavigate();
  const pistaActiva = pistasAct2[pistaSeleccionada];

  useEffect(() => {
    const hayModalAbierto =
      modalPistasOpen ||
      modalProfesorOpen ||
      modalSombraOpen ||
      modalCompletadoOpen;

    if (actividadPausadaAct2 || hayModalAbierto) {
      return;
    }

    const temporizador = window.setInterval(() => {
      setSegundosAct2((valorActual) => valorActual + 1);
    }, 1000);

    return () => {
      window.clearInterval(temporizador);
    };
  }, [
    actividadPausadaAct2,
    modalPistasOpen,
    modalProfesorOpen,
    modalSombraOpen,
    modalCompletadoOpen,
  ]);

  const pilot=useGeometryEvidence("mathgeometry-actividad-2",mission,()=>({
      segmento_seleccionado: segmentoSeleccionado,
      segmento_colocado: segmentoColocado,
      errores: erroresAct2,
    }));

  useAutoProgreso({
    completada: modalCompletadoOpen,
    codigo: "mathgeometry-actividad-2",
    mundo: "MathGeometry",
    tema: "Segmentos de recta",
    titulo: "La Ruta Perdida",
    aciertos: 1 + mission.correctCount,
    totalPreguntas: mission.total,
    tiempoSegundos: segundosAct2,
    xpBase: 50,
    respuestas: pilot.evidence(),
  });

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

  useEffect(() => {
    document.body.style.overflow =
      menuOpen ||
      modalPistasOpen ||
      modalProfesorOpen ||
      modalSombraOpen ||
      modalCompletadoOpen
        ? "hidden"
        : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    menuOpen,
    modalPistasOpen,
    modalProfesorOpen,
    modalSombraOpen,
    modalCompletadoOpen,
  ]);

  useEffect(() => {
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    if (!audio) return;

    const terminarExplicacion = () => {
      setEstadoBienvenidaNova("terminado");
      setTextoBienvenidaNova(textoFinalBienvenidaNova);

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
    if (estadoBienvenidaNova !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioNovaRef.current;
      if (!audio) return;

      setTextoBienvenidaNova(obtenerTextoNovaAct2PorTiempo(audio.currentTime));
    }, 25);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [estadoBienvenidaNova]);

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

    const dibujarNovaSinFondo = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarNovaSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarNovaSinFondo);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const video = videoPuenteRef.current;
    const canvas = canvasPuenteRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) return;

    const canvasWidth = 360;
    const canvasHeight = 640;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujarNovaPuenteSinFondo = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarNovaPuenteSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarNovaPuenteSinFondo);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [estadoPuenteAct2]);

  useEffect(() => {
    return () => {
      if (timeoutPuenteRef.current !== null) {
        window.clearTimeout(timeoutPuenteRef.current);
      }

      if (timeoutRupturaPuenteRef.current !== null) {
        window.clearTimeout(timeoutRupturaPuenteRef.current);
      }
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

      const estadoGuion = obtenerEstadoGuionPistaAct2(
        audio.currentTime,
        audio.duration,
        pistaActiva.guion,
      );

      setTextoPista(estadoGuion.texto);
      setIndicePistaActivo(estadoGuion.indice);
      setProgresoLineaPista(estadoGuion.progresoLinea);
    }, REFRESCO_TEXTO_PISTA_ACT2_MS);

    return () => {
      window.clearInterval(intervalo);
    };
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

    const dibujarPistaSinFondo = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarPistaSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarPistaSinFondo);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalPistasOpen, pistaActiva]);

  useEffect(() => {
    if (!modalPistasOpen || !autoPlayPista || !pistaActiva) return;

    const timeout = window.setTimeout(() => {
      setAutoPlayPista(false);
      iniciarPistaAct2();
    }, 120);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [modalPistasOpen, autoPlayPista, pistaActiva]);

  useEffect(() => {
    if (!modalProfesorOpen) return;

    const audio = audioProfesorRef.current;
    const video = videoProfesorRef.current;

    if (!audio) return;

    const terminarProfesor = () => {
      setEstadoProfesor("terminado");
      setTextoProfesor(textoFinalProfesorAstroAct2);
      setIndiceProfesorActivo(guionProfesorAstroAct2.length - 1);
      setProgresoLineaProfesor(100);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarProfesor);

    return () => {
      audio.removeEventListener("ended", terminarProfesor);
    };
  }, [modalProfesorOpen]);

  useEffect(() => {
    if (!modalProfesorOpen || estadoProfesor !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioProfesorRef.current;
      if (!audio) return;

      const estadoGuion = obtenerEstadoGuionPistaAct2(
        audio.currentTime,
        audio.duration,
        guionProfesorAstroAct2,
      );

      setTextoProfesor(estadoGuion.texto);
      setIndiceProfesorActivo(estadoGuion.indice);
      setProgresoLineaProfesor(estadoGuion.progresoLinea);
    }, REFRESCO_TEXTO_PISTA_ACT2_MS);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [modalProfesorOpen, estadoProfesor]);

  useEffect(() => {
    if (!modalProfesorOpen) return;

    const video = videoProfesorRef.current;
    const canvas = canvasProfesorRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) return;

    const canvasWidth = 360;
    const canvasHeight = 640;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame = 0;
    let ultimoDibujo = 0;

    const dibujarProfesorSinFondo = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarProfesorSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarProfesorSinFondo);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalProfesorOpen]);

  useEffect(() => {
    if (!modalProfesorOpen || !autoPlayProfesor) return;

    const timeout = window.setTimeout(() => {
      setAutoPlayProfesor(false);
      iniciarProfesorAstroAct2();
    }, 120);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [modalProfesorOpen, autoPlayProfesor]);

  useEffect(() => {
    if (!modalSombraOpen) return;

    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;

    if (!audio) return;

    const terminarSombra = () => {
      setEstadoSombra("terminado");
      setTextoSombra(textoFinalSombraAct2);
      setIndiceSombraActivo(guionSombraErrorAct2.length - 1);
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

      const estadoGuion = obtenerEstadoGuionPistaAct2(
        audio.currentTime,
        audio.duration,
        guionSombraErrorAct2,
      );

      setTextoSombra(estadoGuion.texto);
      setIndiceSombraActivo(estadoGuion.indice);
      setProgresoLineaSombra(estadoGuion.progresoLinea);
    }, 35);

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
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarSombraSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
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
      iniciarSombraAct2();
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

    const terminarCompletado = () => {
      setEstadoCompletado("terminado");
      setTextoCompletado(textoFinalCompletadoAct2);
      setIndiceCompletadoActivo(guionCompletadoAct2.length - 1);
      setProgresoLineaCompletado(100);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("ended", terminarCompletado);

    return () => {
      audio.removeEventListener("ended", terminarCompletado);
    };
  }, [modalCompletadoOpen]);

  useEffect(() => {
    if (!modalCompletadoOpen || estadoCompletado !== "reproduciendo") return;

    const intervalo = window.setInterval(() => {
      const audio = audioCompletadoRef.current;
      if (!audio) return;

      const estadoGuion = obtenerEstadoGuionPistaAct2(
        audio.currentTime,
        audio.duration,
        guionCompletadoAct2,
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

    const dibujarCompletadoSinFondo = (tiempo: number) => {
      if (tiempo - ultimoDibujo > 33 && video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
        ultimoDibujo = tiempo;
      }

      animationFrame = window.requestAnimationFrame(dibujarCompletadoSinFondo);
    };

    const dibujarPrimerFrame = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        dibujarVideoNovaAct2SinEstirar(ctx, video, canvasWidth, canvasHeight);
        limpiarFondoClaroNovaAct2(ctx, canvasWidth, canvasHeight);
      }
    };

    video.addEventListener("loadeddata", dibujarPrimerFrame);
    animationFrame = window.requestAnimationFrame(dibujarCompletadoSinFondo);

    return () => {
      video.removeEventListener("loadeddata", dibujarPrimerFrame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [modalCompletadoOpen]);

  useEffect(() => {
    if (!modalCompletadoOpen || !autoPlayCompletado) return;

    const timeout = window.setTimeout(() => {
      setAutoPlayCompletado(false);
      iniciarCompletadoAct2();
    }, 120);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [modalCompletadoOpen, autoPlayCompletado]);

  const pausarPistaAct2 = () => {
    const audio = audioPistaRef.current;
    const video = videoPistaRef.current;

    audio?.pause();
    video?.pause();

    if (estadoPista === "reproduciendo") {
      setEstadoPista("pausado");
    }
  };

  const abrirPistasAct2 = (reproducir = false) => {
    pausarExplicacionNova();
    pausarProfesorAstroAct2();
    setModalPistasOpen(true);

    if (reproducir) {
      setAutoPlayPista(true);
    }
  };

  const seleccionarPistaAct2 = (pista: PistaAct2Id, reproducir = true) => {
    pausarPistaAct2();
    setPistaSeleccionada(pista);
    setTextoPista("");
    setEstadoPista("inicio");
    setIndicePistaActivo(-1);
    setProgresoLineaPista(0);

    if (reproducir) {
      setAutoPlayPista(true);
    }
  };

  const iniciarPistaAct2 = async () => {
    if (actividadPausadaAct2) return;
    if (!modalPistasOpen) {
      abrirPistasAct2(true);
      return;
    }

    const audio = audioPistaRef.current;
    const video = videoPistaRef.current;

    if (!audio || !video) return;

    try {
      if (estadoPista === "terminado" || audio.ended) {
        audio.currentTime = 0;
        video.currentTime = 0;
        setTextoPista("");
        setIndicePistaActivo(-1);
        setProgresoLineaPista(0);
      }

      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoPista("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoPista("pausado");
    }
  };

  const repetirPistaAct2 = async () => {
    if (actividadPausadaAct2) return;
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
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoPista("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoPista("pausado");
    }
  };

  const cerrarPistasAct2 = () => {
    pausarPistaAct2();

    const audio = audioPistaRef.current;
    const video = videoPistaRef.current;

    if (audio) {
      audio.currentTime = 0;
    }

    if (video) {
      video.currentTime = 0;
      video.pause();
    }

    setModalPistasOpen(false);
    setAutoPlayPista(false);
    setEstadoPista("inicio");
    setTextoPista("");
    setIndicePistaActivo(-1);
    setProgresoLineaPista(0);
  };

  const pausarProfesorAstroAct2 = () => {
    const audio = audioProfesorRef.current;
    const video = videoProfesorRef.current;

    audio?.pause();
    video?.pause();

    if (estadoProfesor === "reproduciendo") {
      setEstadoProfesor("pausado");
    }
  };

  const abrirProfesorAstroAct2 = (reproducir = false) => {
    pausarExplicacionNova();
    pausarPistaAct2();
    setModalProfesorOpen(true);

    if (reproducir) {
      setAutoPlayProfesor(true);
    }
  };

  const iniciarProfesorAstroAct2 = async () => {
    if (actividadPausadaAct2) return;
    if (!modalProfesorOpen) {
      abrirProfesorAstroAct2(true);
      return;
    }

    const audio = audioProfesorRef.current;
    const video = videoProfesorRef.current;

    if (!audio || !video) return;

    try {
      if (estadoProfesor === "terminado" || audio.ended) {
        audio.currentTime = 0;
        video.currentTime = 0;
        setTextoProfesor("");
        setIndiceProfesorActivo(-1);
        setProgresoLineaProfesor(0);
      }

      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoProfesor("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoProfesor("pausado");
    }
  };

  const repetirProfesorAstroAct2 = async () => {
    if (actividadPausadaAct2) return;
    const audio = audioProfesorRef.current;
    const video = videoProfesorRef.current;

    if (!audio || !video) return;

    audio.pause();
    video.pause();

    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoProfesor("");
    setIndiceProfesorActivo(-1);
    setProgresoLineaProfesor(0);

    try {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoProfesor("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoProfesor("pausado");
    }
  };

  const cerrarProfesorAstroAct2 = () => {
    pausarProfesorAstroAct2();

    const audio = audioProfesorRef.current;
    const video = videoProfesorRef.current;

    if (audio) {
      audio.currentTime = 0;
    }

    if (video) {
      video.currentTime = 0;
      video.pause();
    }

    setModalProfesorOpen(false);
    setAutoPlayProfesor(false);
    setEstadoProfesor("inicio");
    setTextoProfesor("");
    setIndiceProfesorActivo(-1);
    setProgresoLineaProfesor(0);
  };

  const obtenerClaseLineaProfesorAct2 = (indice: number) => {
    if (estadoProfesor === "terminado") return "act2geo-profe-line-done";
    if (indiceProfesorActivo < 0) return "act2geo-profe-line-pending";
    if (indice < indiceProfesorActivo) return "act2geo-profe-line-done";
    if (indice === indiceProfesorActivo) return "act2geo-profe-line-active";
    return "act2geo-profe-line-pending";
  };

  const obtenerProgresoLineaProfesorAct2 = (indice: number) => {
    if (estadoProfesor === "terminado") return "100%";
    if (indiceProfesorActivo < 0) return "0%";
    if (indice < indiceProfesorActivo) return "100%";
    if (indice === indiceProfesorActivo) return `${progresoLineaProfesor}%`;
    return "0%";
  };

  const obtenerClaseLineaPistaAct2 = (indice: number) => {
    if (estadoPista === "terminado") return "act2geo-clue-line-done";
    if (indicePistaActivo < 0) return "act2geo-clue-line-pending";
    if (indice < indicePistaActivo) return "act2geo-clue-line-done";
    if (indice === indicePistaActivo) return "act2geo-clue-line-active";
    return "act2geo-clue-line-pending";
  };

  const obtenerProgresoLineaPistaAct2 = (indice: number) => {
    if (estadoPista === "terminado") return "100%";
    if (indicePistaActivo < 0) return "0%";
    if (indice < indicePistaActivo) return "100%";
    if (indice === indicePistaActivo) return `${progresoLineaPista}%`;
    return "0%";
  };

  const pausarSombraAct2 = () => {
    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;

    audio?.pause();
    video?.pause();

    if (estadoSombra === "reproduciendo") {
      setEstadoSombra("pausado");
    }
  };

  const abrirSombraAct2 = (reproducir = true) => {
    pausarExplicacionNova();
    pausarPistaAct2();
    pausarProfesorAstroAct2();
    pausarCompletadoAct2();
    setModalSombraOpen(true);

    if (reproducir) {
      setAutoPlaySombra(true);
    }
  };

  const iniciarSombraAct2 = async () => {
    if (actividadPausadaAct2) return;
    if (!modalSombraOpen) {
      abrirSombraAct2(true);
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

  const repetirSombraAct2 = async () => {
    if (actividadPausadaAct2) return;
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

  const cerrarSombraAct2 = () => {
    pausarSombraAct2();

    const audio = audioSombraRef.current;
    const video = videoSombraRef.current;

    if (audio) audio.currentTime = 0;

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

  const pausarCompletadoAct2 = () => {
    const audio = audioCompletadoRef.current;
    const video = videoCompletadoRef.current;

    audio?.pause();
    video?.pause();

    if (estadoCompletado === "reproduciendo") {
      setEstadoCompletado("pausado");
    }
  };

  const abrirCompletadoAct2 = (reproducir = true) => {
 mission.finishNative(); if(!mission.ready || !mission.allCorrect){mission.review();return;}

    pausarExplicacionNova();
    pausarPistaAct2();
    pausarProfesorAstroAct2();
    pausarSombraAct2();
    setModalCompletadoOpen(true);

    if (reproducir) {
      setAutoPlayCompletado(true);
    }
  };

  const iniciarCompletadoAct2 = async () => {
    if (actividadPausadaAct2) return;
    if (!modalCompletadoOpen) {
      abrirCompletadoAct2(true);
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

  const repetirCompletadoAct2 = async () => {
    if (actividadPausadaAct2) return;
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

  const cerrarCompletadoAct2 = () => {
    pausarCompletadoAct2();

    const audio = audioCompletadoRef.current;
    const video = videoCompletadoRef.current;

    if (audio) audio.currentTime = 0;

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

  const reiniciarActividadAct2 = () => {
    mission.reset();
    pilot.resetSession();
    cerrarSombraAct2();
    cerrarCompletadoAct2();
    reiniciarEstadoInicialAct2(true);
  };

  const volverAActividadesAct2 = () => {
    cerrarCompletadoAct2();
    navigate("/actividades/geometria");
  };

  const irASiguienteActividadAct2 = () => {
    cerrarCompletadoAct2();
    navigate("/actividades/geometria/actividad-3");
  };

  const obtenerClaseLineaSombraAct2 = (indice: number) => {
    if (estadoSombra === "terminado") return "act2geo-sombra-line-done";
    if (indiceSombraActivo < 0) return "act2geo-sombra-line-pending";
    if (indice < indiceSombraActivo) return "act2geo-sombra-line-done";
    if (indice === indiceSombraActivo) return "act2geo-sombra-line-active";
    return "act2geo-sombra-line-pending";
  };

  const obtenerProgresoLineaSombraAct2 = (indice: number) => {
    if (estadoSombra === "terminado") return "100%";
    if (indiceSombraActivo < 0) return "0%";
    if (indice < indiceSombraActivo) return "100%";
    if (indice === indiceSombraActivo) return `${progresoLineaSombra}%`;
    return "0%";
  };

  const obtenerClaseLineaCompletadoAct2 = (indice: number) => {
    if (estadoCompletado === "terminado") return "act2geo-complete-line-done";
    if (indiceCompletadoActivo < 0) return "act2geo-complete-line-pending";
    if (indice < indiceCompletadoActivo) return "act2geo-complete-line-done";
    if (indice === indiceCompletadoActivo)
      return "act2geo-complete-line-active";
    return "act2geo-complete-line-pending";
  };

  const obtenerProgresoLineaCompletadoAct2 = (indice: number) => {
    if (estadoCompletado === "terminado") return "100%";
    if (indiceCompletadoActivo < 0) return "0%";
    if (indice < indiceCompletadoActivo) return "100%";
    if (indice === indiceCompletadoActivo) return `${progresoLineaCompletado}%`;
    return "0%";
  };

  const irARuta = (ruta: string) => {
    pausarExplicacionNova();
    pausarPistaAct2();
    pausarProfesorAstroAct2();
    pausarSombraAct2();
    pausarCompletadoAct2();
    limpiarControlPausaPuenteAct2();
    detenerVideoPuenteAct2();
    setMenuOpen(false);
    navigate(ruta);
  };

  const limpiarTimeoutPuenteAct2 = () => {
    if (timeoutPuenteRef.current !== null) {
      window.clearTimeout(timeoutPuenteRef.current);
      timeoutPuenteRef.current = null;
    }

    timeoutInicioPuenteRef.current = null;
  };

  const limpiarTimeoutRupturaPuenteAct2 = () => {
    if (timeoutRupturaPuenteRef.current !== null) {
      window.clearTimeout(timeoutRupturaPuenteRef.current);
      timeoutRupturaPuenteRef.current = null;
    }

    timeoutInicioRupturaPuenteRef.current = null;
  };

  const limpiarControlPausaPuenteAct2 = () => {
    limpiarTimeoutPuenteAct2();
    limpiarTimeoutRupturaPuenteAct2();
    tiempoRestantePuenteRef.current = null;
    tiempoRestanteRupturaPuenteRef.current = null;
    resultadoPendientePuenteRef.current = null;
    setPiezaRotaVisibleAct2(false);
    setPuentePausadoAct2(false);
  };

  const detenerVideoPuenteAct2 = () => {
    const video = videoPuenteRef.current;

    if (!video) return;

    video.pause();
    video.currentTime = 0;
  };

  const reiniciarBienvenidaNovaAct2 = () => {
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    setTextoBienvenidaNova("");
    setEstadoBienvenidaNova("inicio");
  };

  const reiniciarEstadoInicialAct2 = (reiniciarErrores = false) => {
    limpiarControlPausaPuenteAct2();
    detenerVideoPuenteAct2();
    setSegmentoSeleccionado(null);
    setSegmentoColocado(null);
    setRevisado(false);

    if (reiniciarErrores) {
      setErroresAct2(0);
      setSegundosAct2(0);
    }

    setEstadoPuenteAct2("reposo");
    reiniciarBienvenidaNovaAct2();
  };

  const finalizarIntentoPuenteAct2 = (esCorrecta: boolean) => {
    limpiarControlPausaPuenteAct2();
    setRevisado(true);
    setEstadoPuenteAct2(
      esCorrecta ? "finalizado-correcto" : "finalizado-error",
    );
    detenerVideoPuenteAct2();

    if (esCorrecta) {
      abrirCompletadoAct2(true);
    } else {
      abrirSombraAct2(true);
    }
  };

  const programarFinalPuenteAct2 = (
    esCorrecta: boolean,
    duracionRestante: number,
  ) => {
    limpiarTimeoutPuenteAct2();

    const duracionSegura = Math.max(
      MINIMO_RESTANTE_PUENTE_ACT2_MS,
      duracionRestante,
    );

    resultadoPendientePuenteRef.current = esCorrecta ? "correcto" : "error";
    tiempoRestantePuenteRef.current = duracionSegura;
    timeoutInicioPuenteRef.current = Date.now();

    timeoutPuenteRef.current = window.setTimeout(() => {
      finalizarIntentoPuenteAct2(esCorrecta);
    }, duracionSegura);
  };

  const programarRupturaPuenteAct2 = (duracionRestante: number) => {
    limpiarTimeoutRupturaPuenteAct2();

    const duracionSegura = Math.max(60, duracionRestante);
    tiempoRestanteRupturaPuenteRef.current = duracionSegura;
    timeoutInicioRupturaPuenteRef.current = Date.now();

    timeoutRupturaPuenteRef.current = window.setTimeout(() => {
      timeoutRupturaPuenteRef.current = null;
      timeoutInicioRupturaPuenteRef.current = null;
      tiempoRestanteRupturaPuenteRef.current = null;
      setPiezaRotaVisibleAct2(true);
    }, duracionSegura);
  };

  const estaCruzandoPuenteAct2 =
    estadoPuenteAct2 === "corriendo-correcto" ||
    estadoPuenteAct2 === "corriendo-error";

  const pausarCrucePuenteAct2 = () => {
    if (!estaCruzandoPuenteAct2 || puentePausadoAct2) return;

    const video = videoPuenteRef.current;
    video?.pause();

    if (timeoutPuenteRef.current !== null) {
      window.clearTimeout(timeoutPuenteRef.current);
      timeoutPuenteRef.current = null;
    }

    const inicio = timeoutInicioPuenteRef.current ?? Date.now();
    const restanteActual =
      tiempoRestantePuenteRef.current ??
      (estadoPuenteAct2 === "corriendo-correcto"
        ? DURACION_PUENTE_CORRECTO_ACT2_MS
        : DURACION_PUENTE_ERROR_ACT2_MS);
    const transcurrido = Date.now() - inicio;
    tiempoRestantePuenteRef.current = Math.max(
      MINIMO_RESTANTE_PUENTE_ACT2_MS,
      restanteActual - transcurrido,
    );
    timeoutInicioPuenteRef.current = null;

    if (
      estadoPuenteAct2 === "corriendo-error" &&
      !piezaRotaVisibleAct2 &&
      timeoutRupturaPuenteRef.current !== null
    ) {
      window.clearTimeout(timeoutRupturaPuenteRef.current);
      timeoutRupturaPuenteRef.current = null;

      const inicioRuptura = timeoutInicioRupturaPuenteRef.current ?? Date.now();
      const restanteRupturaActual =
        tiempoRestanteRupturaPuenteRef.current ??
        TIEMPO_RUPTURA_PUENTE_ERROR_ACT2_MS;
      const transcurridoRuptura = Date.now() - inicioRuptura;

      tiempoRestanteRupturaPuenteRef.current = Math.max(
        60,
        restanteRupturaActual - transcurridoRuptura,
      );
      timeoutInicioRupturaPuenteRef.current = null;
    }

    setPuentePausadoAct2(true);
  };

  const reanudarCrucePuenteAct2 = async () => {
    if (!estaCruzandoPuenteAct2 || !puentePausadoAct2) return;

    const resultadoPendiente = resultadoPendientePuenteRef.current;
    const esCorrecta =
      resultadoPendiente === "correcto" ||
      estadoPuenteAct2 === "corriendo-correcto";
    const video = videoPuenteRef.current;

    try {
      if (video) {
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        await video.play();
      }
    } catch {
      /* Si el navegador bloquea el video, el control de tiempo continúa. */
    }

    setPuentePausadoAct2(false);
    programarFinalPuenteAct2(
      esCorrecta,
      tiempoRestantePuenteRef.current ??
        (esCorrecta
          ? DURACION_PUENTE_CORRECTO_ACT2_MS
          : DURACION_PUENTE_ERROR_ACT2_MS),
    );

    if (!esCorrecta && !piezaRotaVisibleAct2) {
      programarRupturaPuenteAct2(
        tiempoRestanteRupturaPuenteRef.current ??
          TIEMPO_RUPTURA_PUENTE_ERROR_ACT2_MS,
      );
    }
  };

  const alternarCrucePuenteAct2 = () => {
    if (puentePausadoAct2) {
      reanudarCrucePuenteAct2();
    } else {
      pausarCrucePuenteAct2();
    }
  };

  const pausarTodoAct2 = () => {
    pausarExplicacionNova();
    pausarPistaAct2();
    pausarProfesorAstroAct2();
    pausarSombraAct2();
    pausarCompletadoAct2();

    if (estaCruzandoPuenteAct2 && !puentePausadoAct2) {
      pausarCrucePuenteAct2();
    }
  };

  const alternarPausaActividadAct2 = () => {
    if (actividadPausadaAct2) {
      setActividadPausadaAct2(false);

      if (estaCruzandoPuenteAct2 && puentePausadoAct2) {
        void reanudarCrucePuenteAct2();
      }

      return;
    }

    pausarTodoAct2();
    setActividadPausadaAct2(true);
  };

  const cerrarSombraYReiniciarAct2 = () => {
 cerrarSombraAct2(); setRevisado(false); setEstadoPuenteAct2("reposo"); mission.beginCorrection();
};

  const cerrarCompletadoYReiniciarAct2 = () => {
    cerrarCompletadoAct2();
    reiniciarEstadoInicialAct2();
  };

  const puedeElegirSegmentoAct2 =
    !actividadPausadaAct2 &&
    estadoPuenteAct2 !== "corriendo-correcto" &&
    estadoPuenteAct2 !== "corriendo-error";

  const segmentos = [
    {
      id: "pieza3" as SegmentoId,
      letra: "A",
      nombre: "Segmento curvo",
      img: piezaCamino3,
    },
    {
      id: "pieza2" as SegmentoId,
      letra: "B",
      nombre: "Segmento recto",
      img: piezaCamino2,
    },
    {
      id: "pieza1" as SegmentoId,
      letra: "C",
      nombre: "Segmento ondulado",
      img: piezaCamino1,
    },
  ];

  const piezasRotasAct2: Partial<
    Record<
      SegmentoId,
      {
        izquierda: string;
        derecha: string;
        altIzquierda: string;
        altDerecha: string;
      }
    >
  > = {
    pieza1: {
      izquierda: piezaCamino1IzquierdaRota,
      derecha: piezaCamino1DerechaRota,
      altIzquierda: "Mitad izquierda rota del segmento ondulado",
      altDerecha: "Mitad derecha rota del segmento ondulado",
    },
    pieza2: {
      izquierda: piezaCamino2IzquierdaRota,
      derecha: piezaCamino2DerechaRota,
      altIzquierda: "Mitad izquierda rota del segmento recto",
      altDerecha: "Mitad derecha rota del segmento recto",
    },
  };

  const piezaRotaColocadaAct2 =
    segmentoColocado && piezaRotaVisibleAct2
      ? piezasRotasAct2[segmentoColocado]
      : null;

  const respuestaCorrecta = segmentoColocado === "pieza3";

  const animarIntentoPuenteAct2 = async (id: SegmentoId) => {
    if (!puedeElegirSegmentoAct2) return;
    pilot.recordAll({segmento_seleccionado:id,segmento_colocado:id});

    pausarExplicacionNova();
    pausarPistaAct2();
    pausarProfesorAstroAct2();
    pausarSombraAct2();
    pausarCompletadoAct2();
    limpiarControlPausaPuenteAct2();

    const esCorrecta = id === "pieza3";
    const video = videoPuenteRef.current;

    setSegmentoSeleccionado(id);
    setSegmentoColocado(id);
    setPiezaRotaVisibleAct2(false);
    setRevisado(false);

    if (!esCorrecta) {
      setErroresAct2((erroresActuales) => erroresActuales + 1);
    }

    setEstadoPuenteAct2(esCorrecta ? "corriendo-correcto" : "corriendo-error");

    if (video) {
      try {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        await video.play();
      } catch {
        /* La animación visual del canvas sigue aunque el navegador bloquee autoplay. */
      }
    }

    programarFinalPuenteAct2(
      esCorrecta,
      esCorrecta
        ? DURACION_PUENTE_CORRECTO_ACT2_MS
        : DURACION_PUENTE_ERROR_ACT2_MS,
    );

    if (!esCorrecta) {
      programarRupturaPuenteAct2(TIEMPO_RUPTURA_PUENTE_ERROR_ACT2_MS);
    }
  };

  const seleccionarSegmento = (id: SegmentoId) => {
    animarIntentoPuenteAct2(id);
  };

  const pausarExplicacionNova = () => {
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    audio?.pause();
    video?.pause();

    if (estadoBienvenidaNova === "reproduciendo") {
      setEstadoBienvenidaNova("pausado");
    }
  };

  const iniciarExplicacionNova = async () => {
    if (actividadPausadaAct2) return;
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    if (!audio || !video) return;

    try {
      if (estadoBienvenidaNova === "terminado" || audio.ended) {
        audio.currentTime = 0;
        video.currentTime = 0;
        setTextoBienvenidaNova("");
      }

      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoBienvenidaNova("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoBienvenidaNova("pausado");
    }
  };

  const repetirExplicacionNova = async () => {
    if (actividadPausadaAct2) return;
    const audio = audioNovaRef.current;
    const video = videoNovaRef.current;

    if (!audio || !video) return;

    audio.pause();
    video.pause();

    audio.currentTime = 0;
    video.currentTime = 0;
    setTextoBienvenidaNova("");

    try {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      setEstadoBienvenidaNova("reproduciendo");

      await video.play();
      await audio.play();
    } catch {
      setEstadoBienvenidaNova("pausado");
    }
  };

  return (
    <main
      className={`act2geo-page mn-activity ${
        actividadPausadaAct2 ? "act2geo-activity-paused" : ""
      }`}
    >
      <button
        className={`act2geo-hamburger-btn ${
          menuOpen ? "act2geo-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="act2geo-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`act2geo-sidebar ${menuOpen ? "act2geo-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="act2geo-sidebar-logo" />

        <nav className="act2geo-sidebar-menu">
          <button
            type="button"
            className="act2geo-menu-item"
            onClick={() => irARuta(obtenerDashboardPrincipal())}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="act2geo-menu-item act2geo-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="act2geo-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="act2geo-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="act2geo-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="act2geo-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="mn-sidebar-mission"><span>Tu misión</span><strong>{activityCurriculum["mathgeometry-actividad-2"].objective}</strong></div>
      </aside>

      <section className="act2geo-content">
        <img
          src={heroBanner}
          alt="Banner MathGeometry"
          className="act2geo-bg"
        />

        <section className="act2geo-main">
        <CabeceraCurricular curriculum={activityCurriculum["mathgeometry-actividad-2"]} />
        


          <header className="act2geo-topbar">
            <div className="act2geo-title-area">
              <h1>Actividad 2 - La Ruta Perdida</h1>

              <p className="act2geo-subtitle">
                Conecta el tramo correcto para reconstruir el camino.
              </p>

              <div className="act2geo-pills">
                <span>Introductorio</span>
                <span>8–12 min</span>
                <span>Conteo de errores</span>
              </div>
            </div>

            <div className="act2geo-actions-top">
              <button type="button" onClick={alternarPausaActividadAct2}>
                {actividadPausadaAct2 ? <FiPlay /> : <FiPause />}
                {actividadPausadaAct2 ? "Continuar" : "Pausar"}
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
            className={`act2geo-novaexplain-row ${
              estadoBienvenidaNova === "reproduciendo"
                ? "act2geo-novaexplain-playing"
                : ""
            }`}
          >
            <div className="act2geo-novaexplain-stage">
              <video
                ref={videoNovaRef}
                src={videoNovaExplicando}
                className="act2geo-novaexplain-source-video"
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
              />

              <canvas
                ref={canvasNovaRef}
                className="act2geo-novaexplain-canvas"
                role="img"
                aria-label="Nova explicando la actividad"
              />

              <span className="act2geo-novaexplain-shadow"></span>
            </div>

            <article className="act2geo-novaexplain-cloud">
              <div className="act2geo-novaexplain-main">
                <span className="act2geo-novaexplain-label">Nova explica</span>

                <p>
                  {textoBienvenidaNova || textoInicialBienvenidaNova}

                  {estadoBienvenidaNova === "reproduciendo" && (
                    <span className="act2geo-novaexplain-cursor"></span>
                  )}
                </p>
              </div>

              <div
                className="act2geo-novaexplain-controls"
                aria-label="Controles de audio de Nova"
              >
                <span
                  className="act2geo-novaexplain-control-glow"
                  aria-hidden="true"
                ></span>

                <button
                  type="button"
                  className="act2geo-novaexplain-control-btn act2geo-novaexplain-control-play"
                  onClick={iniciarExplicacionNova}
                  aria-label="Reproducir explicación"
                >
                  <FiPlay />
                </button>

                <button
                  type="button"
                  className="act2geo-novaexplain-control-btn"
                  onClick={pausarExplicacionNova}
                  aria-label="Pausar explicación"
                >
                  <FiPause />
                </button>

                <button
                  type="button"
                  className="act2geo-novaexplain-control-btn act2geo-novaexplain-control-repeat"
                  onClick={repetirExplicacionNova}
                  aria-label="Repetir explicación"
                >
                  <FiRotateCcw />
                </button>
              </div>
            </article>

            <audio
              ref={audioNovaRef}
              src={audioBienvenidaNova}
              preload="auto"
            />
          </section>

          <EnsayoOtrosMundos activityId="mathgeometry-actividad-2"/>
<section className="act2geo-layout">
            <article className="act2geo-challenge-card">
              {actividadPausadaAct2 && (
                <div className="act2geo-activity-pause-overlay">
                  <FiPause />
                  <strong>Actividad pausada</strong>
                  <span>Presiona Continuar para seguir.</span>
                </div>
              )}
              <div
                className={`act2geo-map-wrap act2geo-map-wrap-${estadoPuenteAct2} ${
                  puentePausadoAct2 ? "act2geo-bridge-paused" : ""
                }`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();

                  const id = event.dataTransfer.getData(
                    "segmento",
                  ) as SegmentoId;

                  if (id) {
                    animarIntentoPuenteAct2(id);
                  }
                }}
              >
                <img
                  src={
                    estadoPuenteAct2 === "reposo"
                      ? mapaPuente
                      : mapaPuenteCompleto
                  }
                  alt="Ruta perdida"
                  className="act2geo-map-image"
                />

                {estadoPuenteAct2 === "reposo" && (
                  <div className="act2geo-drop-zone">
                    <span>Arrastra aquí</span>
                  </div>
                )}

                {segmentoColocado && (
                  <div
                    className={`act2geo-placed-segment-on-map act2geo-placed-segment-${segmentoColocado} ${
                      segmentoColocado === "pieza3"
                        ? "act2geo-placed-segment-ok"
                        : "act2geo-placed-segment-bad"
                    } ${
                      segmentoColocado !== "pieza3" && !piezaRotaVisibleAct2
                        ? "act2geo-placed-segment-before-break"
                        : ""
                    } ${
                      piezaRotaColocadaAct2
                        ? "act2geo-placed-segment-broken act2geo-placed-segment-breaking"
                        : ""
                    } ${
                      estadoPuenteAct2 === "finalizado-error"
                        ? "act2geo-placed-segment-empty"
                        : ""
                    }`}
                    aria-hidden="true"
                  >
                    {piezaRotaColocadaAct2 ? (
                      <div className="act2geo-broken-piece-stage">
                        <img
                          src={piezaRotaColocadaAct2.izquierda}
                          alt={piezaRotaColocadaAct2.altIzquierda}
                          className="act2geo-broken-piece-half act2geo-broken-piece-left"
                        />

                        <img
                          src={piezaRotaColocadaAct2.derecha}
                          alt={piezaRotaColocadaAct2.altDerecha}
                          className="act2geo-broken-piece-half act2geo-broken-piece-right"
                        />

                        <span className="act2geo-break-dust act2geo-break-dust-one"></span>
                        <span className="act2geo-break-dust act2geo-break-dust-two"></span>
                        <span className="act2geo-break-dust act2geo-break-dust-three"></span>
                      </div>
                    ) : (
                      <img
                        src={
                          segmentos.find(
                            (segmento) => segmento.id === segmentoColocado,
                          )?.img
                        }
                        alt=""
                      />
                    )}
                  </div>
                )}

                <video
                  ref={videoPuenteRef}
                  src={videoNovaPuente}
                  className="act2geo-bridge-nova-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                {estadoPuenteAct2 !== "reposo" && (
                  <canvas
                    ref={canvasPuenteRef}
                    className={`act2geo-bridge-nova-canvas act2geo-bridge-nova-${estadoPuenteAct2}`}
                    role="img"
                    aria-label="Nova cruzando el puente"
                  />
                )}

                {estaCruzandoPuenteAct2 && (
                  <button
                    type="button"
                    className={`act2geo-bridge-toggle-btn ${
                      puentePausadoAct2
                        ? "act2geo-bridge-toggle-paused"
                        : "act2geo-bridge-toggle-running"
                    }`}
                    onClick={alternarCrucePuenteAct2}
                    aria-label={
                      puentePausadoAct2
                        ? "Seguir cruce del puente"
                        : "Parar cruce del puente"
                    }
                  >
                    {puentePausadoAct2 ? <FiPlay /> : <FiPause />}
                    <span>{puentePausadoAct2 ? "Seguir" : "Parar"}</span>
                  </button>
                )}
              </div>

              <h2>Elige o arrastra el segmento que falta:</h2>

              <div className="act2geo-options">
                {segmentos.map((segmento) => {
                  const seleccionado = segmentoSeleccionado === segmento.id;
                  const colocada = segmentoColocado === segmento.id;
                  const correcta = segmento.id === "pieza3";

                  return (
                    <button
                      key={segmento.id}
                      type="button"
                      draggable={puedeElegirSegmentoAct2}
                      disabled={!puedeElegirSegmentoAct2}
                      className={`act2geo-option-card ${
                        seleccionado ? "act2geo-selected" : ""
                      } ${
                        revisado && colocada && correcta
                          ? "act2geo-correct"
                          : ""
                      } ${
                        revisado && colocada && !correcta
                          ? "act2geo-incorrect"
                          : ""
                      }`}
                      onClick={() => seleccionarSegmento(segmento.id)}
                      onDragStart={(event) => {
                        if (!puedeElegirSegmentoAct2) {
                          event.preventDefault();
                          return;
                        }

                        event.dataTransfer.setData("segmento", segmento.id);
                      }}
                    >
                      <div className="act2geo-option-head">
                        <span>{segmento.letra}</span>
                        <strong>{segmento.nombre}</strong>

                        {colocada && (
                          <b>
                            <FiCheck />
                          </b>
                        )}
                      </div>

                      <div className="act2geo-piece-wrap">
                        <img src={segmento.img} alt={segmento.nombre} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </article>

            <aside className="act2geo-right-panel">
              <article className="act2geo-tip-card">
                <img src={sombraError} alt="Sombra" />
                <div>
                  <h3>¿Necesitas ayuda?</h3>
                  <p>Estamos aquí para ti.</p>
                </div>
              </article>

              <button
                type="button"
                className="act2geo-tip-card act2geo-profesor-card"
                onClick={() =>
                  !actividadPausadaAct2 && abrirProfesorAstroAct2(false)
                }
              >
                <img src={profesorExplicando} alt="Profesor Astro" />
                <div>
                  <h3>Profesor Astro</h3>
                  <p>Un segmento une dos puntos. Mira cómo conectar la ruta.</p>
                  <span>Ver explicación</span>
                </div>
              </button>

              <button
                type="button"
                className="act2geo-tip-card act2geo-open-pistas-card"
                onClick={() => !actividadPausadaAct2 && abrirPistasAct2(false)}
              >
                <img src={byteAct2} alt="Byte" />
                <div>
                  <h3>Pista de Byte</h3>
                  <p>Elige una pista según el tipo de camino.</p>
                  <span>Ver pista</span>
                </div>
              </button>

              <div
                className={`act2geo-answer-box ${
                  revisado && respuestaCorrecta ? "act2geo-answer-ok" : ""
                } ${revisado && !respuestaCorrecta ? "act2geo-answer-bad" : ""}`}
              >
                <FiCheck />
                <span>
                  {!segmentoColocado
                    ? "Elige o arrastra una pieza para que Nova avance"
                    : estadoPuenteAct2 === "corriendo-correcto"
                      ? "Nova está cruzando el puente"
                      : estadoPuenteAct2 === "corriendo-error"
                        ? "Nova está probando esa ruta"
                        : revisado && respuestaCorrecta
                          ? "¡Correcto! Nova llegó al final"
                          : revisado && !respuestaCorrecta
                            ? "Casi. Elige otra pieza para intentarlo de nuevo"
                            : "Preparando la ruta de Nova"}
                </span>
              </div>
            </aside>
          </section>
 


          <section className="act2geo-bottom-stats">
            <article>
              <FiFlag />
              <div>
                <span>Rutas completadas</span>
                <strong>{revisado && respuestaCorrecta ? "1/1" : "0/1"}</strong>
              </div>
            </article>

            <article>
              <FiTarget />
              <div>
                <span>Errores</span>
                <strong>{erroresAct2}</strong>
              </div>
            </article>

            <article>
              <FiClock />
              <div>
                <span>Tiempo</span>
                <strong>{formatearTiempoAct2(segundosAct2)}</strong>
              </div>
            </article>

            <article className="act2geo-xp-card">
              <FaStar className="act2geo-xp-star-icon" />

              <div className="act2geo-xp-info">
                <span>XP</span>
                <strong>40</strong>
              </div>
            </article>
          </section>
        <PilotEvidenceStatus pilot={pilot}/>
        <ContinuacionDeMision expansion={mission} onComplete={()=>{setModalCompletadoOpen(true);}} onRestart={reiniciarActividadAct2}/>
</section>

        {modalProfesorOpen && (
          <section className="act2geo-profesor-modal-overlay">
            <article
              className={`act2geo-profesor-modal ${
                estadoProfesor === "reproduciendo"
                  ? "act2geo-profesor-modal-playing"
                  : ""
              }`}
            >
              <button
                type="button"
                className="act2geo-profesor-close"
                onClick={cerrarProfesorAstroAct2}
                aria-label="Cerrar explicación del Profesor Astro"
              >
                <FiX />
              </button>

              <div className="act2geo-profesor-hero">
                <video
                  ref={videoProfesorRef}
                  src={videoProfesorPistasAct2}
                  className="act2geo-profesor-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasProfesorRef}
                  className="act2geo-profesor-canvas"
                  role="img"
                  aria-label="Profesor Astro explicando la actividad"
                />

                <span className="act2geo-profesor-orbit"></span>
              </div>

              <div className="act2geo-profesor-content">
                <span className="act2geo-profesor-badge">
                  <FiVolume2 />
                  Profesor Astro
                </span>

                <h2>Observa antes de elegir</h2>

                <div className="act2geo-profesor-cloud">
                  <span className="act2geo-profesor-cloud-dot act2geo-profesor-cloud-dot-one"></span>
                  <span className="act2geo-profesor-cloud-dot act2geo-profesor-cloud-dot-two"></span>

                  <p>
                    {textoProfesor || textoInicialProfesorAstroAct2}

                    {estadoProfesor === "reproduciendo" && (
                      <span className="act2geo-profesor-cursor"></span>
                    )}
                  </p>
                </div>

                <div className="act2geo-profesor-controls">
                  <button
                    type="button"
                    className="act2geo-profesor-play"
                    onClick={iniciarProfesorAstroAct2}
                  >
                    <FiPlay />
                    Reproducir
                  </button>

                  <button type="button" onClick={pausarProfesorAstroAct2}>
                    <FiPause />
                    Pausar
                  </button>

                  <button type="button" onClick={repetirProfesorAstroAct2}>
                    <FiRotateCcw />
                    Reiniciar
                  </button>
                </div>
              </div>

              <aside className="act2geo-profesor-transcript">
                <h3>Texto del profesor</h3>

                {guionProfesorAstroAct2.map((linea, indice) => (
                  <p
                    key={`profesor-act2-${linea}`}
                    className={obtenerClaseLineaProfesorAct2(indice)}
                    style={
                      {
                        "--progreso-linea":
                          obtenerProgresoLineaProfesorAct2(indice),
                      } as CSSProperties
                    }
                  >
                    {linea}
                  </p>
                ))}
              </aside>

              <audio
                ref={audioProfesorRef}
                src={audioProfesorAstro}
                preload="auto"
              />
            </article>
          </section>
        )}

        {modalPistasOpen && pistaActiva && (
          <section className="act2geo-pistas-modal-overlay">
            <article
              className={`act2geo-pistas-modal ${
                estadoPista === "reproduciendo"
                  ? "act2geo-pistas-modal-playing"
                  : ""
              } ${
                pistaActiva.personaje === "profesor"
                  ? "act2geo-pistas-modal-profesor"
                  : "act2geo-pistas-modal-byte"
              }`}
            >
              <button
                type="button"
                className="act2geo-pistas-close"
                onClick={cerrarPistasAct2}
                aria-label="Cerrar pistas"
              >
                <FiX />
              </button>

              <div className="act2geo-pistas-hero">
                <video
                  ref={videoPistaRef}
                  src={pistaActiva.video}
                  className="act2geo-pistas-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasPistaRef}
                  className="act2geo-pistas-canvas"
                  role="img"
                  aria-label={pistaActiva.etiqueta}
                />

                <span className="act2geo-pistas-orbit"></span>
              </div>

              <div className="act2geo-pistas-content">
                <span className="act2geo-pistas-badge">
                  <FiVolume2 />
                  {pistaActiva.etiqueta}
                </span>

                <h2>{pistaActiva.tituloModal}</h2>

                <div className="act2geo-pistas-cloud">
                  <span className="act2geo-pistas-cloud-dot act2geo-pistas-cloud-dot-one"></span>
                  <span className="act2geo-pistas-cloud-dot act2geo-pistas-cloud-dot-two"></span>

                  <p>
                    {textoPista || textoInicialPistaAct2}

                    {estadoPista === "reproduciendo" && (
                      <span className="act2geo-pistas-cursor"></span>
                    )}
                  </p>
                </div>

                <div className="act2geo-pistas-controls">
                  <button
                    type="button"
                    className="act2geo-pistas-play"
                    onClick={iniciarPistaAct2}
                  >
                    <FiPlay />
                    Reproducir
                  </button>

                  <button type="button" onClick={pausarPistaAct2}>
                    <FiPause />
                    Pausar
                  </button>

                  <button type="button" onClick={repetirPistaAct2}>
                    <FiRotateCcw />
                    Reiniciar
                  </button>
                </div>
              </div>

              <aside className="act2geo-pistas-panel">
                <h3>Elige una pista</h3>

                <div className="act2geo-pistas-options">
                  {ordenPistasAct2.map((pistaId) => {
                    const pista = pistasAct2[pistaId];

                    return (
                      <button
                        key={pista.id}
                        type="button"
                        className={`act2geo-pistas-option ${
                          pistaSeleccionada === pista.id
                            ? "act2geo-pistas-option-active"
                            : ""
                        }`}
                        onClick={() => seleccionarPistaAct2(pista.id)}
                      >
                        <span>{pista.etiqueta}</span>
                        <strong>{pista.nombre}</strong>
                      </button>
                    );
                  })}
                </div>

                <div className="act2geo-pistas-transcript">
                  <h3>Texto de la pista</h3>

                  {pistaActiva.guion.map((linea, indice) => (
                    <p
                      key={`${pistaActiva.id}-${linea}`}
                      className={obtenerClaseLineaPistaAct2(indice)}
                      style={
                        {
                          "--progreso-linea":
                            obtenerProgresoLineaPistaAct2(indice),
                        } as CSSProperties
                      }
                    >
                      {linea}
                    </p>
                  ))}
                </div>
              </aside>

              <audio
                ref={audioPistaRef}
                src={pistaActiva.audio}
                preload="auto"
              />
            </article>
          </section>
        )}

        {modalSombraOpen && (
          <div
            className="act2geo-sombra-modal-overlay"
            onClick={cerrarSombraYReiniciarAct2}
          >
            <section
              className={`act2geo-sombra-modal ${
                estadoSombra === "reproduciendo"
                  ? "act2geo-sombra-modal-playing"
                  : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act2geo-sombra-title"
            >
              <div className="act2geo-sombra-decoration" aria-hidden="true">
                <span className="act2geo-sombra-glow act2geo-sombra-glow-one"></span>
                <span className="act2geo-sombra-glow act2geo-sombra-glow-two"></span>
                <span className="act2geo-sombra-dot act2geo-sombra-dot-one"></span>
                <span className="act2geo-sombra-dot act2geo-sombra-dot-two"></span>
                <span className="act2geo-sombra-dot act2geo-sombra-dot-three"></span>
              </div>

              <button
                type="button"
                className="act2geo-sombra-close"
                onClick={cerrarSombraYReiniciarAct2}
                aria-label="Cerrar mensaje de Sombra"
              >
                <FiX />
              </button>

              <div className="act2geo-sombra-hero">
                <video
                  ref={videoSombraRef}
                  src={videoSombraErrorAct2}
                  className="act2geo-sombra-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasSombraRef}
                  className="act2geo-sombra-canvas"
                  role="img"
                  aria-label="Sombra animando un mensaje para volver a intentar"
                />

                <span className="act2geo-sombra-orbit"></span>
              </div>

              <div className="act2geo-sombra-content">
 <DetalleErroresDeMision items={[...([{id:"native-0",title:"Pieza del puente",answer:String(segmentoColocado??""),correct:segmentoColocado==="pieza3",hint:"Compara la forma y la longitud del hueco con cada pieza; prueba el encaje.",target:".act2geo-layout"}]),...mission.items]} onCorrect={(item)=>{cerrarSombraAct2(); setRevisado(false); setEstadoPuenteAct2("reposo"); mission.beginCorrection(item);}} onRestart={reiniciarActividadAct2}/>

                <span className="act2geo-sombra-badge">
                  <FiVolume2 /> Mensaje de Sombra
                </span>

                <h2 id="act2geo-sombra-title">Casi lo logras</h2>

                <div className="act2geo-sombra-cloud">
                  <span className="act2geo-sombra-cloud-dot act2geo-sombra-cloud-dot-one"></span>
                  <span className="act2geo-sombra-cloud-dot act2geo-sombra-cloud-dot-two"></span>

                  <p>
                    {textoSombra || textoInicialSombraAct2}
                    {estadoSombra === "reproduciendo" && (
                      <span className="act2geo-sombra-cursor"></span>
                    )}
                  </p>
                </div>

                <div className="act2geo-sombra-controls">
                  <button
                    type="button"
                    className="act2geo-sombra-play"
                    onClick={iniciarSombraAct2}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button type="button" onClick={pausarSombraAct2}>
                    <FiPause /> Pausar
                  </button>

                  <button type="button" onClick={repetirSombraAct2}>
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>

                <button
                  type="button"
                  className="act2geo-sombra-try-btn"
                  onClick={cerrarSombraYReiniciarAct2}
                >
                  Volver a intentarlo
                </button>
              </div>

              <aside className="act2geo-sombra-transcript">
                <h3>Texto completo</h3>

                {guionSombraErrorAct2.map((linea, indice) => (
                  <p
                    key={`sombra-act2-${linea}`}
                    className={obtenerClaseLineaSombraAct2(indice)}
                    style={
                      {
                        "--progreso-sombra":
                          obtenerProgresoLineaSombraAct2(indice),
                      } as CSSProperties
                    }
                  >
                    {linea}
                  </p>
                ))}
              </aside>

              <audio
                ref={audioSombraRef}
                src={audioSombraErrorAct2}
                preload="auto"
              />
            </section>
          </div>
        )}

        {modalCompletadoOpen && (
          <div
            className="act2geo-complete-modal-overlay"
            onClick={cerrarCompletadoYReiniciarAct2}
          >
            <section
              className={`act2geo-complete-modal ${
                estadoCompletado === "reproduciendo"
                  ? "act2geo-complete-modal-playing"
                  : ""
              }`}
              onClick={(evento) => evento.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="act2geo-complete-title"
            >
              <img
                src={bannerCompletadoAct2}
                alt="Trofeo de actividad completada"
                className="act2geo-complete-bg-image"
                aria-hidden="true"
              />

              <div className="act2geo-complete-party" aria-hidden="true">
                <span className="act2geo-complete-confetti act2geo-complete-confetti-one"></span>
                <span className="act2geo-complete-confetti act2geo-complete-confetti-two"></span>
                <span className="act2geo-complete-confetti act2geo-complete-confetti-three"></span>
                <span className="act2geo-complete-confetti act2geo-complete-confetti-four"></span>
                <span className="act2geo-complete-floating-star act2geo-complete-floating-star-one">
                  ★
                </span>
                <span className="act2geo-complete-floating-star act2geo-complete-floating-star-two">
                  ★
                </span>
                <span className="act2geo-complete-floating-star act2geo-complete-floating-star-three">
                  ★
                </span>
              </div>

              <button
                type="button"
                className="act2geo-complete-close"
                onClick={cerrarCompletadoYReiniciarAct2}
                aria-label="Cerrar misión completada"
              >
                <FiX />
              </button>

              <div className="act2geo-complete-hero">
                <span className="act2geo-complete-check">
                  <FiCheck />
                </span>

                <video
                  ref={videoCompletadoRef}
                  src={videoNovaExplicando}
                  className="act2geo-complete-source-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />

                <canvas
                  ref={canvasCompletadoRef}
                  className="act2geo-complete-canvas"
                  role="img"
                  aria-label="Nova celebrando la actividad completada"
                />

                <span className="act2geo-complete-orbit"></span>
                <span className="act2geo-complete-spark act2geo-complete-spark-one"></span>
                <span className="act2geo-complete-spark act2geo-complete-spark-two"></span>
              </div>

              <div className="act2geo-complete-content"><AudioRetroalimentacion/>
                <span className="act2geo-complete-badge">
                  <GiTrophyCup /> Actividad completada
                </span>

                <h2 id="act2geo-complete-title">¡Misión completada!</h2>

                <div className="act2geo-complete-cloud">
                  <span className="act2geo-complete-cloud-dot act2geo-complete-cloud-dot-one"></span>
                  <span className="act2geo-complete-cloud-dot act2geo-complete-cloud-dot-two"></span>

                  <p>
                    {textoCompletado || textoInicialCompletadoAct2}
                    {estadoCompletado === "reproduciendo" && (
                      <span className="act2geo-complete-cursor"></span>
                    )}
                  </p>
                </div>

                <div className="act2geo-complete-controls">
                  <button
                    type="button"
                    className="act2geo-complete-play"
                    onClick={iniciarCompletadoAct2}
                  >
                    <FiPlay /> Reproducir
                  </button>

                  <button type="button" onClick={pausarCompletadoAct2}>
                    <FiPause /> Pausar
                  </button>

                  <button type="button" onClick={repetirCompletadoAct2}>
                    <FiRotateCcw /> Reiniciar
                  </button>
                </div>

                <div className="act2geo-complete-summary">
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
                    <span className="act2geo-complete-star">★</span>
                    <div>
                      <span>Recompensa</span>
                      <strong>+50 pts</strong>
                    </div>
                  </article>
                </div>
              </div>

              <aside className="act2geo-complete-side">
                <article className="act2geo-complete-transcript">
                  <h3>Texto completo</h3>

                  {guionCompletadoAct2.map((linea, indice) => (
                    <p
                      key={`completado-act2-${linea}`}
                      className={obtenerClaseLineaCompletadoAct2(indice)}
                      style={
                        {
                          "--progreso-complete":
                            obtenerProgresoLineaCompletadoAct2(indice),
                        } as CSSProperties
                      }
                    >
                      {linea}
                    </p>
                  ))}
                </article>

                <div className="act2geo-complete-actions">
                  <button
                    type="button"
                    className="act2geo-complete-next"
                    onClick={irASiguienteActividadAct2}
                  >
                    <FiArrowRight /> Siguiente actividad
                  </button>

                  <button type="button" onClick={reiniciarActividadAct2}>
                    <FiRotateCcw /> Repetir actividad
                  </button>

                  <button type="button" onClick={volverAActividadesAct2}>
                    <FiLogOut /> Volver a actividades
                  </button>
                </div>
              </aside>

              <audio
                ref={audioCompletadoRef}
                src={audioCierreNovaAct2}
                preload="auto"
              />
            </section>
          </div>
        )}

        <footer className="act2geo-footer">
          <div className="act2geo-footer-icons">
            <button type="button" onClick={() => navigate("/login")}>
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

export default Actividad2MathGeometry;
