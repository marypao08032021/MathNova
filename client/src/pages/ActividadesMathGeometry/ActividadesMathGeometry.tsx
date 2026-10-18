import AulaNotice from "../../components/AulaNotice";
import useAulaAccess from "../../hooks/useAulaAccess";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ActividadesMathGeometry.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/mathGeometry/actividades/hero-banner-mathGeometri.png";
import profesor from "../../assets/mathGeometry/actividades/profesor-explicando.png";

import actividad1 from "../../assets/mathGeometry/actividades/actividad-1-mathgeometry.png";
import actividad2 from "../../assets/mathGeometry/actividades/actividad-2-mathgeometry.png";
import actividad3 from "../../assets/mathGeometry/actividades/actividad-3-mathgeometry.png";
import actividad4 from "../../assets/mathGeometry/actividades/actividad-4-mathgeometry.png";
import actividad5 from "../../assets/mathGeometry/actividades/actividad-5-mathgeometry.png";
import actividad6 from "../../assets/mathGeometry/actividades/actividad-6-mathgeometry.png";
import actividad7 from "../../assets/mathGeometry/actividades/actividad-7-mathgeometry.png";
import actividad8 from "../../assets/mathGeometry/actividades/actividad-8-mathgeometry.png";

import {
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiClock,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiCircle,
  FiPlayCircle,
  FiStar,
  FiTarget,
  FiBookOpen,
  FiLock,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import {
  obtenerIdUsuarioAutenticado,
  obtenerProgresoAlumno,
} from "../../services/progresoService";
import { isGuestSession } from "../../utils/authSession";

type EstadoActividadGeometry =
  | "Pendiente"
  | "En curso"
  | "Completada";

type ProgresoGeometry = {
  actividad_codigo?: string;
  completada?: boolean;
  estrellas_obtenidas?: number | string;
  precision?: number | string;
  intentos?: number | string;
};

type RespuestaProgresoGeometry = {
  progreso?: ProgresoGeometry[];
};

const numeroSeguro = (
  valor: number | string | null | undefined,
): number => {
  const numero = Number(valor ?? 0);
  return Number.isFinite(numero) ? numero : 0;
};

const extraerProgresos = (
  respuesta: unknown,
): ProgresoGeometry[] => {
  if (Array.isArray(respuesta)) {
    return respuesta as ProgresoGeometry[];
  }

  if (
    typeof respuesta === "object" &&
    respuesta !== null &&
    Array.isArray(
      (respuesta as RespuestaProgresoGeometry).progreso,
    )
  ) {
    return (
      respuesta as RespuestaProgresoGeometry
    ).progreso!;
  }

  return [];
};

function ActividadesMathGeometry() {
  const aula=useAulaAccess();

  const [menuOpen, setMenuOpen] = useState(false);
  const [progresos, setProgresos] = useState<ProgresoGeometry[]>([]);
  const [cargandoProgreso, setCargandoProgreso] = useState(true);
  const [errorProgreso, setErrorProgreso] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    let componenteActivo = true;

    const cargarProgresoGeometry = async () => {
      if (isGuestSession()) {
        if (componenteActivo) {
          setProgresos([]);
          setErrorProgreso("");
          setCargandoProgreso(false);
        }

        return;
      }

      const idUsuario = obtenerIdUsuarioAutenticado();

      if (!idUsuario) {
        if (componenteActivo) {
          setProgresos([]);
          setErrorProgreso(
            "No se encontró el usuario autenticado.",
          );
          setCargandoProgreso(false);
        }

        return;
      }

      try {
        setCargandoProgreso(true);
        setErrorProgreso("");

        const respuesta = await obtenerProgresoAlumno(
          idUsuario,
        );

        if (!componenteActivo) return;

        setProgresos(extraerProgresos(respuesta));
      } catch (error) {
        if (!componenteActivo) return;

        const mensaje =
          error instanceof Error
            ? error.message
            : "No se pudo cargar el progreso.";

        console.error(
          "Error al cargar actividades de MathGeometry:",
          error,
        );

        setProgresos([]);
        setErrorProgreso(mensaje);
      } finally {
        if (componenteActivo) {
          setCargandoProgreso(false);
        }
      }
    };

    void cargarProgresoGeometry();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const actividadesTema1 = [
    {
      img: actividad1,
      numero: "01",
      titulo: "El Constructor de Caminos",
      texto:
        "Une puntos para formar figuras como triángulos, cuadrados y rectángulos.",
      nivel: "Fácil",
      tiempo: "10 min",
      codigo: "mathgeometry-actividad-1",
      ruta: "/actividades/geometria/actividad-1",
    },
    {
      img: actividad2,
      numero: "02",
      titulo: "La Ruta Perdida",
      texto: "Completa los caminos conectando los puntos correctos.",
      nivel: "Fácil",
      tiempo: "10 min",
      codigo: "mathgeometry-actividad-2",
      ruta: "/actividades/geometria/actividad-2",
    },
    {
      img: actividad3,
      numero: "03",
      titulo: "Detectores de Giro",
      texto: "Identifica si los ángulos son agudos, rectos u obtusos.",
      nivel: "Fácil",
      tiempo: "10 min",
      codigo: "mathgeometry-actividad-3",
      ruta: "/actividades/geometria/actividad-3",
    },
    {
      img: actividad4,
      numero: "04",
      titulo: "Cruce de Láser",
      texto: "Señala los láser según las instrucciones dadas.",
      nivel: "Medio",
      tiempo: "12 min",
      codigo: "mathgeometry-actividad-4",
      ruta: "/actividades/geometria/actividad-4",
    },
  ];

  const actividadesTema2 = [
    {
      img: actividad5,
      numero: "05",
      titulo: "El Taller del Ingeniero",
      texto: "Encuentra el punto medio en segmentos de recta.",
      nivel: "Fácil",
      tiempo: "10 min",
      codigo: "mathgeometry-actividad-5",
      ruta: "/actividades/geometria/actividad-5",
    },
    {
      img: actividad6,
      numero: "06",
      titulo: "El Escudo Perfecto",
      texto:
        "Selecciona la línea que divide mejor el ángulo en dos partes iguales.",
      nivel: "Medio",
      tiempo: "12 min",
      codigo: "mathgeometry-actividad-6",
      ruta: "/actividades/geometria/actividad-6",
    },
    {
      img: actividad7,
      numero: "07",
      titulo: "La Fortaleza Triangular",
      texto: "Identifica rectas importantes dentro de triángulos.",
      nivel: "Medio",
      tiempo: "12 min",
      codigo: "mathgeometry-actividad-7",
      ruta: "/actividades/geometria/actividad-7",
    },
    {
      img: actividad8,
      numero: "08",
      titulo: "El Centro de Control",
      texto: "Reconoce las diagonales en cuadriláteros.",
      nivel: "Fácil",
      tiempo: "10 min",
      codigo: "mathgeometry-actividad-8",
      ruta: "/actividades/geometria/actividad-8",
    },
  ];

  const progresoPorCodigo = new Map(
    progresos
      .filter((registro) => registro.actividad_codigo)
      .map((registro) => [
        String(registro.actividad_codigo),
        registro,
      ]),
  );

  const agregarEstado = <
    T extends {
      codigo: string;
    },
  >(
    actividad: T,
  ): T & {
    estado: EstadoActividadGeometry;
    estrellas: number;
    precision: number;
  } => {
    const registro = progresoPorCodigo.get(
      actividad.codigo,
    );

    const estado: EstadoActividadGeometry =
      registro?.completada === true
        ? "Completada"
        : registro
          ? "En curso"
          : "Pendiente";

    return {
      ...actividad,
      estado,
      estrellas: numeroSeguro(
        registro?.estrellas_obtenidas,
      ),
      precision: numeroSeguro(registro?.precision),
    };
  };

  const actividadesTema1ConEstado =
    actividadesTema1.map(agregarEstado);

  const actividadesTema2ConEstado =
    actividadesTema2.map(agregarEstado);

  const todasLasActividades = [
    ...actividadesTema1ConEstado,
    ...actividadesTema2ConEstado,
  ];

  const estaDesbloqueada = (codigoActividad:string):boolean => aula.allowed(codigoActividad);

  const totalCompletadas = todasLasActividades.filter(
    (actividad) =>
      actividad.estado === "Completada",
  ).length;

  const totalEnCurso = todasLasActividades.filter(
    (actividad) => actividad.estado === "En curso",
  ).length;

  const totalPendientes =
    todasLasActividades.length -
    totalCompletadas -
    totalEnCurso;

  const totalEstrellasGeometry =
    todasLasActividades.reduce(
      (total, actividad) =>
        total + actividad.estrellas,
      0,
    );

  return (
    <main className="geomx-page">
      <button
        className={`geomx-hamburger-btn ${
          menuOpen ? "geomx-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="geomx-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`geomx-sidebar ${menuOpen ? "geomx-sidebar-open" : ""}`}
      >
        <img src={logo} alt="MathNova" className="geomx-sidebar-logo" />

        <nav className="geomx-sidebar-menu">
          <button className="geomx-menu-item" onClick={() => irARuta("/")}>
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            className="geomx-menu-item geomx-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            className="geomx-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            className="geomx-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            className="geomx-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            className="geomx-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="geomx-sidebar-mascot">
          <img src={profesor} alt="Profesor MathGeometry" />
        </div>
      </aside>

      <section className="geomx-content">
        <img src={heroBanner} alt="Banner Geometry" className="geomx-bg" />

        <section className="geomx-main">
          <AulaNotice aula={aula} mundo="mathgeometry"/>
          <div className="geomx-breadcrumb">
            <button type="button" onClick={() => irARuta("/seleccion-mundos")}>
              Mundos
            </button>

            <span>›</span>

            <button
              type="button"
              onClick={() => irARuta("/actividades/geometria")}
            >
              Actividades MathGeometry
            </button>
          </div>

          <div className="geomx-header">
            <div className="geomx-title-box">
              <h1>Actividades</h1>

              <p>
                Practica geometría con retos sencillos, visuales e interactivos.
              </p>

              <div className="geomx-status-tabs">
                <button>
                  <FiCircle />
                  Pendientes ({cargandoProgreso ? "…" : totalPendientes})
                </button>

                <button>
                  <FiCircle />
                  En curso ({cargandoProgreso ? "…" : totalEnCurso})
                </button>

                <button>
                  <FiCheckCircle />
                  Completadas ({cargandoProgreso ? "…" : totalCompletadas})
                </button>
              </div>
            </div>

            <div className="geomx-search-area">
              <div className="geomx-search-box">
                <FiSearch />
                <input placeholder="Buscar actividades o temas..." />
              </div>

              <button className="geomx-filter-btn">
                <FiFilter />
                Filtros
              </button>
            </div>
          </div>

          <div className="geomx-summary-row">
            <article>
              <FiBookOpen />
              <div>
                <strong>{todasLasActividades.length}</strong>
                <span>Actividades</span>
              </div>
            </article>

            <article>
              <FiTarget />
              <div>
                <strong>
                  {cargandoProgreso ? "…" : `${totalCompletadas}/8`}
                </strong>
                <span>Completadas</span>
              </div>
            </article>

            <article>
              <FiStar />
              <div>
                <strong>
                  {cargandoProgreso ? "…" : totalEstrellasGeometry}
                </strong>
                <span>Estrellas Geometry</span>
              </div>
            </article>
          </div>

          {errorProgreso && (
            <p className="geomx-progress-error">
              No se pudo actualizar el estado de las actividades.
            </p>
          )}

          <section className="geomx-activities-panel">
            <div className="geomx-topic-block geomx-topic-block-first">
              <div className="geomx-section-heading">
                <span>Tema 1</span>

                <div>
                  <h2>Rectas y Ángulos</h2>
                  <p>
                    Inicia con actividades cortas para reconocer puntos,
                    segmentos, caminos y tipos de ángulos de forma visual.
                  </p>
                </div>
              </div>

              <div className="geomx-activities-zone">
                <div className="geomx-activities-grid">
                  {actividadesTema1ConEstado.map((item, index) => {
    const desbloqueada = estaDesbloqueada(item.codigo);

    return (
      <article
        className={`geomx-activity-card geomx-card-${index + 1} ${
          !desbloqueada ? "geomx-card-locked" : ""
        }`}
        key={item.titulo}
        role="button"
        tabIndex={desbloqueada ? 0 : -1}
        onClick={() => {
          if (desbloqueada) irARuta(item.ruta);
        }}
        onKeyDown={(event) => {
          if (
            desbloqueada &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            irARuta(item.ruta);
          }
        }}
      >
        <div className="geomx-activity-image">
          <img src={item.img} alt={item.titulo} />
          <span className="geomx-card-number">{item.numero}</span>

          {!desbloqueada && (
            <div className="geomx-lock-overlay">
              <FiLock className="geomx-lock-icon" />
              <span>Bloqueada</span>
            </div>
          )}
        </div>

        <div className="geomx-activity-info">
          <div className="geomx-card-tags">
            <span className="geomx-easy">{item.nivel}</span>
            <span
              className={`geomx-state geomx-state-${item.estado
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {item.estado}
              {item.estrellas > 0 ? ` · ${item.estrellas} ★` : ""}
            </span>
          </div>

          <h3>{item.titulo}</h3>
          <p>{item.texto}</p>

          <div className="geomx-activity-bottom">
            <small>
              <FiClock />
              {item.tiempo}
            </small>

            <button
              type="button"
              disabled={!desbloqueada}
              onClick={(event) => {
                event.stopPropagation();
                if (desbloqueada) irARuta(item.ruta);
              }}
            >
              {!desbloqueada ? (
                <>
                  <FiLock /> Bloqueada
                </>
              ) : item.estado === "Completada" ? (
                <>
                  <FiCheckCircle /> Repetir
                </>
              ) : item.estado === "En curso" ? (
                <>
                  <FiPlayCircle /> Continuar
                </>
              ) : (
                <>
                  <FiPlayCircle /> Iniciar
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  })}
                </div>
              </div>
            </div>

            <div className="geomx-topic-divider" aria-hidden="true" />

            <div className="geomx-topic-block geomx-topic-block-second">
              <div className="geomx-section-heading">
                <span>Tema 2</span>

                <div>
                  <h2>
                    Construcción y propiedades de las figuras planas y cuerpos
                  </h2>
                  <p>
                    Continúa con retos visuales para reconocer puntos medios,
                    divisiones de ángulos, rectas en triángulos y diagonales.
                  </p>
                </div>
              </div>

              <div className="geomx-activities-zone">
                <div className="geomx-activities-grid geomx-topic-two-grid">
                 {actividadesTema2ConEstado.map((item, index) => {
    const desbloqueada = estaDesbloqueada(item.codigo);

    return (
      <article
        className={`geomx-activity-card geomx-card-${index + 5} ${
          !desbloqueada ? "geomx-card-locked" : ""
        }`}
        key={item.titulo}
        role="button"
        tabIndex={desbloqueada ? 0 : -1}
        onClick={() => {
          if (desbloqueada) irARuta(item.ruta);
        }}
        onKeyDown={(event) => {
          if (
            desbloqueada &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            irARuta(item.ruta);
          }
        }}
      >
        <div className="geomx-activity-image">
          <img src={item.img} alt={item.titulo} />
          <span className="geomx-card-number">{item.numero}</span>

          {!desbloqueada && (
            <div className="geomx-lock-overlay">
              <FiLock className="geomx-lock-icon" />
              <span>Bloqueada</span>
            </div>
          )}
        </div>

        <div className="geomx-activity-info">
          <div className="geomx-card-tags">
            <span className="geomx-easy">{item.nivel}</span>
            <span
              className={`geomx-state geomx-state-${item.estado
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {item.estado}
              {item.estrellas > 0 ? ` · ${item.estrellas} ★` : ""}
            </span>
          </div>

          <h3>{item.titulo}</h3>
          <p>{item.texto}</p>

          <div className="geomx-activity-bottom">
            <small>
              <FiClock />
              {item.tiempo}
            </small>

            <button
              type="button"
              disabled={!desbloqueada}
              onClick={(event) => {
                event.stopPropagation();
                if (desbloqueada) irARuta(item.ruta);
              }}
            >
              {!desbloqueada ? (
                <>
                  <FiLock /> Bloqueada
                </>
              ) : item.estado === "Completada" ? (
                <>
                  <FiCheckCircle /> Repetir
                </>
              ) : item.estado === "En curso" ? (
                <>
                  <FiPlayCircle /> Continuar
                </>
              ) : (
                <>
                  <FiPlayCircle /> Iniciar
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  })}
                </div>
              </div>
            </div>
          </section>
        </section>

        <footer className="geomx-footer">
          <div className="geomx-footer-icons">
            <button onClick={() => navigate("/login")}>
              <FiLogOut className="geomx-logout-icon" />
            </button>

            <FiHelpCircle className="geomx-help-icon" />
            <FiSettings className="geomx-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActividadesMathGeometry;