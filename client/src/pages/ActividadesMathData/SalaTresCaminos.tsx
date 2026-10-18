import useMathDataEvidence from "../../hooks/useMathDataEvidence";
import PilotEvidenceStatus from "../../components/PilotEvidenceStatus";
import AudioRetroalimentacion from "../../components/AudioRetroalimentacion";
import CierreDeMision from "../../components/CierreDeMision";
import useMissionExpansion from "../../hooks/useMissionExpansion";
import EnsayoOtrosMundos from "../../components/EnsayoOtrosMundos";
import RetosDeMision from "../../components/RetosDeMision";
import DetalleErroresDeMision, {type MissionReviewItem} from "../../components/DetalleErroresDeMision";
import CabeceraCurricular from "../../components/CabeceraCurricular";
import { activityCurriculum } from "../../curriculum/activityCurriculum";
import "../../styles/activityExperience.css";
import { useState, useRef, useEffect } from "react";
import type { DragEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo_MathNova.png";
import "./SalaTresCaminos.css";

/* ---- Reutilizadas de las actividades anteriores (mismos recursos, sin cambios) ---- */
import baitSaludoImg from "../../assets/bait-saludo.png";
import baitPistaImg from "../../assets/bait-pista.png";
import villanoTrofeoCompleto from "../../assets/villano-trofeo-completo.png";
import villanoIntentar from "../../assets/villano-vintentar.png";
import estrellaMision from "../../assets/estrella-mision.png";
import iconoAciertos from "../../assets/icono-aciertos.png";
import iconoTiempo from "../../assets/icono-tiempo.png";
import iconoPrecision from "../../assets/icono-precision.png";
import iconoRecompensa from "../../assets/icono-recompensa.png";
import iconoInsignia from "../../assets/icono-insignia.png";
import baitHablandoVideo from "../../assets/bait-hablando.mp4";

/* ---- Nuevas para la Actividad 8 ---- */
import fondoSalaImg from "../../assets/fondo-sala-tres-caminos.png";
import villanoDivideSalaBannerImg from "../../assets/villano-divide-sala-banner.png";
import villanoDivideSalaAmenazaImg from "../../assets/villano-divide-sala-amenaza.png";


import introBaitAudioSala from "../../assets/intro_act8.mp3";
import pistaBaitAudioSala from "../../assets/pista_act8.mp3";
import baitAudioActividadCompletada from "../../assets/actividad_completada_act8.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/volver_intentarlo_act8.mp3";


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
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
  FiLock,
  FiUnlock,
  FiMove,
  FiKey,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup, GiStarMedal } from "react-icons/gi";

/* =========================================================
   DATOS DE LA MISIÓN
========================================================= */

type TipoEvento = "independientes" | "dependientes" | "mutuamente_excluyentes";
type Puerta = "alfa" | "beta" | "gamma";
type ColorCarta = "azul" | "verde" | "rojo" | "dorado";

const HEX_CARTA: Record<ColorCarta, string> = {
  azul: "#2563eb",
  verde: "#16a34a",
  rojo: "#dc2626",
  dorado: "#d97706",
};

const HEX_PUERTA: Record<Puerta, string> = {
  alfa: "#dc2626",
  beta: "#16a34a",
  gamma: "#2563eb",
};

const NOMBRE_PUERTA: Record<Puerta, string> = { alfa: "Alfa", beta: "Beta", gamma: "Gamma" };

const MAZO: { color: ColorCarta; forma: "diamante" | "estrella" }[] = [
  { color: "azul", forma: "diamante" },
  { color: "azul", forma: "diamante" },
  { color: "verde", forma: "diamante" },
  { color: "verde", forma: "diamante" },
  { color: "rojo", forma: "diamante" },
  { color: "dorado", forma: "estrella" },
];

const EVENT_TYPES: { id: TipoEvento; label: string }[] = [
  { id: "independientes", label: "Independientes" },
  { id: "dependientes", label: "Dependientes" },
  { id: "mutuamente_excluyentes", label: "Mutuamente excluyentes" },
];

type JustificacionId = "j1" | "j2" | "j3";

const JUSTIFICACIONES: { id: JustificacionId; texto: string }[] = [
  {
    id: "j1",
    texto:
      "Porque el mazo vuelve a tener la misma composición después de cada extracción, así que las probabilidades no cambian.",
  },
  {
    id: "j2",
    texto:
      "Porque al no regresar la tarjeta, cambia la composición del mazo y las probabilidades del siguiente evento.",
  },
  {
    id: "j3",
    texto: "Porque abrir una puerta impide abrir la otra en la misma activación: no pueden ocurrir juntas.",
  },
];

interface Reto {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  tipoCorrecto: TipoEvento;
  justificacionCorrecta: JustificacionId;
}

const RETOS: Reto[] = [
  {
    id: "reto1",
    numero: 1,
    titulo: "Reto 1 · Con devolución",
    descripcion: "Se extrae una tarjeta y se regresa al mazo.",
    tipoCorrecto: "independientes",
    justificacionCorrecta: "j1",
  },
  {
    id: "reto2",
    numero: 2,
    titulo: "Reto 2 · Sin devolución",
    descripcion: "Se extrae una tarjeta y NO se regresa.",
    tipoCorrecto: "dependientes",
    justificacionCorrecta: "j2",
  },
  {
    id: "reto3",
    numero: 3,
    titulo: "Reto 3 · Bloqueo de puertas",
    descripcion: "En una misma activación, las puertas no pueden abrirse juntas.",
    tipoCorrecto: "mutuamente_excluyentes",
    justificacionCorrecta: "j3",
  },
];

const PUERTA_SEGURA: Puerta = "beta";

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

/* =========================================================
   COMPONENTE: PISTA FLOTANTE
   Widget de pista siempre visible en pantalla (position: fixed),
   inspirado en el patrón "FloatingByteHint" de la Actividad
   Cofre de Bienvenida. Se queda anclado en la esquina mientras
   se hace scroll, y se abre/cierra en el mismo lugar sin tapar
   toda la pantalla como un modal.
========================================================= */

function PistaFlotante({
  contenido,
  videoSrc,
  audioSrc,
}: {
  contenido: string;
  videoSrc: string;
  audioSrc?: string;
}) {
  const [abierta, setAbierta] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const sincronizarVideoConAudio = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;
    if (Math.abs(video.currentTime - audio.currentTime) > 0.35) {
      video.currentTime = audio.currentTime;
    }
  };

  const abrir = () => {
    setAbierta(true);
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    videoRef.current?.play();
  };

  const cerrar = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    videoRef.current?.pause();
    setReproduciendo(false);
    setAbierta(false);
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

  return (
    <div className={`sal-pista-flotante ${abierta ? "sal-pista-flotante-abierta" : ""}`}>
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onPlay={() => setReproduciendo(true)}
          onPause={() => setReproduciendo(false)}
          onEnded={() => setReproduciendo(false)}
          onTimeUpdate={actualizarProgreso}
        />
      )}

      {abierta && (
        <article className="sal-pista-panel">
          <button
            type="button"
            className="sal-pista-panel-cerrar"
            onClick={cerrar}
            aria-label="Cerrar pista de BIT"
          >
            <FiX />
          </button>

          <div className="sal-pista-panel-media">
            <video
              ref={videoRef}
              src={videoSrc}
              muted
              playsInline
              preload="auto"
              onTimeUpdate={sincronizarVideoConAudio}
              aria-hidden="true"
            />
          </div>

          <div className="sal-pista-panel-copy">
            <span className="sal-pista-panel-label">Pista de BIT</span>
            <p>{contenido}</p>

            <div className="sal-pista-panel-controles">
              <button type="button" onClick={() => saltar(-SALTO_SEGUNDOS)} aria-label="Retroceder 10 segundos">
                <FiRotateCcw />
              </button>
              <button
                type="button"
                className="sal-pista-panel-play"
                onClick={alternarReproduccion}
                aria-label={reproduciendo ? "Pausar" : "Reproducir"}
              >
                {reproduciendo ? <FiPause /> : <FiPlay />}
              </button>
              <button type="button" onClick={() => saltar(SALTO_SEGUNDOS)} aria-label="Adelantar 10 segundos">
                <FiRotateCw />
              </button>
            </div>

            <div className="sal-pista-panel-progress">
              <div style={{ width: `${progreso}%` }} />
            </div>
          </div>
        </article>
      )}

      <button
        type="button"
        className="sal-pista-launcher"
        onClick={abierta ? cerrar : abrir}
        aria-label="Abrir pista de BIT"
        aria-expanded={abierta}
      >
        <span>PISTA</span>
        <img src={baitPistaImg} alt="" draggable={false} />
        <i aria-hidden="true">?</i>
      </button>
    </div>
  );
}



/* =========================================================
   PEQUEÑO COMPONENTE: ÍCONO DE CARTA DEL MAZO
========================================================= */

function CartaIcono({ color, forma, atenuada = false }: { color: ColorCarta; forma: "diamante" | "estrella"; atenuada?: boolean }) {
  return (
    <span
      className={`sal-carta-icono ${forma === "estrella" ? "sal-carta-estrella" : "sal-carta-diamante"} ${
        atenuada ? "sal-carta-atenuada" : ""
      }`}
      style={{ background: forma === "diamante" ? HEX_CARTA[color] : undefined, color: HEX_CARTA[color] }}
    >
      {forma === "estrella" ? <GiStarMedal /> : null}
    </span>
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function SalaTresCaminos() {
 const mission=useMissionExpansion("mathdata-sala-tres-caminos");
  const navigate = useNavigate();
 const [missionNotice,setMissionNotice]=useState("");
 const missionClock=useRef(Date.now());
 const missionSaving=useRef(false);

  /* ---- Retos 1 a 3: clasificación + justificación ---- */
  const [clasificacion, setClasificacion] = useState<Record<string, TipoEvento | null>>({
    reto1: null,
    reto2: null,
    reto3: null,
  });
  const [justificacion, setJustificacion] = useState<Record<string, JustificacionId | "">>({
    reto1: "",
    reto2: "",
    reto3: "",
  });
  const [retoVerificado, setRetoVerificado] = useState<Record<string, boolean>>({
    reto1: false,
    reto2: false,
    reto3: false,
  });

  /* ---- Reto 3: demo interactiva de bloqueo de puertas ---- */
  const [demoPuerta, setDemoPuerta] = useState<"alfa" | "gamma" | null>(null);

  /* ---- Paso 4: registro y ruta segura (drag & drop) ---- */
  const [asignacion, setAsignacion] = useState<Record<string, TipoEvento | null>>({
    reto1: null,
    reto2: null,
    reto3: null,
  });
  const dragTipoRef = useRef<TipoEvento | null>(null);
  const [slotSobre, setSlotSobre] = useState<string | null>(null);
  const [registroVerificado, setRegistroVerificado] = useState(false);

  const [puertaFinal, setPuertaFinal] = useState<Puerta | null>(null);

  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarBaitExito, setMostrarBaitExito] = useState(false);
  const [mostrarBaitFallo, setMostrarBaitFallo] = useState(false);

  /* ---- Derivados ---- */
  const retoCorrecto = (retoId: string) => {
    const reto = RETOS.find((r) => r.id === retoId)!;
    return clasificacion[retoId] === reto.tipoCorrecto && justificacion[retoId] === reto.justificacionCorrecta;
  };

  const seleccionarClasificacion = (retoId: string, tipo: TipoEvento) => {
 if(mission.correctOnly && retoCorrecto(retoId))return;
    setClasificacion((prev) => ({ ...prev, [retoId]: tipo }));
    setRetoVerificado((prev) => ({ ...prev, [retoId]: false }));
  };

  const seleccionarJustificacion = (retoId: string, id: JustificacionId) => {
 if(mission.correctOnly && retoCorrecto(retoId))return;
    setJustificacion((prev) => ({ ...prev, [retoId]: id }));
    setRetoVerificado((prev) => ({ ...prev, [retoId]: false }));
  };

  const verificarReto = (retoId: string) => {
    pilot.recordAll();
    setRetoVerificado((prev) => ({ ...prev, [retoId]: true }));
  };

  const tiposAsignados = new Set(Object.values(asignacion).filter(Boolean) as TipoEvento[]);

  const manejarDragStartTipo = (tipo: TipoEvento) => () => {
    dragTipoRef.current = tipo;
  };

  const manejarDragOverSlot = (retoId: string) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSlotSobre(retoId);
  };

  const manejarDropSlot = (retoId: string) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(mission.correctOnly && registroEsCorrecto)return;
    const tipo = dragTipoRef.current;
    setSlotSobre(null);
    if (!tipo) return;
    setAsignacion((prev) => {
      const copia = { ...prev };
      // quita el tipo de cualquier otro slot donde ya estuviera
      for (const key of Object.keys(copia)) {
        if (copia[key] === tipo) copia[key] = null;
      }
      copia[retoId] = tipo;
      return copia;
    });
    dragTipoRef.current = null;
    setRegistroVerificado(false);
  };

  const limpiarSlot = (retoId: string) => {
 if(mission.correctOnly && registroEsCorrecto)return;
    setAsignacion((prev) => ({ ...prev, [retoId]: null }));
    setRegistroVerificado(false);
  };

  const verificarRegistro = () => {pilot.recordAll();setRegistroVerificado(true);};

  const registroEsCorrecto = RETOS.every((r) => asignacion[r.id] === r.tipoCorrecto);

  /* ---- Envío final: abrir la puerta ---- */
  const pilot=useMathDataEvidence("mathdata-sala-tres-caminos",mission,()=>({clasificacion,justificacion,asignacion,puerta_final:puertaFinal}));
  useEffect(()=>{const attempt=pilot.receipt?.intento_piloto;if(!attempt)return;
    setResultado(attempt.evaluacion.completada?"exito":"fallo");
  },[pilot.receipt]);

  const handleAbrirPuerta = async () => {
    if(pilot.busy)return;
    try {await pilot.finish(Math.max(1,Math.floor((Date.now()-missionClock.current)/1000)),50);}
    catch(error){setMissionNotice(error instanceof Error?error.message:"No se pudo guardar; conserva esta pestaña.");}
  };

  const handleReiniciarActividad = () => {
 mission.reset();
 pilot.resetSession();
    setClasificacion({ reto1: null, reto2: null, reto3: null });
    setJustificacion({ reto1: "", reto2: "", reto3: "" });
    setRetoVerificado({ reto1: false, reto2: false, reto3: false });
    setDemoPuerta(null);
    setAsignacion({ reto1: null, reto2: null, reto3: null });
    setRegistroVerificado(false);
    setPuertaFinal(null);
    setResultado(null);
  };

  /* ---- Resumen para las pantallas de resultado ---- */
  const aciertos = pilot.evaluation?.aciertos ?? ([
    retoCorrecto("reto1"),
    retoCorrecto("reto2"),
    retoCorrecto("reto3"),
    registroEsCorrecto,
    puertaFinal === PUERTA_SEGURA,
  ].filter(Boolean).length + mission.correctCount);
  const totalPasos = mission.total;
  const precision = Math.round((aciertos / totalPasos) * 100);
  const puntosGanados = pilot.receipt?.intento_piloto?.xp_obtenido ?? (resultado === "exito" ? 50 : 10);

  // ==========================================
  // VENTANA EMERGENTE: ACTIVIDAD COMPLETADA
  // ==========================================

  
 const missionNativeItems:MissionReviewItem[]=[{id:"reto1",title:"Clasificación y justificación 1",answer:String(`${clasificacion.reto1}, ${justificacion.reto1}`),correct:retoCorrecto("reto1"),hint:"Revisa si ambos eventos pueden ocurrir y si uno modifica al otro.",target:'[data-review-target="native-reto1"]'},{id:"reto2",title:"Clasificación y justificación 2",answer:String(`${clasificacion.reto2}, ${justificacion.reto2}`),correct:retoCorrecto("reto2"),hint:"Compara las posibilidades antes y después del primer evento.",target:'[data-review-target="native-reto2"]'},{id:"reto3",title:"Clasificación y justificación 3",answer:String(`${clasificacion.reto3}, ${justificacion.reto3}`),correct:retoCorrecto("reto3"),hint:"Decide si pueden ocurrir juntos; justifica tu clasificación.",target:'[data-review-target="native-reto3"]'},{id:"registro",title:"Registro de mecanismos",answer:String(JSON.stringify(asignacion)),correct:registroEsCorrecto,hint:"Cada mecanismo debe quedar en su categoría correcta.",target:'[data-review-target="native-registro"]'},{id:"puerta",title:"Puerta segura",answer:String(puertaFinal),correct:puertaFinal===PUERTA_SEGURA,hint:"Relaciona los mecanismos clasificados con la puerta segura.",target:'[data-review-target="native-puerta"]'}];
 const resumeMission=(item?:MissionReviewItem)=>{setResultado(null);mission.beginCorrection(item);};
if (resultado === "exito") return (
    <div className="res-modal-overlay">
      <div className="res-modal-card res-modal-exito res-modal-wide" role="dialog" aria-modal="true" aria-label="Misión completada">
        <div className="res-confetti" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className={`res-confetti-dot res-confetti-dot-${i % 6}`} />
          ))}
        </div>

        <div className="res-titulo-row">
          <div className="res-icono-check">✔</div>
          <div>
            <h1 className="res-titulo">¡Actividad completada!</h1>
            <p className="res-subtitulo">
              Has terminado con éxito la misión de{" "}
              <span className="res-mathnova-color">MathData</span>.
            </p>
          </div>
        </div>

        <div className="res-mensaje-box res-mensaje-verde">
          <div className="res-icono-estrella-circle">
            <img src={estrellaMision} alt="estrella" />
          </div>
          <div>
            <strong>¡Excelente trabajo, agente!</strong>
            <p>
              Clasificaste correctamente los tres mecanismos, completaste el
              registro y elegiste la puerta segura. La Sala de los Tres
              Caminos quedó despejada.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rmp-bait-mensaje-trigger res-modal-villano-trigger"
          onClick={() => setMostrarBaitExito(true)}
          aria-label="Abrir mensaje de Bait"
        >
          <span className="rmp-bait-mensaje-dot" />
          <FiMessageSquare />
          Bait tiene un mensaje para ti
        </button>

        <div className="res-villano-exito-group">
          <img
            src={villanoTrofeoCompleto}
            alt="Villano celebrando con trofeo"
            className="res-villano-trofeo-img"
          />
        </div>

        <AudioRetroalimentacion/><div className="res-modal-body">
          <div className="res-modal-left">
            <div className="res-resumen-card">
              <div className="res-resumen-header">
                <FiBarChart2 />
                <span>Resumen de la actividad</span>
              </div>
              <div className="res-resumen-stats">
                <div className="res-stat">
                  <img src={iconoAciertos} alt="" className="res-stat-img" />
                  <strong className="res-stat-num-verde">{aciertos}/{totalPasos}</strong>
                  <small>Pasos correctos</small>
                  <em>¡Perfecto!</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoTiempo} alt="" className="res-stat-img" />
                  <strong>—</strong>
                  <small>Tiempo</small>
                  <em>min</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoPrecision} alt="" className="res-stat-img" />
                  <strong className="res-stat-num-verde">{precision}%</strong>
                  <small>Precisión</small>
                  <em>¡Impecable!</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoRecompensa} alt="" className="res-stat-img" />
                  <strong className="res-pts-naranja">{puntosGanados} XP</strong>
                  <small>Recompensa</small>
                  <em>XP del intento</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoInsignia} alt="" className="res-stat-img" />
                  <strong>Misión<br />cumplida</strong>
                  <small>Insignia obtenida</small>
                  <em>¡Felicidades!</em>
                </div>
              </div>
            </div>
          </div>

          <div className="res-modal-right">
            <button className="res-btn res-btn-azul" onClick={() => navigate("/actividades-math-data")}>
              Siguiente actividad
            </button>
            <button className="res-btn res-btn-outline" onClick={handleReiniciarActividad}>
              Repetir actividad
            </button>
            <button
              className="res-btn res-btn-outline"
              onClick={() => navigate("/actividades-math-data")}
            >
              Volver a actividades
            </button>
          </div>
        </div>
      </div>

      {mostrarBaitExito && (
        <PistaBaitModal
          titulo="Bait tiene un mensaje para ti"
          contenido="¡Lo lograste, agente! Distinguiste bien los eventos independientes, dependientes y mutuamente excluyentes, y elegiste la puerta segura. DIVIDE quería confundirte con los tres mecanismos, pero tu análisis fue más fuerte."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioActividadCompletada}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitExito(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // VENTANA EMERGENTE: VUELVE A INTENTARLO
  // ==========================================

  if (resultado === "fallo") return (
    <div className="res-modal-overlay">
      <div className="res-modal-card res-modal-fallo res-modal-wide" role="dialog" aria-modal="true" aria-label="Revisa tus respuestas">
        <div className="res-titulo-row">
          <div className="res-icono-retry">&#x1F504;</div>
          <div>
            <h1 className="res-titulo">¡Vuelve a intentarlo!</h1>
            <p className="res-subtitulo">
              Aún no completas con éxito la misión de{" "}
              <span className="res-mathnova-color">MathData</span>.
            </p>
          </div>
        </div>

        <div className="res-mensaje-box res-mensaje-azul">
          <div className="res-icono-datos">📊</div>
          <div>
            <strong>¡No te rindas, agente!</strong>
            <p>
              Revisa cada reto: qué cambia y qué permanece igual en el mazo,
              y por qué las puertas no pueden abrirse juntas. Luego vuelve a
              completar el registro antes de elegir la puerta.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rmp-bait-mensaje-trigger res-modal-villano-trigger"
          onClick={() => setMostrarBaitFallo(true)}
          aria-label="Abrir mensaje de Bait"
        >
          <span className="rmp-bait-mensaje-dot" />
          <FiMessageSquare />
          Bait tiene un mensaje para ti
        </button>

        <div className="res-villano-fallo-group">
          <img src={villanoIntentar} alt="Villano retando" className="res-villano-img" />
        </div>

        <AudioRetroalimentacion/><div className="res-modal-body"><DetalleErroresDeMision items={pilot.reviewItems([...missionNativeItems,...mission.items])} onCorrect={resumeMission} onRestart={handleReiniciarActividad}/>
          <div className="res-modal-left">
            <div className="res-resumen-card">
              <div className="res-resumen-header">
                <FiBarChart2 />
                <span>Resumen de la actividad</span>
              </div>
              <div className="res-resumen-stats">
                <div className="res-stat">
                  <img src={iconoAciertos} alt="" className="res-stat-img" />
                  <strong>{aciertos}/{totalPasos}</strong>
                  <small>Pasos correctos</small>
                  <em>¡Sigue así!</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoTiempo} alt="" className="res-stat-img" />
                  <strong>—</strong>
                  <small>Tiempo</small>
                  <em>min</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoPrecision} alt="" className="res-stat-img" />
                  <strong>{precision}%</strong>
                  <small>Precisión</small>
                  <em>Puedes mejorar</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoRecompensa} alt="" className="res-stat-img" />
                  <strong className="res-pts-azul">{puntosGanados} XP</strong>
                  <small>Recompensa</small>
                  <em>XP del intento</em>
                </div>
                <div className="res-stat-sep" />
                <div className="res-stat">
                  <img src={iconoInsignia} alt="" className="res-stat-img" />
                  <strong>Sigue intentando</strong>
                  <small>Insignia obtenida</small>
                  <em>¡No te rindas!</em>
                </div>
              </div>
            </div>
          </div>

          <div className="res-modal-right">
            <button className="res-btn res-btn-azul" onClick={()=>resumeMission(missionNativeItems.find(item=>item.correct===false))}>
              Corregir errores
            </button>
            <button className="res-btn res-btn-outline" onClick={() => setMostrarPistaBait(true)}>
              Ver pista
            </button>
            <button
              className="res-btn res-btn-outline"
              onClick={() => navigate("/actividades-math-data")}
            >
              {"<-"} Volver a actividades
            </button>
          </div>
        </div>
      </div>

      {mostrarBaitFallo && (
        <PistaBaitModal
          titulo="Bait tiene un mensaje para ti"
          contenido="Agente, DIVIDE mezcló las reglas, pero tú puedes ordenarlas de nuevo. Revisa si el mazo recupera su composición, si cambia al no devolver la tarjeta, y si dos puertas pueden abrirse a la vez."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioVuelveAIntentarlo}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitFallo(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="Si la tarjeta se regresa al mazo, la composición no cambia: eso es independencia. Si la tarjeta no se regresa, la composición cambia y afecta el siguiente resultado: eso es dependencia. Si abrir una puerta impide abrir otra en la misma activación, esos sucesos son mutuamente excluyentes."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioSala}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="sal-page mn-activity">
      {/* ================= SIDEBAR ================= */}
      <aside className="sal-sidebar">
        <img src={logo} alt="MathNova" className="sal-logo-img" />

        <nav className="sal-nav">
          <button className="sal-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="sal-nav-item sal-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button className="sal-nav-item" type="button" onClick={() => navigate("/retroalimentacion")}>
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="sal-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button className="sal-nav-item" type="button" onClick={() => navigate("/perfil-alumno")}>
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button className="sal-nav-item" type="button" onClick={() => navigate("/estadisticas")}>
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        <div className="sal-sidebar-villano">
          <img
            src={villanoDivideSalaAmenazaImg}
            alt="Interferencia: DIVIDE ha mezclado las reglas de los mecanismos. No te dejes confundir."
            className="sal-villano-amenaza-img"
          />
        </div>

        

        
      
        <div className="mn-sidebar-mission"><span>Tu misión</span><strong>{activityCurriculum["mathdata-sala-tres-caminos"].objective}</strong></div>
</aside>

      {/* ================= CONTENIDO ================= */}
      <main
        className="sal-main"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(5,11,31,0.5), rgba(5,11,31,0.8)), url(${fondoSalaImg})`,
        }}
      >
        <header className="sal-header">
          
          <button type="button" className="sal-ayuda-btn" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>
        <CabeceraCurricular curriculum={activityCurriculum["mathdata-sala-tres-caminos"]} />
        <EnsayoOtrosMundos activityId="mathdata-sala-tres-caminos"/>


        {/* TÍTULO */}
        <div className="sal-titulo-bloque">
          <h1>La Sala de los Tres Caminos</h1>
          <p>Eventos independientes, dependientes y mutuamente excluyentes.</p>
        </div>

        {/* BANNER: BIT EXPLICA + PUERTAS + VILLANO (esquina) */}
        <div className="sal-banner-card">
          <div className="sal-banner-top">
            <div className="sal-explica-fila">
              <img src={baitSaludoImg} alt="Bait explicando" className="sal-bait-avatar-img" />

              <div className="sal-hola-agente">
                <div>
                  <strong>BIT te explica</strong>
                  <p>
                    Analizaremos tres mecanismos paso a paso. Observa qué
                    cambia y qué permanece igual. Clasifica cada situación
                    y al final encontraremos la ruta segura.
                  </p>
                </div>
                <button
                  className="sal-audio-btn"
                  type="button"
                  onClick={() => setMostrarIntroBait(true)}
                  aria-label="Escuchar explicación"
                >
                  <FiVolume2 />
                </button>
              </div>
            </div>

            <img
              src={villanoDivideSalaBannerImg}
              alt="Interferencia: DIVIDE dice que tres puertas, tres mecanismos y todo desordenando todo. ¿Seguro que podrás elegir el camino correcto?"
              className="sal-villano-banner-corner"
            />
          </div>

          <div className="sal-puertas-row">
            {(["alfa", "beta", "gamma"] as Puerta[]).map((p) => (
              <div className="sal-puerta-card" key={p} style={{ borderColor: HEX_PUERTA[p] }}>
                <strong style={{ color: HEX_PUERTA[p] }}>{NOMBRE_PUERTA[p].toUpperCase()}</strong>
                <div className="sal-puerta-icono" style={{ background: HEX_PUERTA[p] }}>
                  <FiLock />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sal-mazo-row">
          <div className="sal-info-card">
            <strong>Mazo de acceso</strong>
            <small>6 tarjetas</small>
            <div className="sal-mazo-cartas">
              {MAZO.map((c, i) => (
                <CartaIcono key={i} color={c.color} forma={c.forma} />
              ))}
            </div>
          </div>

          <div className="sal-info-card">
            <strong>Composición inicial</strong>
            <ul className="sal-composicion-lista">
              <li>
                <span className="sal-comp-punto" style={{ background: HEX_CARTA.azul }} /> Azules <b>2</b>
              </li>
              <li>
                <span className="sal-comp-punto" style={{ background: HEX_CARTA.verde }} /> Verdes <b>2</b>
              </li>
              <li>
                <span className="sal-comp-punto" style={{ background: HEX_CARTA.rojo }} /> Rojas <b>1</b>
              </li>
              <li>
                <span className="sal-comp-punto" style={{ background: HEX_CARTA.dorado }} /> Doradas <b>1</b>
              </li>
              <li className="sal-comp-total">Total <b>6</b></li>
            </ul>
          </div>

          <div className="sal-info-card">
            <strong>¿Qué debo observar?</strong>
            <ul className="sal-observar-lista">
              <li><FiCheckCircle /> Si el primer resultado cambia las condiciones del segundo.</li>
              <li><FiCheckCircle /> Si el mazo mantiene la misma composición.</li>
              <li><FiCheckCircle /> Si dos acciones pueden hacerse al mismo tiempo o no.</li>
            </ul>
          </div>
        </div>

        {/* RETOS 1 A 3 */}
        <div className="sal-retos-row">
          {RETOS.map((reto) => (
            <div data-review-target={`native-${reto.id}`} className="sal-reto-card" key={reto.id}>
              <div className="sal-reto-header">
                <span className="sal-reto-num">{reto.numero}</span>
                <strong>{reto.titulo}</strong>
                {retoVerificado[reto.id] && (
                  retoCorrecto(reto.id)
                    ? <FiCheckCircle className="sal-check-verde" />
                    : <FiCheckCircle className="sal-check-alerta" />
                )}
              </div>
              <p className="sal-reto-texto">{reto.descripcion}</p>

              <div className="sal-demostracion">
                <small className="sal-demostracion-titulo">Demostración</small>

                {reto.id === "reto1" && (
                  <div className="sal-demo-antes-despues">
                    <div>
                      <small>Antes de extraer</small>
                      <div className="sal-mazo-mini">
                        {MAZO.map((c, i) => <CartaIcono key={i} color={c.color} forma={c.forma} />)}
                      </div>
                    </div>
                    <div>
                      <small>Después de devolver</small>
                      <div className="sal-mazo-mini">
                        {MAZO.map((c, i) => <CartaIcono key={i} color={c.color} forma={c.forma} />)}
                      </div>
                    </div>
                  </div>
                )}

                {reto.id === "reto2" && (
                  <div className="sal-demo-antes-despues">
                    <div>
                      <small>Antes de extraer</small>
                      <div className="sal-mazo-mini">
                        {MAZO.map((c, i) => <CartaIcono key={i} color={c.color} forma={c.forma} />)}
                      </div>
                    </div>
                    <div>
                      <small>Después (sin devolución)</small>
                      <div className="sal-mazo-mini">
                        {MAZO.slice(1).map((c, i) => <CartaIcono key={i} color={c.color} forma={c.forma} />)}
                        <CartaIcono color={MAZO[0].color} forma={MAZO[0].forma} atenuada />
                      </div>
                      <small className="sal-tarjeta-retirada-label">Tarjeta retirada</small>
                    </div>
                  </div>
                )}

                {reto.id === "reto3" && (
                  <div className="sal-demo-puertas">
                    <div className={`sal-demo-puerta-escenario ${demoPuerta === "alfa" ? "sal-demo-activo" : ""}`}>
                      <small>Si abres ALFA...</small>
                      <div className="sal-demo-puerta-flujo">
                        <span className="sal-mini-puerta" style={{ background: HEX_PUERTA.alfa }}><FiUnlock /></span>
                        →
                        <span className="sal-mini-puerta sal-mini-puerta-bloqueada"><FiLock /></span>
                      </div>
                      <small>bloquea Beta</small>
                    </div>
                    <div className={`sal-demo-puerta-escenario ${demoPuerta === "gamma" ? "sal-demo-activo" : ""}`}>
                      <small>Si abres GAMMA...</small>
                      <div className="sal-demo-puerta-flujo">
                        <span className="sal-mini-puerta" style={{ background: HEX_PUERTA.gamma }}><FiUnlock /></span>
                        →
                        <span className="sal-mini-puerta sal-mini-puerta-bloqueada"><FiLock /></span>
                      </div>
                      <small>bloquea Beta</small>
                    </div>

                    <div className="sal-demo-botones">
                      <button type="button" className="sal-demo-btn sal-demo-btn-alfa" onClick={() => setDemoPuerta("alfa")}>
                        Abrir Alfa
                      </button>
                      <button type="button" className="sal-demo-btn sal-demo-btn-reset" onClick={() => setDemoPuerta(null)}>
                        Reiniciar
                      </button>
                      <button type="button" className="sal-demo-btn sal-demo-btn-gamma" onClick={() => setDemoPuerta("gamma")}>
                        Abrir Gamma
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="sal-clasificacion-bloque">
                <small className="sal-reto-texto">Tu clasificación<br />¿Qué tipo de eventos representa?</small>
                <div className="sal-tipo-chips">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`sal-tipo-chip ${clasificacion[reto.id] === t.id ? "sal-tipo-chip-activo" : ""}`}
                      onClick={() => seleccionarClasificacion(reto.id, t.id)}
                      aria-pressed={clasificacion[reto.id] === t.id}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sal-justificacion-bloque">
                <small className="sal-reto-texto">Tu justificación<br />Elige por qué ocurre así.</small>
                <select
                  className="sal-select"
                  value={justificacion[reto.id]}
                  onChange={(e) => seleccionarJustificacion(reto.id, e.target.value as JustificacionId)}
                >
                  <option value="">Selecciona una opción</option>
                  {JUSTIFICACIONES.map((j) => (
                    <option key={j.id} value={j.id}>{j.texto}</option>
                  ))}
                </select>
              </div>

              <button type="button" className="sal-verificar-btn" onClick={() => verificarReto(reto.id)}>
                <FiCheck /> Verificar
              </button>
            </div>
          ))}
        </div>

        {/* PASO 4: REGISTRO Y RUTA SEGURA */}
        <div className="sal-registro-row">
          <div data-review-target="native-registro" className="sal-registro-card">
            <div className="sal-paso-header">
              <span className="sal-paso-num">4</span>
              <strong>Registro y ruta segura</strong>
              {registroVerificado && (
                registroEsCorrecto
                  ? <FiCheckCircle className="sal-check-verde" />
                  : <FiCheckCircle className="sal-check-alerta" />
              )}
            </div>
            <p className="sal-reto-texto">Relación correcta: arrastra cada tipo de evento al reto que le corresponde.</p>

            <div className="sal-registro-grid">
              <div className="sal-slots-columna">
                {RETOS.map((reto) => (
                  <div
                    key={reto.id}
                    className={`sal-slot ${slotSobre === reto.id ? "sal-slot-sobre" : ""} ${
                      registroVerificado
                        ? asignacion[reto.id] === reto.tipoCorrecto
                          ? "sal-slot-correcto"
                          : "sal-slot-incorrecto"
                        : ""
                    }`}
                    onDragOver={manejarDragOverSlot(reto.id)}
                    onDrop={manejarDropSlot(reto.id)}
                    onDragLeave={() => setSlotSobre(null)}
                  >
                    <small>{reto.titulo}</small>
                    {asignacion[reto.id] ? (
                      <span className="sal-slot-chip">
                        {EVENT_TYPES.find((t) => t.id === asignacion[reto.id])?.label}
                        <button type="button" onClick={() => limpiarSlot(reto.id)} aria-label="Quitar">
                          <FiX />
                        </button>
                      </span>
                    ) : (
                      <span className="sal-slot-vacio">Suelta aquí</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="sal-chips-columna">
                {EVENT_TYPES.map((t) => (
                  <div
                    key={t.id}
                    className={`sal-tipo-chip-drag ${tiposAsignados.has(t.id) ? "sal-tipo-chip-usado" : ""}`}
                    draggable={!tiposAsignados.has(t.id)}
                    onDragStart={manejarDragStartTipo(t.id)}
                  >
                    <FiMove /> {t.label}
                  </div>
                ))}
              </div>
            </div>

            <button type="button" className="sal-verificar-btn" onClick={verificarRegistro}>
              <FiCheck /> Verificar registro
            </button>
          </div>

          <div className="sal-ruta-card">
            <p className="sal-reto-texto">
              Cuando los tres retos estén clasificados y justificados, el sistema revelará la ruta segura.
            </p>
            <strong className="sal-ruta-pregunta">¿Qué puerta indicó el sistema como ruta segura?</strong>

            <div data-review-target="native-puerta" className="sal-puerta-opciones">
              {(["alfa", "beta", "gamma"] as Puerta[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`sal-puerta-opcion ${puertaFinal === p ? "sal-puerta-opcion-activa" : ""}`}
                  style={{ borderColor: HEX_PUERTA[p], background: puertaFinal === p ? HEX_PUERTA[p] : undefined }}
                  onClick={() => {if(!mission.correctOnly || puertaFinal!==PUERTA_SEGURA)setPuertaFinal(p);}}
                >
                  {NOMBRE_PUERTA[p]}
                </button>
              ))}
            </div>

            <p className="mn-finish-direction">Cuando completes los retos, usa «Terminar misión» al final de la actividad.</p>
          </div>
        </div>
      {missionNotice&&<p role="status">{missionNotice}</p>}<PilotEvidenceStatus pilot={pilot}/>
<RetosDeMision expansion={mission}/><CierreDeMision onFinish={()=>void handleAbrirPuerta()} /></main>

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="BIT te explica"
          contenido="Analizaremos tres mecanismos paso a paso. Observa qué cambia y qué permanece igual. Clasifica cada situación y al final encontraremos la ruta segura."
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioSala}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      <PistaFlotante
        contenido="Si la tarjeta se regresa al mazo, la composición no cambia: eso es independencia. Si la tarjeta no se regresa, la composición cambia y afecta el siguiente resultado: eso es dependencia. Si abrir una puerta impide abrir otra en la misma activación, esos sucesos son mutuamente excluyentes."
        videoSrc={baitHablandoVideo}
        audioSrc={pistaBaitAudioSala}
      />
    </div>
  );
}
