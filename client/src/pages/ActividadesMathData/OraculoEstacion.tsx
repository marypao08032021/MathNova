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
import { useState, useRef, useEffect } from "react";
import type { DragEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getSessionUser } from "../../utils/authSession";

import logo from "../../assets/logo_MathNova.png";
import "./OraculoEstacion.css";

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

/* ---- Nuevas para la Actividad 7 ---- */
import fondoOraculoImg from "../../assets/fondo-oraculo-estacion.png";
import villanoDivideOraculoImg from "../../assets/villano-divide-oraculo.png";

/* ---- Audios ---- */
import introBaitAudioOraculo from "../../assets/intro_act7.mp3";
import pistaBaitAudioOraculo from "../../assets/pista_act7.mp3";
import baitAudioActividadCompletada from "../../assets/actividad_completada_act7.mp3";
import baitAudioVuelveAIntentarlo from "../../assets/volver_intentarlo_act7.mp3";

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
  FiInfo,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
  FiZap,
  FiStar,
  FiEye,
  FiMove,
} from "react-icons/fi";
import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

/* =========================================================
   SESIÓN DEL ALUMNO
========================================================= */

type UsuarioSesionOraculo = {
  id_usuario?: number | string;
  idUsuario?: number | string;
  usuario_id?: number | string;
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  usuario?: UsuarioSesionOraculo;
  user?: UsuarioSesionOraculo;
  data?: UsuarioSesionOraculo;
  session?: UsuarioSesionOraculo;
};

const extraerIdUsuarioOraculo = (
  valor: unknown,
): number => {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return 0;
  }

  const usuario =
    valor as UsuarioSesionOraculo;

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
      extraerIdUsuarioOraculo(
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
      extraerIdUsuarioOraculo(
        candidato,
      );

    if (idUsuario > 0) {
      return idUsuario;
    }
  }

  return 0;
};

const formatearTiempoOraculo = (
  segundos: number,
): string => {
  const minutos = Math.floor(
    segundos / 60,
  );

  const segundosRestantes =
    segundos % 60;

  return `${String(minutos).padStart(
    2,
    "0",
  )}:${String(
    segundosRestantes,
  ).padStart(2, "0")}`;
};

/* =========================================================
   DATOS DE LA MISIÓN
========================================================= */

type Color = "azul" | "verde" | "rojo" | "dorado";
type ColorSenuelo = "morado" | "plateado";

const COLORES_CAPSULA: Color[] = ["azul", "verde", "rojo", "dorado"];
const SENUELOS: ColorSenuelo[] = ["morado", "plateado"];

const CONTEO: Record<Color, number> = { azul: 4, verde: 3, rojo: 2, dorado: 1 };

const NOMBRE_COLOR: Record<Color | ColorSenuelo, string> = {
  azul: "Azul",
  verde: "Verde",
  rojo: "Rojo",
  dorado: "Dorado",
  morado: "Morado",
  plateado: "Plateado",
};

const HEX_COLOR: Record<Color | ColorSenuelo, string> = {
  azul: "#2563eb",
  verde: "#16a34a",
  rojo: "#dc2626",
  dorado: "#d97706",
  morado: "#7c3aed",
  plateado: "#94a3b8",
};

const TODOS_LOS_COLORES: (Color | ColorSenuelo)[] = [...COLORES_CAPSULA, ...SENUELOS];

const ORDEN_CORRECTO: Color[] = ["azul", "verde", "rojo", "dorado"]; // mayor a menor probabilidad
const ORDEN_INICIAL: Color[] = ["rojo", "dorado", "azul", "verde"];

const ENUNCIADO_1 = "Azul es más probable que dorado.";
const ENUNCIADO_2 = "Rojo es menos probable que verde.";
// Ambos enunciados son verdaderos según los datos de la cápsula (4 > 1 y 2 < 3).
const RESPUESTA_ENUNCIADO_1 = "verdadero";
const RESPUESTA_ENUNCIADO_2 = "verdadero";

type EstadoCampo = "correcto" | "pendiente" | "incorrecto";

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
   COMPONENTE PRINCIPAL
========================================================= */

export default function OraculoEstacion() {
 const mission=useMissionExpansion("mathdata-oraculo-estacion");
  const [avisoActividad, setAvisoActividad] = useState<string | null>(null);
  const navigate = useNavigate();

  const ID_ESTUDIANTE =
    obtenerIdEstudianteActual();

  const inicioActividadRef =
    useRef<number>(Date.now());

  const [guardandoProgreso, setGuardandoProgreso] =
    useState(false);

  const [tiempoResultado, setTiempoResultado] =
    useState(0);

  /* ---- Paso 1: espacio muestral ---- */
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<Set<string>>(new Set());
  const [espacioVerificado, setEspacioVerificado] = useState(false);

  /* ---- Paso 2: posible o imposible ---- */
  const [posibleMorado, setPosibleMorado] = useState<"posible" | "imposible" | null>(null);
  const [numResultados, setNumResultados] = useState("");
  const [paso2Verificado, setPaso2Verificado] = useState(false);

  /* ---- Paso 3: orden de probabilidad (drag & drop) ---- */
  const [orden, setOrden] = useState<Color[]>(ORDEN_INICIAL);
  const [ordenVerificado, setOrdenVerificado] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  /* ---- Paso 4: comparación de eventos ---- */
  const [comp1, setComp1] = useState<"verdadero" | "falso" | null>(null);
  const [comp2, setComp2] = useState<"verdadero" | "falso" | null>(null);
  const [comparacionVerificada, setComparacionVerificada] = useState(false);

  /* ---- Paso 5: predicción antes del canje ---- */
  const [prediccion, setPrediccion] = useState<Color | null>(null);
  const [prediccionVerificada, setPrediccionVerificada] = useState(false);

  const [monedaEstelar, setMonedaEstelar] = useState(1);
  const [resultado, setResultado] = useState<"exito" | "fallo" | null>(null);
  const [mostrarPistaBait, setMostrarPistaBait] = useState(false);
  const [mostrarIntroBait, setMostrarIntroBait] = useState(false);
  const [mostrarBaitExito, setMostrarBaitExito] = useState(false);
  const [mostrarBaitFallo, setMostrarBaitFallo] = useState(false);

  /* ---- Derivados ---- */
  const espacioCorrecto =
    espacioSeleccionado.size === COLORES_CAPSULA.length &&
    COLORES_CAPSULA.every((c) => espacioSeleccionado.has(c)) &&
    SENUELOS.every((c) => !espacioSeleccionado.has(c));

  const espacioOrdenadoTexto = COLORES_CAPSULA.filter((c) => espacioSeleccionado.has(c))
    .map((c) => NOMBRE_COLOR[c].toLowerCase())
    .join(", ");

  const paso2Correcto =
    posibleMorado === "imposible" && numResultados.trim() === String(COLORES_CAPSULA.length);

  const secuenciaActual = orden;
  const ordenEsCorrecto = secuenciaActual.every((c, i) => c === ORDEN_CORRECTO[i]);

  const comparacionCorrecta =
    comp1 === RESPUESTA_ENUNCIADO_1 && comp2 === RESPUESTA_ENUNCIADO_2;

  const prediccionCorrecta = prediccion === "azul";

  const toggleColorEspacio = (color: string) => {
    if (guardandoProgreso) {
      return;
    }

    setEspacioSeleccionado((prev) => {
      const copia = new Set(prev);
      if (copia.has(color)) copia.delete(color);
      else copia.add(color);
      return copia;
    });
    setEspacioVerificado(false);
  };

  const verificarEspacio = () => {
    pilot.recordAll();
    if (!guardandoProgreso) {
      setEspacioVerificado(true);
    }
  };

  const verificarPaso2 = () => {
    pilot.recordAll();
    if (!guardandoProgreso) {
      setPaso2Verificado(true);
    }
  };

  const verificarComparacion = () => {
    pilot.recordAll();
    if (!guardandoProgreso) {
      setComparacionVerificada(true);
    }
  };

  const verificarPrediccion = () => {
    pilot.recordAll();
    if (!guardandoProgreso) {
      setPrediccionVerificada(true);
    }
  };

  /* ---- Drag & drop del paso 3 ---- */
  const manejarDragStart = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    if (guardandoProgreso) {
      e.preventDefault();
      return;
    }

    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const manejarDragOver = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (guardandoProgreso) {
      return;
    }

    setDragOverIndex(index);
  };

  const manejarDrop = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (guardandoProgreso) {
      return;
    }

    const origen = dragIndexRef.current;
    setDragOverIndex(null);
    if (origen === null || origen === index) return;
    setOrden((prev) => {
      const copia = [...prev];
      const [movido] = copia.splice(origen, 1);
      copia.splice(index, 0, movido);
      return copia;
    });
    dragIndexRef.current = null;
    setOrdenVerificado(false);
  };

  const verificarOrden = () => {
    pilot.recordAll();
    if (!guardandoProgreso) {
      setOrdenVerificado(true);
    }
  };

  const justificacionPrediccion = (color: Color | null) => {
    if (!color) return "";
    if (color === "azul") {
      return "Porque hay cuatro cristales azules, más que de cualquier otro color.";
    }
    return `Porque hay ${CONTEO[color]} cristales de color ${NOMBRE_COLOR[
      color
    ].toLowerCase()}, pero azul tiene más (4) y es más probable.`;
  };

  /* ---- Envío final: activar el Oráculo ---- */
  const pilot=useMathDataEvidence("mathdata-oraculo-estacion",mission,()=>({espacio_muestral:Array.from(espacioSeleccionado),posible_cristal_morado:posibleMorado,numero_resultados:numResultados,orden_probabilidad:orden,comparacion_1:comp1,comparacion_2:comp2,prediccion,moneda_estelar_usada:mission.correctOnly?0:1}));
  useEffect(()=>{const attempt=pilot.receipt?.intento_piloto;if(!attempt)return;
    setResultado(attempt.evaluacion.completada?"exito":"fallo");
    setTiempoResultado(attempt.tiempo_segundos);setMonedaEstelar(m=>Math.max(0,m-(mission.correctOnly?0:1)));
  },[pilot.receipt]);

  const handleActivarOraculo = async () => {
    if(pilot.busy)return;
    setGuardandoProgreso(true);
    try {await pilot.finish(Math.max(1,Math.floor((Date.now()-inicioActividadRef.current)/1000)),50);}
    catch(error){setAvisoActividad(error instanceof Error?error.message:"No se pudo guardar; conserva esta pestaña.");}
    finally{setGuardandoProgreso(false);}
  };

  const handleReiniciarActividad = () => {
 mission.reset();
 pilot.resetSession();
    setEspacioSeleccionado(new Set());
    setEspacioVerificado(false);
    setPosibleMorado(null);
    setNumResultados("");
    setPaso2Verificado(false);
    setOrden(ORDEN_INICIAL);
    setOrdenVerificado(false);
    setComp1(null);
    setComp2(null);
    setComparacionVerificada(false);
    setPrediccion(null);
    setPrediccionVerificada(false);
    setMonedaEstelar(1);
    setResultado(null);
    setTiempoResultado(0);
    setGuardandoProgreso(false);

    inicioActividadRef.current =
      Date.now();
  };

  /* ---- Resumen para las pantallas de resultado ---- */
  const aciertos = pilot.evaluation?.aciertos ?? ([
    espacioCorrecto,
    paso2Correcto,
    ordenEsCorrecto,
    comparacionCorrecta,
    prediccionCorrecta,
  ].filter(Boolean).length + mission.correctCount);
  const totalPasos = mission.total;
  const precision = Math.round((aciertos / totalPasos) * 100);
  const puntosGanados = pilot.receipt?.intento_piloto?.xp_obtenido ?? (resultado === "exito" ? 50 : 10);

  // ==========================================
  // VENTANA EMERGENTE: ACTIVIDAD COMPLETADA
  // ==========================================

  
 const missionNativeItems:MissionReviewItem[]=[{id:"espacio",title:"Espacio muestral",answer:String(Array.from(espacioSeleccionado).join(", ")),correct:espacioCorrecto,hint:"Incluye solo los colores presentes en la cápsula; excluye los señuelos.",target:'[data-review-target="native-espacio"]'},{id:"resultados",title:"Resultados posibles",answer:String(`${posibleMorado}, ${numResultados}`),correct:paso2Correcto,hint:"El cristal morado es imposible; cuenta los colores que realmente existen.",target:'[data-review-target="native-resultados"]'},{id:"orden",title:"Orden de probabilidades",answer:String(orden.join(" → ")),correct:ordenEsCorrecto,hint:"Ordena por la cantidad de cristales de cada color.",target:'[data-review-target="native-orden"]'},{id:"comparacion",title:"Comparación de eventos",answer:String(`${comp1}, ${comp2}`),correct:comparacionCorrecta,hint:"Compara la proporción de cristales para decidir cada afirmación.",target:'[data-review-target="native-comparacion"]'},{id:"prediccion",title:"Predicción del cristal",answer:String(prediccion),correct:prediccionCorrecta,hint:"El color más frecuente tiene la mayor probabilidad, sin ser un resultado seguro.",target:'[data-review-target="native-prediccion"]'}];
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
              Identificaste el espacio muestral, comparaste correctamente las
              probabilidades y activaste el Oráculo de la Estación con una
              predicción bien fundamentada.
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
                  <strong>
                    {formatearTiempoOraculo(
                      tiempoResultado,
                    )}
                  </strong>
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
            <button
              className="res-btn res-btn-azul"
              onClick={() =>
                navigate("/actividades-math-data/sala-tres-caminos")
              }
            >
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
          contenido="¡Excelente análisis, agente! Identificaste todos los resultados posibles, comparaste cuáles eran más o menos probables y realizaste una predicción basada en la cápsula. El Oráculo queda restaurado."
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
              Revisa el espacio muestral, el orden de probabilidad y las
              comparaciones antes de volver a activar el Oráculo. Recuerda:
              más cristales de un color significa mayor probabilidad, no
              certeza.
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
                  <strong>
                    {formatearTiempoOraculo(
                      tiempoResultado,
                    )}
                  </strong>
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
          contenido="Buen avance, agente. El Oráculo guardó lo que ya resolviste. Todavía falta completar el registro, pero puedes continuar desde el primer paso pendiente cuando estés listo."
          videoSrc={baitHablandoVideo}
          audioSrc={baitAudioVuelveAIntentarlo}
          botonTexto="Cerrar mensaje"
          onClose={() => setMostrarBaitFallo(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="Observa con atención la cápsula. El espacio muestral incluye todos los resultados diferentes que pueden ocurrir. El color que aparece más veces es el más probable y el que aparece menos veces es el menos probable. Recuerda que una predicción se apoya en los datos, pero nunca garantiza el resultado."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioOraculo}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );

  // ==========================================
  // PANTALLA PRINCIPAL: LA ACTIVIDAD
  // ==========================================

  return (
    <div className="orc-page mn-activity">
      {avisoActividad && <AvisoActividad message={avisoActividad} onClose={() => setAvisoActividad(null)} />}
      {/* ================= SIDEBAR ================= */}
      <aside className="orc-sidebar">
        <img src={logo} alt="MathNova" className="orc-logo-img" />

        <nav className="orc-nav">
          <button className="orc-nav-item" type="button" onClick={() => navigate("/")}>
            <FiGrid /> <span>Dashboard principal</span>
          </button>
          <button
            className="orc-nav-item orc-nav-item-activo"
            type="button"
            onClick={() => navigate("/seleccion-mundos")}
          >
            <GiRingedPlanet /> <span>Selección de mundos</span>
          </button>
          <button className="orc-nav-item" type="button" onClick={() => navigate("/retroalimentacion")}>
            <FiMessageSquare /> <span>Retroalimentación</span>
          </button>
          <button className="orc-nav-item" type="button" onClick={() => navigate("/recompensas")}>
            <GiTrophyCup /> <span>Recompensas</span>
          </button>
          <button className="orc-nav-item" type="button" onClick={() => navigate("/perfil-alumno")}>
            <FiUser /> <span>Perfil del alumno</span>
          </button>
          <button className="orc-nav-item" type="button" onClick={() => navigate("/estadisticas")}>
            <FiBarChart2 /> <span>Estadísticas</span>
          </button>
        </nav>

        

        
      
        <div className="mn-sidebar-mission"><span>Tu misión</span><strong>{activityCurriculum["mathdata-oraculo-estacion"].objective}</strong></div>
</aside>

      {/* ================= CONTENIDO ================= */}
      <main
        className="orc-main"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(5,11,31,0.5), rgba(5,11,31,0.8)), url(${fondoOraculoImg})`,
        }}
      >
        <header className="orc-header">
          
          <button type="button" className="orc-ayuda-btn" aria-label="Ayuda">
            <FiHelpCircle />
          </button>
        </header>
        <CabeceraCurricular curriculum={activityCurriculum["mathdata-oraculo-estacion"]} />
        <EnsayoOtrosMundos activityId="mathdata-oraculo-estacion"/>


        {/* FILA SUPERIOR: TÍTULO + VILLANO */}
        <div className="orc-top-row">
          <div className="orc-titulo-bloque">
            <h1>El Oráculo de la Estación</h1>
            <p>
              Observa la cápsula, identifica el espacio muestral y compara
              qué resultados son más o menos probables antes de activar el
              Oráculo.
            </p>
          </div>

          <img
            src={villanoDivideOraculoImg}
            alt="Interferencia: DIVIDE dice que no pierdas el tiempo contando, que todos los colores tienen la misma oportunidad de salir y que dejes que el azar decida."
            className="orc-villano-card-img"
          />
        </div>

        {/* FILA CÁPSULA: BIT EXPLICA + CÁPSULA + PISTA DE BIT */}
        <div className="orc-capsula-row">
          <div className="orc-capsula-col">
            <div className="orc-explica-fila">
              <img src={baitSaludoImg} alt="Bait explicando" className="orc-bait-avatar-img" />

              <div className="orc-hola-agente">
                <div>
                  <strong>BIT te explica</strong>
                  <p>
                    ¡Agente! No te apresures. La cápsula es transparente y
                    podemos analizarla antes de jugar. Primero identifica
                    todos los colores que pueden salir; después
                    compararemos cuáles son más y menos probables. Así
                    podrás hacer una predicción con datos, aunque el
                    resultado final siga dependiendo del azar.
                  </p>
                </div>
                <button
                  className="orc-audio-btn"
                  type="button"
                  onClick={() => setMostrarIntroBait(true)}
                  aria-label="Escuchar explicación"
                >
                  <FiVolume2 />
                </button>
              </div>
            </div>

            <div className="orc-leyenda-wrap">
              <div className="orc-leyenda-row">
                {COLORES_CAPSULA.map((c) => (
                  <div className="orc-leyenda-pill" key={c} style={{ borderColor: HEX_COLOR[c] }}>
                    <span className="orc-leyenda-punto" style={{ background: HEX_COLOR[c] }} />
                    {NOMBRE_COLOR[c]}
                    <strong>{CONTEO[c]}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="orc-pista-card">
            <div className="orc-pista-header">
              <FiEye />
              <strong>Pista de BIT</strong>
            </div>
            <ul className="orc-pista-lista">
              <li>Escribe una sola vez cada color diferente que aparezca dentro de la cápsula.</li>
              <li>Más cristales de un color no significa mayor posibilidad.</li>
              <li>Más probable no significa seguro.</li>
            </ul>
            <button type="button" className="orc-pista-btn" onClick={() => setMostrarPistaBait(true)}>
              <img src={baitPistaImg} alt="" className="orc-pista-icono" />
              Ver pista
            </button>
          </div>
        </div>

        {/* FILA DE 5 PASOS */}
        <div className="orc-pasos-row">
          {/* PASO 1: ESPACIO MUESTRAL */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">1</span>
              <strong>Espacio muestral</strong>
              {espacioVerificado && (
                espacioCorrecto
                  ? <FiCheckCircle className="orc-check-verde" />
                  : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>
            <p className="orc-paso-texto">Selecciona los colores que pueden salir de la cápsula.</p>

            <div className="orc-chips-wrap">
              {TODOS_LOS_COLORES.map((c) => {
                const activo = espacioSeleccionado.has(c);
                return (
                  <button
                    key={c}
                    type="button"
                    className={`orc-chip ${activo ? "orc-chip-activo" : ""}`}
                    style={activo ? { background: HEX_COLOR[c], borderColor: HEX_COLOR[c] } : undefined}
                    data-review-target="native-espacio" onClick={() => toggleColorEspacio(c)}
                    aria-pressed={activo}
                    disabled={guardandoProgreso}
                  >
                    {NOMBRE_COLOR[c]}
                  </button>
                );
              })}
            </div>

            <div className={`orc-omega-box ${espacioVerificado ? (espacioCorrecto ? "orc-omega-correcto" : "orc-omega-incorrecto") : ""}`}>
              ω = {"{"}
              {espacioOrdenadoTexto || "…"}
              {"}"}
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarEspacio}
              disabled={guardandoProgreso}
            >
              <FiCheck /> Verificar
            </button>
          </div>

          {/* PASO 2: POSIBLE O IMPOSIBLE */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">2</span>
              <strong>Posible o imposible</strong>
              {paso2Verificado && (
                paso2Correcto
                  ? <FiCheckCircle className="orc-check-verde" />
                  : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>

            <p className="orc-paso-texto">¿Puede salir un cristal morado?</p>
            <div className="orc-opciones-radio">
              {(["posible", "imposible"] as const).map((op) => (
                <button
                  key={op}
                  type="button"
                  className={`orc-opcion-radio ${posibleMorado === op ? "orc-opcion-radio-activa" : ""}`}
                  onClick={() => {
                    if (guardandoProgreso) return;
                    setPosibleMorado(op);
                    setPaso2Verificado(false);
                  }}
                  aria-pressed={posibleMorado === op}
                  disabled={guardandoProgreso}
                >
                  <span className="orc-radio-circulo" />
                  {op === "posible" ? "Posible" : "Imposible"}
                  {paso2Verificado && posibleMorado === op && op === "imposible" && (
                    <FiCheckCircle className="orc-check-verde orc-check-inline" />
                  )}
                </button>
              ))}
            </div>

            <p className="orc-paso-texto">¿Cuántos resultados diferentes hay?</p>
            <div className="orc-input-grupo">
              <input
                type="text"
                inputMode="numeric"
                className={`orc-input ${
                  paso2Verificado
                    ? numResultados.trim() === String(COLORES_CAPSULA.length)
                      ? "orc-input-correcto"
                      : "orc-input-incorrecto"
                    : ""
                }`}
                data-review-target="native-resultados" value={numResultados}
                onChange={(e) => {
                  if (guardandoProgreso) return;
                  setNumResultados(e.target.value);
                  setPaso2Verificado(false);
                }}
                aria-label="Cantidad de resultados diferentes"
                disabled={guardandoProgreso}
              />
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarPaso2}
              disabled={guardandoProgreso}
            >
              <FiCheck /> Verificar
            </button>
          </div>

          {/* PASO 3: ORDEN DE PROBABILIDAD */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">3</span>
              <strong>Orden de probabilidad</strong>
              {ordenVerificado && (
                ordenEsCorrecto
                  ? <FiCheckCircle className="orc-check-verde" />
                  : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>
            <p className="orc-paso-texto">Ordena de mayor a menor probabilidad.</p>

            <div data-review-target="native-orden" className="orc-orden-columna">
              {orden.map((c, index) => (
                <div key={c} className="orc-orden-item-col">
                  <div
                    className={`orc-orden-chip ${dragOverIndex === index ? "orc-orden-chip-sobre" : ""} ${
                      ordenVerificado
                        ? c === ORDEN_CORRECTO[index]
                          ? "orc-orden-chip-correcto"
                          : "orc-orden-chip-incorrecto"
                        : ""
                    }`}
                    draggable={!guardandoProgreso}
                    onDragStart={manejarDragStart(index)}
                    onDragOver={manejarDragOver(index)}
                    onDrop={manejarDrop(index)}
                    onDragLeave={() => setDragOverIndex(null)}
                    style={{ borderColor: HEX_COLOR[c] }}
                  >
                    <FiMove className="orc-orden-drag-icono" />
                    <span className="orc-orden-punto" style={{ background: HEX_COLOR[c] }} />
                    {NOMBRE_COLOR[c]}
                    <small>({CONTEO[c]})</small>
                  </div>
                  {index < orden.length - 1 && <span className="orc-orden-flecha-abajo">↓</span>}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarOrden}
              disabled={guardandoProgreso}
            >
              <FiCheck /> Verificar orden
            </button>
          </div>

          {/* PASO 4: COMPARACIÓN DE EVENTOS */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">4</span>
              <strong>Comparación de eventos</strong>
              {comparacionVerificada && (
                comparacionCorrecta
                  ? <FiCheckCircle className="orc-check-verde" />
                  : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>

            <div data-review-target="native-comparacion" className="orc-comparacion-bloque">
              <p className="orc-paso-texto">{ENUNCIADO_1}</p>
              <div className="orc-opciones-radio orc-opciones-radio-fila">
                {(["verdadero", "falso"] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    className={`orc-opcion-radio ${comp1 === op ? "orc-opcion-radio-activa" : ""}`}
                    onClick={() => {
                      if (guardandoProgreso) return;
                      setComp1(op);
                      setComparacionVerificada(false);
                    }}
                    aria-pressed={comp1 === op}
                    disabled={guardandoProgreso}
                  >
                    <span className="orc-radio-circulo" />
                    {op === "verdadero" ? "Verdadero" : "Falso"}
                  </button>
                ))}
                {comparacionVerificada && comp1 === RESPUESTA_ENUNCIADO_1 && (
                  <FiCheckCircle className="orc-check-verde" />
                )}
              </div>
            </div>

            <div data-review-target="native-comparacion" className="orc-comparacion-bloque">
              <p className="orc-paso-texto">{ENUNCIADO_2}</p>
              <div className="orc-opciones-radio orc-opciones-radio-fila">
                {(["verdadero", "falso"] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    className={`orc-opcion-radio ${comp2 === op ? "orc-opcion-radio-activa" : ""}`}
                    onClick={() => {
                      if (guardandoProgreso) return;
                      setComp2(op);
                      setComparacionVerificada(false);
                    }}
                    aria-pressed={comp2 === op}
                    disabled={guardandoProgreso}
                  >
                    <span className="orc-radio-circulo" />
                    {op === "verdadero" ? "Verdadero" : "Falso"}
                  </button>
                ))}
                {comparacionVerificada && comp2 === RESPUESTA_ENUNCIADO_2 && (
                  <FiCheckCircle className="orc-check-verde" />
                )}
              </div>
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarComparacion}
              disabled={guardandoProgreso}
            >
              <FiCheck /> Verificar
            </button>
          </div>

          {/* PASO 5: PREDICCIÓN ANTES DEL CANJE */}
          <div className="orc-paso-card">
            <div className="orc-paso-header">
              <span className="orc-paso-num">5</span>
              <strong>Predicción antes del canje</strong>
              {prediccionVerificada && (
                prediccionCorrecta
                  ? <FiCheckCircle className="orc-check-verde" />
                  : <FiCheckCircle className="orc-check-alerta" />
              )}
            </div>
            <p className="orc-paso-texto">¿Qué color tiene mayor probabilidad de salir? Justifica tu elección con los datos de la cápsula.</p>

            <div className="orc-opciones-radio orc-opciones-radio-grid">
              {COLORES_CAPSULA.map((c) => (
                <button
                  key={c}
                  type="button"
                  data-review-target="native-prediccion" className={`orc-opcion-radio ${prediccion === c ? "orc-opcion-radio-activa" : ""}`}
                  onClick={() => {
                    if (guardandoProgreso) return;
                    setPrediccion(c);
                    setPrediccionVerificada(false);
                  }}
                  aria-pressed={prediccion === c}
                  disabled={guardandoProgreso}
                >
                  <span className="orc-radio-circulo" />
                  {NOMBRE_COLOR[c]}
                  {prediccionVerificada && c === "azul" && prediccion === c && (
                    <FiCheckCircle className="orc-check-verde orc-check-inline" />
                  )}
                </button>
              ))}
            </div>

            <div className="orc-justificacion-box">
              <strong>Justificación</strong>
              <p>{justificacionPrediccion(prediccion) || "Selecciona un color para ver la justificación."}</p>
              {prediccionVerificada && prediccionCorrecta && (
                <FiCheckCircle className="orc-check-verde" />
              )}
            </div>

            <button
              type="button"
              className="orc-verificar-btn"
              onClick={verificarPrediccion}
              disabled={guardandoProgreso}
            >
              <FiCheck /> Verificar
            </button>
          </div>
        </div>

        {/* FILA INFERIOR: MONEDA + INFO + ACTIVAR ORÁCULO */}
        <div className="orc-bottom-row">
          <div className="orc-moneda-card">
            <FiStar className="orc-moneda-icono" />
            <div>
              <strong>Moneda estelar</strong>
              <span>x{monedaEstelar}</span>
            </div>
          </div>

          <div className="orc-info-box">
            <FiInfo /> Revisa tus análisis. Cuando estés listo, usa tu moneda para activar el Oráculo.
          </div>

          <p className="mn-finish-direction">Cuando completes los retos, usa «Terminar misión» al final de la actividad.</p>
        </div>
      <PilotEvidenceStatus pilot={pilot}/>
<RetosDeMision expansion={mission}/><CierreDeMision onFinish={()=>void handleActivarOraculo()} busy={pilot.busy}/></main>

      {mostrarIntroBait && (
        <PistaBaitModal
          titulo="BIT te explica"
          contenido="¡Agente! No te apresures. La cápsula es transparente y podemos analizarla antes de jugar. Primero identifica todos los colores que pueden salir; después compararemos cuáles son más y menos probables. Así podrás hacer una predicción con datos, aunque el resultado final siga dependiendo del azar."
          videoSrc={baitHablandoVideo}
          audioSrc={introBaitAudioOraculo}
          botonTexto="¡Comenzar misión! 🚀"
          onClose={() => setMostrarIntroBait(false)}
        />
      )}

      {mostrarPistaBait && (
        <PistaBaitModal
          titulo="Pista de Bait"
          contenido="Observa con atención la cápsula. El espacio muestral incluye todos los resultados diferentes que pueden ocurrir. El color que aparece más veces es el más probable y el que aparece menos veces es el menos probable. Recuerda que una predicción se apoya en los datos, pero nunca garantiza el resultado."
          videoSrc={baitHablandoVideo}
          audioSrc={pistaBaitAudioOraculo}
          onClose={() => setMostrarPistaBait(false)}
        />
      )}
    </div>
  );
}