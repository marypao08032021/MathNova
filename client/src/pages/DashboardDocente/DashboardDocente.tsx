import {startTesterSession} from "../../utils/testerSession";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../utils/authSession";
import "./DashboardDocente.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroDocente from "../../assets/docente/dashboard/hero-banner-docentes.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";

import algebraDocente from "../../assets/docente/dashboard/algebra-docente.png";
import geometriaDocente from "../../assets/docente/dashboard/geometria-docente.png";
import estadisticaDocente from "../../assets/docente/dashboard/estadistica-docente.png";

import puntosEstrellas from "../../assets/docente/dashboard/puntos-estrellas-docente.png";

import {
  FiGrid,
  FiUsers,
  FiUserPlus,
  FiEdit,
  FiBarChart2,
  FiTrendingUp,
  FiClipboard,
  FiBell,
  FiChevronDown,
  FiPlus,
  FiUser,
  FiUserCheck,
  FiAlertTriangle,
  FiAward,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
} from "react-icons/fi";

type ResumenDashboard = {
  grupos_activos: number;
  alumnos_registrados: number;
  alumnos_sin_grupo: number;
  alumnos_rezagados: number;
};

type AlumnoRezagado = {
  id_alumno: number;
  nombre: string;
  grupo: string | null;
  tema: string | null;
  situacion: string;
};

type AlumnoDesempeno = {
  lugar: number;
  id_alumno: number;
  nombre: string;
  grupo: string | null;
  puntos: number;
  estrellas: number;
};

type DashboardDocenteData = {
  resumen: ResumenDashboard;
  alumnos_rezagados: AlumnoRezagado[];
  mejor_desempeno: AlumnoDesempeno[];
  avisos: string[];
};

type DashboardDocenteResponse = {
  ok: boolean;
  mensaje?: string;
} & DashboardDocenteData;

const API_DASHBOARD_DOCENTE = "/api/docente/dashboard";

const dashboardInicial: DashboardDocenteData = {
  resumen: {
    grupos_activos: 0,
    alumnos_registrados: 0,
    alumnos_sin_grupo: 0,
    alumnos_rezagados: 0,
  },
  alumnos_rezagados: [],
  mejor_desempeno: [],
  avisos: [],
};

function obtenerToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("mathnova_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("mathnova_token")
  );
}

async function leerRespuesta<T>(response: Response): Promise<T> {
  const texto = await response.text();

  try {
    return texto ? JSON.parse(texto) : ({} as T);
  } catch {
    throw new Error(
      "El backend no devolvió JSON. Revisa que la ruta /api/docente/dashboard esté registrada.",
    );
  }
}

function clasePuntoAlumno(index: number) {
  const clases = [
    "blue-dot",
    "light-dot",
    "gray-dot",
    "green-dot",
    "yellow-dot",
  ];
  return clases[index % clases.length];
}

function claseSituacion(situacion: string) {
  const texto = situacion.toLowerCase();

  if (texto.includes("bajo")) return "tag red-tag";
  if (texto.includes("sin progreso")) return "tag orange-tag";
  if (texto.includes("sin grupo")) return "tag orange-tag";
  if (texto.includes("sin entregar")) return "tag strong-red-tag";

  return "tag green-tag";
}

function DashboardDocente() {
  const [testerBusy,setTesterBusy]=useState(false);
  const [testerError,setTesterError]=useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });

  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });

  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  const [dashboard, setDashboard] =
    useState<DashboardDocenteData>(dashboardInicial);
  const [cargandoDashboard, setCargandoDashboard] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    localStorage.setItem("docente-grupos-open", String(gruposOpen));
  }, [gruposOpen]);

  useEffect(() => {
    localStorage.setItem("docente-alumnos-open", String(alumnosOpen));
  }, [alumnosOpen]);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setCargandoDashboard(true);
        setErrorDashboard("");

        const token = obtenerToken();

        const response = await fetch(API_DASHBOARD_DOCENTE, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });

        const data = await leerRespuesta<DashboardDocenteResponse>(response);

        if (!response.ok || !data.ok) {
          throw new Error(
            data.mensaje || "No se pudo cargar el dashboard docente.",
          );
        }

        setDashboard({
          resumen: data.resumen,
          alumnos_rezagados: data.alumnos_rezagados || [],
          mejor_desempeno: data.mejor_desempeno || [],
          avisos: data.avisos || [],
        });
      } catch (error) {
        const mensaje =
          error instanceof Error
            ? error.message
            : "No se pudo cargar el dashboard docente.";

        setErrorDashboard(mensaje);
        setDashboard(dashboardInicial);
      } finally {
        setCargandoDashboard(false);
      }
    };

    cargarDashboard();
  }, []);

  const irARuta = (ruta: string, menu: string) => {
    setSelectedMenu(menu);
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <main className="docente-page">
      <button
        className={`docente-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
        aria-label="Abrir menú"
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="docente-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`docente-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="docente-sidebar-scroll">
          <img src={logo} alt="MathNova" className="docente-sidebar-logo" />

          <nav className="docente-sidebar-menu">
            <button
              className={`docente-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente", "dashboard")}
              type="button"
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="docente-menu-group">
              <button
                className="docente-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
                type="button"
              >
                <FiUsers />
                <span>Mis grupos</span>
                <FiChevronDown
                  className={`chevron ${gruposOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`docente-submenu ${gruposOpen ? "open" : ""}`}>
                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/mis-grupos-docente", "ver-grupos")}
                  type="button"
                >
                  <span></span>
                  Ver grupos
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente", "crear-grupo")}
                  type="button"
                >
                  <span></span>
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="docente-menu-divider"></div>

            <div className="docente-menu-group">
              <button
                className="docente-menu-item group-title"
                onClick={() => setAlumnosOpen(!alumnosOpen)}
                type="button"
              >
                <FiUsers />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`docente-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta(
                      "/administrar-alumnos-docente",
                      "administrar-alumnos",
                    )
                  }
                  type="button"
                >
                  <span></span>
                  Administrar alumnos
                </button>

                <button
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente", "lista")}
                  type="button"
                >
                  <span></span>
                  Lista
                </button>

                <button
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta("/calificaciones-docente", "calificaciones")
                  }
                  type="button"
                >
                  <span></span>
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="docente-menu-divider"></div>

            <button
              className={`docente-menu-item ${
                selectedMenu === "gestion-docentes" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/gestion-docentes", "gestion-docentes")}
              type="button"
            >
              <FiUserCheck />
              <span>Gestión de docentes</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "actividades" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/actividades-docente", "actividades")}
              type="button"
            >
              <FiEdit />
              <span>Control de actividades</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "avance-actividad" ? "active-soft" : ""
              }`}
              onClick={() =>
                irARuta("/avance-actividad-docente", "avance-actividad")
              }
              type="button"
            >
              <FiTrendingUp />
              <span>Avance de actividad</span>
            </button>

            <button
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active-soft" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente", "estadisticas")}
              type="button"
            >
              <FiBarChart2 />
              <span>Estadísticas</span>
            </button>
          </nav>
        </div>

        <div className="docente-fox-card">
          <img src={holaProfe} alt="Hola profe" />
          <span>¡Hola, profe!</span>
        </div>
      </aside>

      <section className="docente-content">
        <section className="mn-live-entry"><h2>Tu aula en línea</h2><p>Consulta quién tiene MathNova abierto y el avance comunicado desde sus actividades.</p><button type="button" onClick={()=>navigate("/monitor-aula")}>Abrir monitor del aula</button></section>
        <section className="docente-hero">
          <div className="docente-hero-text">
            <h1>Bienvenido al Dashboard Docente</h1>

            <p>
              Gestiona tus grupos y da seguimiento al progreso de tus alumnos.
            </p>

            {testerError&&<p role="alert">{testerError}</p>}
            <div className="docente-hero-actions">
              <button type="button" className="docente-primary-btn" onClick={() => irARuta("/actividades-docente", "actividades")}>Control de actividades · Habilitar o bloquear</button>
              <button type="button" className="docente-secondary-btn" disabled={testerBusy} onClick={()=>{setTesterBusy(true);setTesterError("");startTesterSession().then(()=>navigate("/dashboard",{state:{mostrarIntroduccion:false}})).catch(e=>setTesterError(e.message)).finally(()=>setTesterBusy(false))}}>{testerBusy?"Abriendo prueba…":"Entrar en modo estudiante · Tester"}</button>
              <button
                className="docente-primary-btn"
                onClick={() => irARuta("/crear-grupo-docente", "crear-grupo")}
                type="button"
              >
                <FiPlus />
                Crear grupo
              </button>

              <button
                className="docente-secondary-btn"
                onClick={() => irARuta("/mis-grupos-docente", "ver-grupos")}
                type="button"
              >
                <FiUserPlus />
                Ver mis grupos
              </button>
            </div>
          </div>

          <img
            src={heroDocente}
            alt="Dashboard docente"
            className="docente-hero-img"
          />
        </section>

        <section className="docente-stats-row">
          <article className="docente-stat-card green-card">
            <div>
              <h3>Grupos activos</h3>
              <strong>
                {cargandoDashboard ? "..." : dashboard.resumen.grupos_activos}
              </strong>
            </div>

            <div className="stat-icon-circle">
              <FiUsers />
            </div>
          </article>

          <article className="docente-stat-card yellow-card">
            <div>
              <h3>Alumnos de tus grupos</h3>
              <strong>
                {cargandoDashboard
                  ? "..."
                  : dashboard.resumen.alumnos_registrados}
              </strong>
            </div>

            <div className="stat-icon-circle">
              <FiUser />
            </div>
          </article>

          <article className="docente-stat-card red-card">
            <div>
              <h3>Alumnos sin grupo</h3>
              <strong>
                {cargandoDashboard
                  ? "..."
                  : dashboard.resumen.alumnos_sin_grupo}
              </strong>
            </div>

            <div className="stat-icon-circle">
              <FiClipboard />
            </div>
          </article>
        </section>

        <section className="docente-main-grid">
          <article className="docente-card lag-card">
            <h2>
              <FiAlertTriangle />
              Alumnos rezagados
            </h2>

            <div className="docente-table">
              <div className="table-row table-head">
                <span>Alumno</span>
                <span>Grupo</span>
                <span>Tema</span>
                <span>Situación</span>
              </div>

              {cargandoDashboard ? (
                <div className="table-row dashboard-row-hover">
                  <span>Cargando alumnos...</span>
                  <span className="dashboard-empty">—</span>
                  <span className="dashboard-empty">—</span>
                  <span className="dashboard-empty">—</span>
                </div>
              ) : dashboard.alumnos_rezagados.length === 0 ? (
                <div className="table-row dashboard-row-hover">
                  <span>No hay alumnos rezagados por ahora.</span>
                  <span className="dashboard-empty">—</span>
                  <span className="dashboard-empty">—</span>
                  <span className="dashboard-empty">—</span>
                </div>
              ) : (
                dashboard.alumnos_rezagados.map((alumno, index) => (
                  <div
                    className="table-row dashboard-row-hover"
                    key={alumno.id_alumno}
                  >
                    <span className={`student-name ${clasePuntoAlumno(index)}`}>
                      {alumno.nombre}
                    </span>

                    <span>{alumno.grupo || "Sin grupo"}</span>
                    <span>{alumno.tema || "Sin módulo"}</span>
                    <span className={claseSituacion(alumno.situacion)}>
                      {alumno.situacion}
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="docente-card performance-card">
            <h2>
              <FiAward />
              Mejor desempeño
            </h2>

            <div className="performance-list">
              <div className="performance-row performance-head">
                <span>#</span>
                <span>Alumno</span>
                <span>Grupo</span>
                <span>Puntos</span>
                <span>Estrellas</span>
              </div>

              {cargandoDashboard ? (
                <div className="performance-row dashboard-row-hover">
                  <span className="rank">...</span>
                  <span>Cargando...</span>
                  <span>—</span>
                  <span>—</span>
                  <span>—</span>
                </div>
              ) : dashboard.mejor_desempeno.length === 0 ? (
                <div className="performance-row dashboard-row-hover">
                  <span className="rank">—</span>
                  <span>Sin datos todavía</span>
                  <span>—</span>
                  <span>—</span>
                  <span>—</span>
                </div>
              ) : (
                dashboard.mejor_desempeno.map((alumno, index) => (
                  <div
                    className="performance-row dashboard-row-hover"
                    key={alumno.id_alumno}
                  >
                    <span className={`rank rank-${index + 1}`}>
                      {alumno.lugar}
                    </span>

                    <span>{alumno.nombre}</span>
                    <span>{alumno.grupo || "Sin grupo"}</span>
                    <span>{alumno.puntos}</span>

                    <span className="stars-cell">
                      <img src={puntosEstrellas} alt="Estrella" />
                      <span>{alumno.estrellas}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>

          <aside className="docente-right-column">
            <article className="docente-card resources-card">
              <h2>Recursos recomendados</h2>

              <div className="resources-list">
                <button type="button">
                  <img src={algebraDocente} alt="Álgebra" />
                  <span>Álgebra</span>
                </button>

                <button type="button">
                  <img src={geometriaDocente} alt="Geometría" />
                  <span>Geometría</span>
                </button>

                <button type="button">
                  <img src={estadisticaDocente} alt="Estadística" />
                  <span>Estadística</span>
                </button>
              </div>
            </article>

            <article className="docente-card notices-card">
              <h2>
                <FiBell />
                Avisos
              </h2>

              {cargandoDashboard ? (
                <p>Cargando avisos...</p>
              ) : errorDashboard ? (
                <p>• {errorDashboard}</p>
              ) : dashboard.avisos.length === 0 ? (
                <p>Sin avisos por ahora.</p>
              ) : (
                dashboard.avisos.map((aviso, index) => (
                  <p key={`${aviso}-${index}`}>• {aviso}</p>
                ))
              )}
            </article>
          </aside>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button
              onClick={cerrarSesion}
              type="button"
              aria-label="Cerrar sesión"
            >
              <FiLogOut className="logout-icon" />
            </button>

            <button type="button" aria-label="Ayuda">
              <FiHelpCircle className="help-icon" />
            </button>

            <button type="button" aria-label="Configuración">
              <FiSettings className="settings-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default DashboardDocente;
