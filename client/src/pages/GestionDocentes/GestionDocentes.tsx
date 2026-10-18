import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../utils/authSession";
import "./GestionDocentes.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";
import holaProfe from "../../assets/docente/common/hola-profe-docente.png";
import bannerGestionDocente from "../../assets/docente/gestiondocentes/banner_gestion_docente.png";

import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiEdit,
  FiBarChart2,
  FiTrendingUp,
  FiChevronDown,
  FiLogOut,
  FiHelpCircle,
  FiSettings,
  FiShield,
  FiLock,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiUserPlus,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiKey,
  FiCheck,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";

type MenuKey =
  | "dashboard"
  | "ver-grupos"
  | "crear-grupo"
  | "administrar-alumnos"
  | "lista"
  | "calificaciones"
  | "gestion-docentes"
  | "actividades"
  | "avance-actividad"
  | "estadisticas";

type EstadoDocente = "Activo" | "Inactivo";
type FiltroEstado = "Todos" | EstadoDocente;

type Docente = {
  id: number;
  idUsuario: string;
  nombre: string;
  correo: string;
  usuario: string;
  rol: "Docente";
  estado: EstadoDocente;
  estadoBooleano?: boolean;
  fechaRegistro: string;
  iniciales: string;
  totalGrupos: number;
};

type ResumenDocentes = {
  total: number;
  activos: number;
  inactivos: number;
  grupos_asignados: number;
};

type GestionDocentesResponse = {
  ok: boolean;
  mensaje?: string;
  docentes: Docente[];
  resumen: ResumenDocentes;
};

type MutacionDocenteResponse = {
  ok: boolean;
  mensaje: string;
  docente: Docente;
};

type FormDocente = {
  nombre: string;
  correo: string;
  usuario: string;
  contrasena: string;
  confirmarContrasena: string;
  claveAcceso: string;
  estado: EstadoDocente;
};

type Mensaje = {
  tipo: "success" | "error";
  texto: string;
};

const API_GESTION_DOCENTES =
  "/api/docente/gestion-docentes";

const formularioVacio: FormDocente = {
  nombre: "",
  correo: "",
  usuario: "",
  contrasena: "",
  confirmarContrasena: "",
  claveAcceso: "",
  estado: "Activo",
};

const resumenVacio: ResumenDocentes = {
  total: 0,
  activos: 0,
  inactivos: 0,
  grupos_asignados: 0,
};

function normalizarTexto(valor: string) {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function obtenerToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("mathnova_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("mathnova_token") ||
    ""
  );
}

function generarContrasenaSegura() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const numeros = "23456789";
  const simbolos = "@#$%";
  const base = letras + numeros + simbolos;

  const values = new Uint32Array(12);
  crypto.getRandomValues(values);
  return Array.from(values, value => base[value % base.length]).join("") + "A7!";
}

async function leerRespuesta<T>(response: Response): Promise<T> {
  const tipoContenido = response.headers.get("content-type") || "";

  if (!tipoContenido.includes("application/json")) {
    throw new Error(
      "El backend no devolvió JSON. Revisa que la ruta esté registrada y reinicia el servidor.",
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.mensaje || "No se pudo completar la operación.");
  }

  return data;
}

function GestionDocentes() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [gruposOpen, setGruposOpen] = useState(() => {
    return localStorage.getItem("docente-grupos-open") !== "false";
  });
  const [alumnosOpen, setAlumnosOpen] = useState(() => {
    return localStorage.getItem("docente-alumnos-open") !== "false";
  });
  const [selectedMenu, setSelectedMenu] =
    useState<MenuKey>("gestion-docentes");

  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [resumen, setResumen] = useState<ResumenDocentes>(resumenVacio);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("Todos");
  const [pagina, setPagina] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeLista, setMensajeLista] = useState<Mensaje | null>(null);
  const [mensajeFormulario, setMensajeFormulario] = useState<Mensaje | null>(
    null,
  );

  const [formulario, setFormulario] = useState<FormDocente>(formularioVacio);
  const [docenteEditando, setDocenteEditando] = useState<Docente | null>(null);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const docentesPorPagina = 7;

  useEffect(() => {
    localStorage.setItem("docente-grupos-open", String(gruposOpen));
  }, [gruposOpen]);

  useEffect(() => {
    localStorage.setItem("docente-alumnos-open", String(alumnosOpen));
  }, [alumnosOpen]);

  const cargarDocentes = async () => {
    try {
      setCargando(true);
      setMensajeLista(null);

      const token = obtenerToken();
      const response = await fetch(API_GESTION_DOCENTES, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await leerRespuesta<GestionDocentesResponse>(response);

      setDocentes(data.docentes || []);
      setResumen(data.resumen || resumenVacio);
    } catch (error) {
      setDocentes([]);
      setResumen(resumenVacio);
      setMensajeLista({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los docentes.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDocentes();
  }, []);

  const docentesFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return docentes.filter((docente) => {
      const coincideBusqueda =
        !texto ||
        normalizarTexto(
          `${docente.idUsuario} ${docente.nombre} ${docente.correo} ${docente.usuario}`,
        ).includes(texto);

      const coincideEstado =
        filtroEstado === "Todos" || docente.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [docentes, busqueda, filtroEstado]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(docentesFiltrados.length / docentesPorPagina),
  );

  const docentesVisibles = docentesFiltrados.slice(
    pagina * docentesPorPagina,
    pagina * docentesPorPagina + docentesPorPagina,
  );

  useEffect(() => {
    setPagina(0);
  }, [busqueda, filtroEstado]);

  useEffect(() => {
    if (pagina > totalPaginas - 1) {
      setPagina(totalPaginas - 1);
    }
  }, [pagina, totalPaginas]);

  const irARuta = (ruta: string, menu: MenuKey) => {
    setSelectedMenu(menu);
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();
    navigate("/login");
  };

  const actualizarCampo = (campo: keyof FormDocente, valor: string) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    if (mensajeFormulario?.tipo === "error") {
      setMensajeFormulario(null);
    }
  };

  const limpiarFormulario = () => {
    setFormulario(formularioVacio);
    setDocenteEditando(null);
    setMensajeFormulario(null);
    setMostrarContrasena(false);
    setMostrarConfirmacion(false);
  };

  const usarContrasenaGenerada = () => {
    const password = generarContrasenaSegura();

    setFormulario((actual) => ({
      ...actual,
      contrasena: password,
      confirmarContrasena: password,
    }));
    setMostrarContrasena(true);
    setMostrarConfirmacion(true);
  };

  const abrirFormularioNuevo = () => {
    limpiarFormulario();
    setTimeout(() => {
      document.getElementById("gestion-docentes-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const prepararEdicion = (docente: Docente) => {
    setDocenteEditando(docente);
    setFormulario({
      nombre: docente.nombre,
      correo: docente.correo,
      usuario: docente.usuario,
      contrasena: "",
      confirmarContrasena: "",
      claveAcceso: "",
      estado: docente.estado,
    });
    setMensajeFormulario(null);
    setMostrarContrasena(false);
    setMostrarConfirmacion(false);

    setTimeout(() => {
      document.getElementById("gestion-docentes-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const validarFormulario = () => {
    const nombre = formulario.nombre.trim();
    const correo = formulario.correo.trim().toLowerCase();
    const usuario = formulario.usuario.trim().toLowerCase();
    const password = formulario.contrasena.trim();
    const confirmar = formulario.confirmarContrasena.trim();
    const claveAcceso = formulario.claveAcceso.trim();

    if (!nombre || !correo || !usuario) {
      return "Completa nombre, correo y usuario.";
    }

    if (!correo.includes("@")) {
      return "Ingresa un correo válido.";
    }

    if (!claveAcceso) {
      return "Escribe la clave de acceso para crear o editar docentes.";
    }


    if (password || confirmar) {
      if (password.length < 8) {
        return "La contraseña debe tener mínimo 8 caracteres.";
      }

      if (password !== confirmar) {
        return "Las contraseñas no coinciden.";
      }
    }

    return null;
  };

  const guardarDocente = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensajeFormulario({ tipo: "error", texto: errorValidacion });
      return;
    }

    try {
      setGuardando(true);
      setMensajeFormulario(null);

      const token = obtenerToken();
      const payload = {
        id_usuario: docenteEditando?.id || null,
        nombre: formulario.nombre.trim(),
        correo: formulario.correo.trim().toLowerCase(),
        usuario: formulario.usuario.trim().toLowerCase(),
        contrasena: formulario.contrasena.trim(),
        clave_acceso: formulario.claveAcceso.trim(),
        estado: formulario.estado,
      };

      const response = await fetch(
        docenteEditando
          ? `${API_GESTION_DOCENTES}/${docenteEditando.id}`
          : API_GESTION_DOCENTES,
        {
          method: docenteEditando ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await leerRespuesta<MutacionDocenteResponse>(response);

      setDocentes((actuales) => {
        if (docenteEditando) {
          return actuales.map((docente) =>
            docente.id === data.docente.id ? data.docente : docente,
          );
        }

        return [data.docente, ...actuales];
      });

      await cargarDocentes();
      setMensajeFormulario({ tipo: "success", texto: data.mensaje });

      if (!docenteEditando) {
        setFormulario(formularioVacio);
      } else {
        setDocenteEditando(data.docente);
        setFormulario({
          nombre: data.docente.nombre,
          correo: data.docente.correo,
          usuario: data.docente.usuario,
          contrasena: "",
          confirmarContrasena: "",
          claveAcceso: "",
          estado: data.docente.estado,
        });
      }
    } catch (error) {
      setMensajeFormulario({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el docente.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoDocente = async (docente: Docente) => {
    const nuevoEstado: EstadoDocente =
      docente.estado === "Activo" ? "Inactivo" : "Activo";

    try {
      setMensajeLista(null);
      const token = obtenerToken();
      const response = await fetch(
        `${API_GESTION_DOCENTES}/${docente.id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        },
      );

      const data = await leerRespuesta<MutacionDocenteResponse>(response);

      await cargarDocentes();
      setMensajeLista({ tipo: "success", texto: data.mensaje });

      if (docenteEditando?.id === docente.id) {
        setFormulario((actual) => ({ ...actual, estado: data.docente.estado }));
        setDocenteEditando(data.docente);
      }
    } catch (error) {
      setMensajeLista({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo cambiar el estado.",
      });
    }
  };

  const eliminarDocente = async (docente: Docente) => {
    const confirmar = window.confirm(
      `¿Seguro que quieres desactivar a ${docente.nombre}?\n\nNo se borrará de la base; solo quedará inactivo.`,
    );

    if (!confirmar) return;

    try {
      setMensajeLista(null);
      const token = obtenerToken();
      const response = await fetch(`${API_GESTION_DOCENTES}/${docente.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await leerRespuesta<MutacionDocenteResponse>(response);

      await cargarDocentes();
      setMensajeLista({ tipo: "success", texto: data.mensaje });

      if (docenteEditando?.id === docente.id) {
        limpiarFormulario();
      }
    } catch (error) {
      setMensajeLista({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo desactivar el docente.",
      });
    }
  };

  return (
    <main className="docente-page">
      <button
        type="button"
        className={`docente-hamburger-btn ${menuOpen ? "hamburger-open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
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
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "dashboard" ? "active" : ""
              }`}
              onClick={() => irARuta("/dashboard-docente", "dashboard")}
            >
              <FiGrid />
              <span>Dashboard principal</span>
            </button>

            <div className="docente-menu-group">
              <button
                type="button"
                className="docente-menu-item group-title"
                onClick={() => setGruposOpen(!gruposOpen)}
              >
                <FiUsers />
                <span>Mis grupos</span>
                <FiChevronDown
                  className={`chevron ${gruposOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`docente-submenu ${gruposOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "ver-grupos" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/mis-grupos-docente", "ver-grupos")}
                >
                  <span />
                  Ver grupos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "crear-grupo" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/crear-grupo-docente", "crear-grupo")}
                >
                  <span />
                  Crear grupo
                </button>
              </div>
            </div>

            <div className="docente-menu-divider" />

            <div className="docente-menu-group">
              <button
                type="button"
                className="docente-menu-item group-title"
                onClick={() => setAlumnosOpen(!alumnosOpen)}
              >
                <FiUsers />
                <span>Alumnos</span>
                <FiChevronDown
                  className={`chevron ${alumnosOpen ? "chevron-open" : ""}`}
                />
              </button>

              <div className={`docente-submenu ${alumnosOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "administrar-alumnos" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta(
                      "/administrar-alumnos-docente",
                      "administrar-alumnos",
                    )
                  }
                >
                  <span />
                  Administrar alumnos
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item small-sub ${
                    selectedMenu === "lista" ? "sub-active" : ""
                  }`}
                  onClick={() => irARuta("/lista-alumnos-docente", "lista")}
                >
                  <span />
                  Lista
                </button>

                <button
                  type="button"
                  className={`docente-submenu-item ${
                    selectedMenu === "calificaciones" ? "sub-active" : ""
                  }`}
                  onClick={() =>
                    irARuta("/calificaciones-docente", "calificaciones")
                  }
                >
                  <span />
                  Calificaciones
                </button>
              </div>
            </div>

            <div className="docente-menu-divider" />

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "gestion-docentes" ? "active" : ""
              }`}
              onClick={() => irARuta("/gestion-docentes", "gestion-docentes")}
            >
              <FiUserCheck />
              <span>Gestión de docentes</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "actividades" ? "active" : ""
              }`}
              onClick={() => irARuta("/actividades-docente", "actividades")}
            >
              <FiEdit />
              <span>Actividades</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "avance-actividad" ? "active" : ""
              }`}
              onClick={() =>
                irARuta("/avance-actividad-docente", "avance-actividad")
              }
            >
              <FiTrendingUp />
              <span>Avance de actividad</span>
            </button>

            <button
              type="button"
              className={`docente-menu-item ${
                selectedMenu === "estadisticas" ? "active" : ""
              }`}
              onClick={() => irARuta("/estadisticas-docente", "estadisticas")}
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

      <section className="gestion-docentes-content">
        <section className="gestion-docentes-hero-card">
          <div className="gestion-docentes-hero-text">
            <h1>Gestión de docentes</h1>
            <p>
              Administra las cuentas docentes registradas en MathNova. Crea
              usuarios, actualiza datos y controla si pueden seguir activos.
            </p>
          </div>

          <img
            src={bannerGestionDocente}
            alt="Gestión de docentes"
            className="gestion-docentes-hero-img"
          />
        </section>

        <section className="gestion-stats-row">
          <article className="gestion-stat-card active">
            <div>
              <h3>Total docentes</h3>
              <strong>{resumen.total}</strong>
              <p>Usuarios con rol docente</p>
            </div>
            <span>
              <FiUsers />
            </span>
          </article>

          <article className="gestion-stat-card active">
            <div>
              <h3>Docentes activos</h3>
              <strong>{resumen.activos}</strong>
              <p>
                {resumen.total
                  ? Math.round((resumen.activos / resumen.total) * 100)
                  : 0}
                % del total
              </p>
            </div>
            <span>
              <FiCheck />
            </span>
          </article>

          <article className="gestion-stat-card inactive">
            <div>
              <h3>Docentes inactivos</h3>
              <strong>{resumen.inactivos}</strong>
              <p>
                {resumen.total
                  ? Math.round((resumen.inactivos / resumen.total) * 100)
                  : 0}
                % del total
              </p>
            </div>
            <span>
              <FiX />
            </span>
          </article>

          <article className="gestion-stat-card pending">
            <div>
              <h3>Grupos asignados</h3>
              <strong>{resumen.grupos_asignados}</strong>
              <p>Grupos creados por docentes</p>
            </div>
            <span>
              <FiShield />
            </span>
          </article>
        </section>

        {mensajeLista && (
          <div
            className={`gestion-message ${
              mensajeLista.tipo === "success" ? "success" : "warning"
            }`}
          >
            {mensajeLista.texto}
          </div>
        )}

        <section className="gestion-main-layout">
          <div className="gestion-list-column">
            <article className="gestion-list-card">
              <div className="gestion-form-title">
                <span>
                  <FiUsers />
                </span>
                <div>
                  <h2>Lista de docentes</h2>
                  <p>Datos reales tomados de la tabla de usuarios.</p>
                </div>
              </div>

              <div className="gestion-list-tools">
                <label className="gestion-search-box">
                  <FiSearch />
                  <input
                    type="search"
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder="Buscar por nombre, correo, usuario o ID..."
                  />
                </label>

                <div className="gestion-status-filter">
                  <span>Estado</span>
                  <div>
                    {(["Todos", "Activo", "Inactivo"] as FiltroEstado[]).map(
                      (estado) => (
                        <button
                          key={estado}
                          type="button"
                          className={filtroEstado === estado ? "active" : ""}
                          onClick={() => setFiltroEstado(estado)}
                        >
                          {estado}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="gestion-scroll-form-btn"
                  onClick={abrirFormularioNuevo}
                >
                  <FiPlus />
                  Nuevo docente
                </button>
              </div>

              <div className="gestion-table-wrap">
                <div className="gestion-table gestion-table-head">
                  <span>ID</span>
                  <span>Docente</span>
                  <span>Correo</span>
                  <span>Usuario</span>
                  <span>Grupos</span>
                  <span>Estado</span>
                  <span>Registro</span>
                  <span>Acciones</span>
                </div>

                {cargando ? (
                  <div className="gestion-empty-table">
                    <p>Cargando docentes...</p>
                  </div>
                ) : docentesVisibles.length > 0 ? (
                  docentesVisibles.map((docente) => (
                    <div
                      className="gestion-table gestion-table-row"
                      key={docente.id}
                    >
                      <span>{docente.idUsuario}</span>
                      <span className="gestion-teacher-name">
                        <b>{docente.iniciales}</b>
                        {docente.nombre}
                      </span>
                      <span title={docente.correo}>{docente.correo}</span>
                      <span>{docente.usuario || "â€”"}</span>
                      <span>{docente.totalGrupos || 0}</span>
                      <button
                        type="button"
                        className={`gestion-status-pill ${docente.estado.toLowerCase()}`}
                        onClick={() => cambiarEstadoDocente(docente)}
                        title="Cambiar estado"
                      >
                        <i />
                        {docente.estado}
                      </button>
                      <span>{docente.fechaRegistro}</span>
                      <span className="gestion-actions">
                        <button
                          type="button"
                          className="edit"
                          onClick={() => prepararEdicion(docente)}
                          title="Editar docente"
                        >
                          <FiEdit />
                        </button>
                        <button
                          type="button"
                          className="delete"
                          onClick={() => eliminarDocente(docente)}
                          title="Desactivar docente"
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="gestion-empty-table">
                    <p>No se encontraron docentes con esos filtros.</p>
                  </div>
                )}
              </div>

              <div className="gestion-table-footer">
                <p>
                  Mostrando {docentesVisibles.length} de{" "}
                  {docentesFiltrados.length} docentes
                </p>
                <div>
                  <button
                    type="button"
                    disabled={pagina === 0}
                    onClick={() =>
                      setPagina((actual) => Math.max(0, actual - 1))
                    }
                  >
                    <FiChevronLeft />
                  </button>
                  <span>{pagina + 1}</span>
                  <button
                    type="button"
                    disabled={pagina + 1 >= totalPaginas}
                    onClick={() =>
                      setPagina((actual) =>
                        Math.min(totalPaginas - 1, actual + 1),
                      )
                    }
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </article>

            <article className="gestion-important-card">
              <span>
                <FiInfo />
              </span>
              <div>
                <h2>Cómo funciona</h2>
                <p>
                  Esta sección usa la tabla <strong>registro</strong>. Al crear
                  un docente se guarda con rol docente y contraseña encriptada.
                  Eliminar solo lo desactiva para no romper sus grupos.
                </p>
              </div>
            </article>
          </div>
          <aside className="gestion-form-card" id="gestion-docentes-form">
            <div className="gestion-form-title">
              <span>
                {docenteEditando ? <FiEdit /> : <FiUserPlus />}
              </span>

              <div>
                <h2>{docenteEditando ? "Editar docente" : "Agregar nuevo docente"}</h2>
                <p>
                  {docenteEditando
                    ? `Actualiza los datos de ${docenteEditando.nombre}.`
                    : "Completa los datos para registrar una cuenta."}
                </p>
              </div>
            </div>

            <form onSubmit={guardarDocente}>
              <label className="gestion-form-field">
                <span>Nombre completo</span>
                <input
                  type="text"
                  value={formulario.nombre}
                  onChange={(event) =>
                    actualizarCampo("nombre", event.target.value)
                  }
                  placeholder="Ej. Ana Pérez Gómez"
                />
              </label>

              <label className="gestion-form-field">
                <span>Correo electrónico</span>
                <input
                  type="email"
                  value={formulario.correo}
                  onChange={(event) =>
                    actualizarCampo("correo", event.target.value)
                  }
                  placeholder="Ej. ana.perez@mathnova.com"
                />
              </label>

              <label className="gestion-form-field">
                <span>Nombre de usuario</span>
                <input
                  type="text"
                  value={formulario.usuario}
                  onChange={(event) =>
                    actualizarCampo("usuario", event.target.value)
                  }
                  placeholder="Ej. aperez"
                />
              </label>

              <label className="gestion-form-field">
                <span>
                  {docenteEditando
                    ? "Nueva contraseña (opcional)"
                    : "Contraseña"}
                </span>

                <div className="gestion-password-row">
                  <div className="gestion-password-input">
                    <input
                      type={mostrarContrasena ? "text" : "password"}
                      value={formulario.contrasena}
                      onChange={(event) =>
                        actualizarCampo("contrasena", event.target.value)
                      }
                      placeholder={
                        docenteEditando
                          ? "Solo si quieres cambiarla"
                          : "Mínimo 6 caracteres"
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarContrasena((actual) => !actual)
                      }
                      aria-label="Mostrar u ocultar contraseña"
                    >
                      {mostrarContrasena ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="gestion-generate-btn"
                    onClick={usarContrasenaGenerada}
                  >
                    <FiRefreshCw />
                    Generar
                  </button>
                </div>
              </label>

              <label className="gestion-form-field">
                <span>Confirmar contraseña</span>

                <div className="gestion-password-input">
                  <input
                    type={mostrarConfirmacion ? "text" : "password"}
                    value={formulario.confirmarContrasena}
                    onChange={(event) =>
                      actualizarCampo("confirmarContrasena", event.target.value)
                    }
                    placeholder="Repite la contraseña"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarConfirmacion((actual) => !actual)
                    }
                    aria-label="Mostrar u ocultar confirmación"
                  >
                    {mostrarConfirmacion ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </label>

              <label className="gestion-form-field">
                <span>Rol</span>
                <div className="gestion-locked-field">
                  Docente
                  <FiLock />
                </div>
              </label>

              <div className="gestion-form-field">
                <span>Estado</span>

                <div className="gestion-form-status">
                  <button
                    type="button"
                    className={formulario.estado === "Activo" ? "active" : ""}
                    onClick={() => actualizarCampo("estado", "Activo")}
                  >
                    Activo
                  </button>

                  <button
                    type="button"
                    className={
                      formulario.estado === "Inactivo" ? "inactive" : ""
                    }
                    onClick={() => actualizarCampo("estado", "Inactivo")}
                  >
                    Inactivo
                  </button>
                </div>
              </div>

              <label className="gestion-form-field">
                <span>Clave de acceso</span>
                <input
                  type="password"
                  value={formulario.claveAcceso}
                  onChange={(event) =>
                    actualizarCampo("claveAcceso", event.target.value)
                  }
                  placeholder="Clave para crear o editar docentes"
                />
              </label>

              {mensajeFormulario && (
                <div
                  className={`gestion-form-message ${mensajeFormulario.tipo}`}
                >
                  {mensajeFormulario.texto}
                </div>
              )}

              <button
                type="submit"
                className="gestion-register-btn"
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <FiRefreshCw />
                    Guardando...
                  </>
                ) : docenteEditando ? (
                  <>
                    <FiCheck />
                    Guardar cambios
                  </>
                ) : (
                  <>
                    <FiUserPlus />
                    Registrar docente
                  </>
                )}
              </button>

              <button
                type="button"
                className="gestion-cancel-btn"
                onClick={limpiarFormulario}
              >
                <FiX />
                Cancelar
              </button>
            </form>

            <div className="gestion-form-note">
              <FiInfo />
              <p>
                El id_usuario y la fecha de registro se generan automáticamente.
                Si editas un docente y dejas la contraseña vacía, se conserva la que ya tenía.
              </p>
            </div>
          </aside>
        </section>

        <footer className="docente-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="docente-footer-icons">
            <button
              type="button"
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
            >
              <FiLogOut className="logout-icon" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/ayuda-docente")}
              aria-label="Ayuda"
            >
              <FiHelpCircle className="help-icon" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/configuracion-docente")}
              aria-label="Configuración"
            >
              <FiSettings className="settings-icon" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default GestionDocentes;

