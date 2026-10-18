import AulaNotice from "../../components/AulaNotice";
import useAulaAccess from "../../hooks/useAulaAccess";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ActividadesMathNumbers.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import heroBanner from "../../assets/hero-banner-MathNumbers.png";
import mundoNumbers from "../../assets/mundo-1-MathNumbers.png";
import zorritoHola from "../../assets/zorrito-hola-explorador.png";

import actividad1 from "../../assets/Actividad-1-MathNumbers.png";
import actividad2 from "../../assets/Actividad-2-MathNumbers.png";
import actividad3 from "../../assets/Actividad-3-MathNumbers.png";

/* Nueva imagen guardada directamente dentro de src/assets */
import escuadronTactico from "../../assets/escuadron-tactico.png";
import espejosBoveda from "../../assets/espejo.png";


import puentePrioridades from "../../assets/puente-prioridades.png";
import enigmaVariables from "../../assets/enigma.png";
import simuladorCodigos from "../../assets/simulador.png";
import actividad9 from "../../assets/Actividad-9-MathNumbers.png";
import actividad10 from "../../assets/Actividad-10-MathNumbers.png";

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
  FiLock,
} from "react-icons/fi";

import { GiRingedPlanet, GiTrophyCup } from "react-icons/gi";

import { obtenerProgresoAlumno } from "../../services/progresoService";
import {
  getSessionUser,
  isGuestSession,
} from "../../utils/authSession";

type EstadoActividadNumbers =
  | "Pendiente"
  | "En curso"
  | "Completada";

type FiltroEstadoNumbers =
  | "Todas"
  | EstadoActividadNumbers;

type RegistroProgresoNumbers = {
  actividad_codigo?: string;
  completada?: boolean;
  estrellas_obtenidas?: number | string;
  precision?: number | string;
  intentos?: number | string;
};

type RespuestaProgresoNumbers = {
  progreso?: RegistroProgresoNumbers[];
};

type UsuarioSesionNumbers = {
  id_usuario?: number | string;
  usuario_id?: number | string;
  user_id?: number | string;
  userId?: number | string;
  id?: number | string;
  usuario?: UsuarioSesionNumbers;
  user?: UsuarioSesionNumbers;
  data?: UsuarioSesionNumbers;
};

const numeroSeguroNumbers = (
  valor: number | string | null | undefined,
): number => {
  const numero = Number(valor ?? 0);
  return Number.isFinite(numero) ? numero : 0;
};

const extraerIdUsuarioNumbers = (
  valor: unknown,
): number => {
  if (!valor || typeof valor !== "object") {
    return 0;
  }

  const usuario = valor as UsuarioSesionNumbers;

  const idDirecto = Number(
    usuario.id_usuario ??
      usuario.usuario_id ??
      usuario.user_id ??
      usuario.userId ??
      usuario.id ??
      0,
  );

  if (Number.isInteger(idDirecto) && idDirecto > 0) {
    return idDirecto;
  }

  for (const anidado of [
    usuario.usuario,
    usuario.user,
    usuario.data,
  ]) {
    const idAnidado = extraerIdUsuarioNumbers(anidado);

    if (idAnidado > 0) {
      return idAnidado;
    }
  }

  return 0;
};

const obtenerIdUsuarioNumbers = (): number => {
  const candidatos: unknown[] = [getSessionUser()];

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
      const valorLocal = localStorage.getItem(clave);
      const valorSesion = sessionStorage.getItem(clave);
      const valor = valorLocal || valorSesion;

      if (valor) {
        candidatos.push(JSON.parse(valor));
      }
    } catch (error) {
      console.warn(
        `No se pudo leer la sesión "${clave}":`,
        error,
      );
    }
  }

  for (const candidato of candidatos) {
    const idUsuario = extraerIdUsuarioNumbers(candidato);

    if (idUsuario > 0) {
      return idUsuario;
    }
  }

  return 0;
};

function ActividadesMathNumbers() {
  const aula=useAulaAccess();

  const [menuOpen, setMenuOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstadoNumbers>("Todas");
  const [progresos, setProgresos] =
    useState<RegistroProgresoNumbers[]>([]);
  const [cargandoProgreso, setCargandoProgreso] =
    useState(true);
  const [errorProgreso, setErrorProgreso] =
    useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    let componenteActivo = true;

    const cargarProgresoNumbers = async () => {
      if (isGuestSession()) {
        if (componenteActivo) {
          setProgresos([]);
          setErrorProgreso("");
          setCargandoProgreso(false);
        }

        return;
      }

      const idUsuario = obtenerIdUsuarioNumbers();

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

        const respuesta =
          await obtenerProgresoAlumno(idUsuario);

        if (!componenteActivo) {
          return;
        }

        const registros = Array.isArray(respuesta)
          ? (respuesta as RegistroProgresoNumbers[])
          : Array.isArray(
                (respuesta as RespuestaProgresoNumbers)
                  ?.progreso,
              )
            ? (respuesta as RespuestaProgresoNumbers)
                .progreso ?? []
            : [];

        setProgresos(registros);
      } catch (error) {
        if (!componenteActivo) {
          return;
        }

        console.error(
          "No se pudo cargar el progreso de MathNumbers:",
          error,
        );

        setProgresos([]);
        setErrorProgreso(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el progreso.",
        );
      } finally {
        if (componenteActivo) {
          setCargandoProgreso(false);
        }
      }
    };

    void cargarProgresoNumbers();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

 const iniciarActividad = (slug: string, bloqueada: boolean) => {
    if (bloqueada) {
      alert("Esta actividad debe ser habilitada por tu docente.");
      return;
    }

    if (!slug) {
      alert("Esta actividad todavía no está disponible.");
      return;
    }

    navigate(`/actividades/mathnumbers/${slug}`);
  };

  const normalizarTexto = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const actividades = useMemo(
    () => [
      {
        img: actividad1,
        titulo: "1. El Cofre de Bienvenida",
        texto:
          "Sincroniza energía convirtiendo fracciones a decimales.",
        nivel: "Fácil",
        tiempo: "5 min",
        slug: "cofre-bienvenida",
        codigosProgreso: ["mathnumbers-cofre-bienvenida", "cofre-bienvenida"],
      },
      {
        img: actividad2,
        titulo: "2. El Radar de Supervivencia",
        texto:
          "Ubica números con signo en la recta numérica bajo presión.",
        nivel: "Fácil",
        tiempo: "10 min",
        slug: "radar-supervivencia",
        codigosProgreso: ["radar-supervivencia", "mathnumbers-radar-supervivencia"],
      },
      {
        img: actividad3,
        titulo: "3. El Ascensor del Búnker",
        texto:
          "Programa la ruta ordenando los pisos de menor a mayor.",
        nivel: "Fácil",
        tiempo: "12 min",
        slug: "ascensor-bunker",
        codigosProgreso: ["ascensor-bunker", "mathnumbers-ascensor-bunker"],
      },
      {
        img: escuadronTactico,
        titulo: "4. Escuadrón Táctico",
        texto:
          "Desactiva una trampa láser siguiendo el orden jerárquico.",
        nivel: "Medio",
        tiempo: "15 min",
        slug: "escuadron-tactico",
        codigosProgreso: ["mathnumbers-escuadron-tactico", "escuadron-tactico"],
      },
      {
        img: espejosBoveda,
        titulo: "5. Los Espejos de la Bóveda",
        texto:
          "Identifica propiedades conmutativas y asociativas.",
        nivel: "Fácil",
        tiempo: "8 min",
        slug: "espejos-boveda",
        codigosProgreso: ["espejos-boveda", "mathnumbers-espejos-boveda"],
      },
      {
        img: puentePrioridades,
        titulo: "6. El Puente de Prioridades",
        texto:
          "Activa el puente resolviendo operaciones en el orden correcto.",
        nivel: "Medio",
        tiempo: "12 min",
        slug: "puente-prioridades",
        codigosProgreso: ["puente-prioridades", "mathnumbers-puente-prioridades"],
      },
      {
        img: enigmaVariables,
        titulo: "7. El Enigma de Variables",
        texto:
          "Descubre variables, constantes y valores ocultos en expresiones sencillas.",
        nivel: "Medio",
        tiempo: "12 min",
        slug: "enigma-variables",
        codigosProgreso: ["enigma-variables", "mathnumbers-enigma-variables"],
      },
      {
        img: simuladorCodigos,
        titulo: "8. El Simulador de Códigos Algebraicos",
        texto:
          "Traduce instrucciones cotidianas a expresiones algebraicas.",
        nivel: "Medio",
        tiempo: "12 min",
        slug: "simulador-codigos",
        codigosProgreso: ["simulador-codigos", "mathnumbers-simulador-codigos"],
      },
      {
        img: actividad9,
        titulo: "9. Cajas de Suministros",
        texto:
          "Plantea y resuelve ecuaciones lineales intuitivamente.",
        nivel: "Medio",
        tiempo: "11 min",
        slug: "",
      },
      {
        img: actividad10,
        titulo: "10. Ofertas del Mercader",
        texto:
          "Calcula porcentajes de descuento en compras virtuales.",
        nivel: "Fácil",
        tiempo: "8 min",
        slug: "",
      },
    ],
    []
  );

  const progresoPorCodigo = useMemo(() => {
    const mapa = new Map<
      string,
      RegistroProgresoNumbers
    >();

    progresos.forEach((registro) => {
      const codigo = String(
        registro.actividad_codigo ?? "",
      ).trim();

      if (codigo) {
        mapa.set(codigo, registro);
      }
    });

    return mapa;
  }, [progresos]);

 const actividadesConEstado = useMemo(
    () =>
      actividades.map((item) => {
        const registro = item.codigosProgreso
          ?.map((codigo) => progresoPorCodigo.get(codigo))
          .find(Boolean);

        const estado: EstadoActividadNumbers =
          registro?.completada === true
            ? "Completada"
            : registro
              ? "En curso"
              : "Pendiente";

        const bloqueada = !aula.allowed("mathnumbers-"+item.slug);

        return {
          ...item,
          estado,
          bloqueada,
          estrellas: numeroSeguroNumbers(
            registro?.estrellas_obtenidas,
          ),
          precision: numeroSeguroNumbers(
            registro?.precision,
          ),
        };
      }),
    [actividades, progresoPorCodigo, aula.actividades],
  );

  /*
   * Solo se muestran las actividades que ya tienen una ruta.
   */
  const actividadesVisibles = useMemo(
    () =>
      actividadesConEstado.filter(
        (item) => item.slug,
      ),
    [actividadesConEstado],
  );

  const totalPendientes = actividadesVisibles.filter(
    (item) => item.estado === "Pendiente",
  ).length;

  const totalEnCurso = actividadesVisibles.filter(
    (item) => item.estado === "En curso",
  ).length;

  const totalCompletadas = actividadesVisibles.filter(
    (item) => item.estado === "Completada",
  ).length;

  const totalEstrellasNumbers =
    actividadesVisibles.reduce(
      (total, item) => total + item.estrellas,
      0,
    );

  const cambiarFiltroEstado = (
    estado: EstadoActividadNumbers,
  ) => {
    setFiltroEstado((actual) =>
      actual === estado ? "Todas" : estado,
    );
  };

  const actividadesFiltradas = useMemo(() => {
    const textoBuscado = normalizarTexto(busqueda);

    return actividadesVisibles.filter((item) => {
      const coincideEstado =
        filtroEstado === "Todas" ||
        item.estado === filtroEstado;

      if (!coincideEstado) {
        return false;
      }

      if (!textoBuscado) {
        return true;
      }

      const contenido = normalizarTexto(
        `${item.titulo} ${item.texto} ${item.nivel} ${item.tiempo} ${item.slug} ${item.estado}`,
      );

      return contenido.includes(textoBuscado);
    });
  }, [
    busqueda,
    filtroEstado,
    actividadesVisibles,
  ]);

  const gridClassName = `numbersx-activities-grid ${
    actividadesFiltradas.length <= 3
      ? `numbersx-grid-${actividadesFiltradas.length}`
      : "numbersx-grid-many"
  }`;

  return (
    <main className="numbersx-page">
      <button
        type="button"
        className={`numbersx-hamburger-btn ${
          menuOpen ? "numbersx-hamburger-open" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        <img src={menuHamburguesa} alt="Menú" />
      </button>

      {menuOpen && (
        <div
          className="numbersx-menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`numbersx-sidebar ${
          menuOpen ? "numbersx-sidebar-open" : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="numbersx-sidebar-logo"
        />

        <nav className="numbersx-sidebar-menu">
          <button
            type="button"
            className="numbersx-menu-item"
            onClick={() => irARuta("/")}
          >
            <FiGrid />
            <span>Dashboard principal</span>
          </button>

          <button
            type="button"
            className="numbersx-menu-item numbersx-active"
            onClick={() => irARuta("/seleccion-mundos")}
          >
            <GiRingedPlanet />
            <span>Selección de mundos</span>
          </button>

          <button
            type="button"
            className="numbersx-menu-item"
            onClick={() => irARuta("/retroalimentacion")}
          >
            <FiMessageSquare />
            <span>Retroalimentación</span>
          </button>

          <button
            type="button"
            className="numbersx-menu-item"
            onClick={() => irARuta("/recompensas")}
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="numbersx-menu-item"
            onClick={() => irARuta("/perfil-alumno")}
          >
            <FiUser />
            <span>Perfil del alumno</span>
          </button>

          <button
            type="button"
            className="numbersx-menu-item"
            onClick={() => irARuta("/estadisticas")}
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="numbersx-sidebar-bottom">
          <div className="numbersx-hello-box">
            <img
              src={zorritoHola}
              alt="Explorador MathNumbers"
            />

            <span>¡Hola, explorador!</span>
          </div>

          <div className="numbersx-weekly-progress">
            <div className="numbersx-weekly-head">
              <strong>Progreso semanal</strong>
              <span>Nivel 4</span>
            </div>

            <div className="numbersx-star-progress">
              <span>☆</span>

              <div>
                <b />
              </div>

              <p>60%</p>
            </div>

            <img src={mundoNumbers} alt="MathNumbers" />

            <small>¡Sigue calculando!</small>
          </div>
        </div>
      </aside>

      <section className="numbersx-content">
        <img
          src={heroBanner}
          alt="Banner MathNumbers"
          className="numbersx-bg"
        />

        <section className="numbersx-main">
          <AulaNotice aula={aula} mundo="mathnumbers"/>
          <div className="numbersx-header">
            <div className="numbersx-title-box">
              <h1>Actividades de MathNumbers</h1>

              <p>
                Explora números, fracciones, álgebra y porcentajes con
                retos interactivos.
              </p>

              <div className="numbersx-status-tabs">
                <button
                  type="button"
                  aria-pressed={
                    filtroEstado === "Pendiente"
                  }
                  onClick={() =>
                    cambiarFiltroEstado("Pendiente")
                  }
                >
                  <FiCircle />
                  Pendientes (
                  {cargandoProgreso
                    ? "…"
                    : totalPendientes}
                  )
                </button>

                <button
                  type="button"
                  aria-pressed={
                    filtroEstado === "En curso"
                  }
                  onClick={() =>
                    cambiarFiltroEstado("En curso")
                  }
                >
                  <FiCircle />
                  En curso (
                  {cargandoProgreso
                    ? "…"
                    : totalEnCurso}
                  )
                </button>

                <button
                  type="button"
                  aria-pressed={
                    filtroEstado === "Completada"
                  }
                  onClick={() =>
                    cambiarFiltroEstado("Completada")
                  }
                >
                  <FiCheckCircle />
                  Completadas (
                  {cargandoProgreso
                    ? "…"
                    : totalCompletadas}
                  )
                </button>
              </div>
            </div>

            <div className="numbersx-search-area">
              <div className="numbersx-search-box">
                <FiSearch />

                <input
                  type="search"
                  value={busqueda}
                  placeholder="Buscar actividades o temas..."
                  onChange={(event) =>
                    setBusqueda(event.target.value)
                  }
                />
              </div>

              <button
                type="button"
                className="numbersx-filter-btn"
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("Todas");
                }}
              >
                <FiFilter />
                Limpiar
              </button>
            </div>
          </div>

          {errorProgreso && (
            <div className="numbersx-empty-search">
              <FiHelpCircle />
              <p>
                No se pudo actualizar el estado de las
                actividades. Puedes seguir entrando a ellas.
              </p>
            </div>
          )}

          {!errorProgreso && !cargandoProgreso && (
            <p>
              Progreso MathNumbers: {totalCompletadas}/
              {actividadesVisibles.length} completadas ·{" "}
              {totalEstrellasNumbers} estrellas
            </p>
          )}

          {actividadesFiltradas.length > 0 ? (
           <div className={gridClassName}>
              {actividadesFiltradas.map((item) => (
                <article
                  className={`numbersx-activity-card ${
                    item.bloqueada ? "numbersx-card-locked" : ""
                  }`}
                  key={item.slug || item.titulo}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  {/* Overlay visual de bloqueo cuando la actividad no está disponible */}
                  {item.bloqueada && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.65)",
                        backdropFilter: "blur(4px)",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontWeight: "bold",
                        pointerEvents: "none",
                      }}
                    >
                      <FiLock style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }} />
                      <span style={{ fontSize: "1.1rem", letterSpacing: "0.5px" }}>
                        Bloqueada
                      </span>
                    </div>
                  )}

                  <img
                    src={item.img}
                    alt={item.titulo}
                  />

                  <div className="numbersx-activity-info">
                    <h3>{item.titulo}</h3>

                    <p>{item.texto}</p>

                    <span
                      className={
                        item.nivel === "Fácil"
                          ? "numbersx-easy"
                          : "numbersx-medium"
                      }
                    >
                      {item.nivel} · {item.estado}
                      {item.estrellas > 0
                        ? ` · ${item.estrellas} ★`
                        : ""}
                    </span>

                    <div className="numbersx-activity-bottom">
                      <small>
                        <FiClock />
                        {item.tiempo}
                      </small>

                      <button
                        type="button"
                        disabled={item.bloqueada}
                        onClick={() =>
                          iniciarActividad(item.slug, item.bloqueada)
                        }
                      >
                        {item.bloqueada
                          ? "Bloqueada"
                          : item.estado === "Completada"
                            ? "Repetir"
                            : item.estado === "En curso"
                              ? "Continuar"
                              : "Iniciar"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="numbersx-empty-search">
              <FiSearch />

              <h2>No se encontraron actividades</h2>

              <p>
                Intenta buscar por nombre, tema, nivel o tiempo.
              </p>

              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("Todas");
                }}
              >
                Ver actividades disponibles
              </button>
            </div>
          )}
        </section>

        <footer className="numbersx-footer">
          <p>© MathNova. Todos los derechos reservados.</p>

          <div className="numbersx-footer-icons">
            <button
              type="button"
              onClick={() => navigate("/login")}
              aria-label="Cerrar sesión"
            >
              <FiLogOut className="numbersx-logout-icon" />
            </button>

            <FiHelpCircle className="numbersx-help-icon" />
            <FiSettings className="numbersx-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActividadesMathNumbers;