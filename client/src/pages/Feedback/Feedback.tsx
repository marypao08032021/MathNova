import StudentReviews from "../../components/StudentReviews";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "./Feedback.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import zorritoRe from "../../assets/zorrito-re.png";
import zorritoRetroalimentacion from "../../assets/zorrito-retroalimentacion.png";
import estrellaRe from "../../assets/estrella-re.png";

import {
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMessageSquare,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import {
  GiRingedPlanet,
  GiTrophyCup,
} from "react-icons/gi";

import {
  obtenerPerfilAlumno,
} from "../../services/alumnoService";

import {
  obtenerIdUsuarioAutenticado,
  obtenerProgresoAlumno,
  obtenerResumenAlumno,
} from "../../services/progresoService";

import type {
  ProgresoActividad,
  ResumenAlumno,
} from "../../services/progresoService";

import {
  clearAuthSession,
  getDisplayName,
  isGuestSession,
} from "../../utils/authSession";

type PerfilAlumno = {
  id?: number | string;
  id_usuario?: number | string;
  nombre_completo?: string;
  nombreCompleto?: string;
  usuario?: string | null;
  correo?: string;
  correo_electronico?: string;
  grado?: string;
  grado_escolar?: string;
  rol?: string;
};

type PerfilRespuesta = {
  perfil?: PerfilAlumno;
};

type GuiaMundo = {
  label: string;
  level: string;
  value: number;
  intentadas: number;
  completadas: number;
};

const MUNDOS_GUIA = [
  {
    label: "MathNumbers",
    aliases: [
      "mathnumbers",
      "numbers",
      "numeros",
    ],
  },
  {
    label: "MathGeometry",
    aliases: [
      "mathgeometry",
      "geometry",
      "geometria",
    ],
  },
  {
    label: "MathData",
    aliases: [
      "mathdata",
      "data",
      "estadistica",
    ],
  },
];

const numeroSeguro = (
  valor:
    | number
    | string
    | null
    | undefined,
): number => {
  const convertido = Number(valor ?? 0);

  return Number.isFinite(convertido)
    ? convertido
    : 0;
};

const limitarPorcentaje = (
  valor:
    | number
    | string
    | null
    | undefined,
): number => {
  return Math.min(
    Math.max(
      Math.round(numeroSeguro(valor)),
      0,
    ),
    100,
  );
};

const normalizarTexto = (
  valor: string,
): string => {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]/g, "");
};

const extraerPerfil = (
  respuesta: unknown,
): PerfilAlumno | null => {
  if (
    typeof respuesta !== "object" ||
    respuesta === null
  ) {
    return null;
  }

  const datos =
    respuesta as PerfilRespuesta &
      Record<string, unknown>;

  if (
    datos.perfil &&
    typeof datos.perfil === "object"
  ) {
    return datos.perfil;
  }

  return datos as PerfilAlumno;
};

const obtenerPrecisionActividad = (
  actividad: ProgresoActividad,
): number => {
  const precision =
    numeroSeguro(actividad.precision);

  if (precision > 0) {
    return limitarPorcentaje(precision);
  }

  const totalPreguntas =
    numeroSeguro(
      actividad.total_preguntas,
    );

  if (totalPreguntas <= 0) {
    return 0;
  }

  return limitarPorcentaje(
    (
      numeroSeguro(
        actividad.aciertos,
      ) /
      totalPreguntas
    ) * 100,
  );
};

const formatearTiempo = (
  segundosTotales: number,
): string => {
  const segundos = Math.max(
    0,
    Math.round(segundosTotales),
  );

  if (segundos < 60) {
    return `${segundos}s`;
  }

  const minutos = Math.floor(
    segundos / 60,
  );

  const segundosRestantes =
    segundos % 60;

  if (minutos < 60) {
    return segundosRestantes > 0
      ? `${minutos}m ${segundosRestantes}s`
      : `${minutos}m`;
  }

  const horas = Math.floor(
    minutos / 60,
  );

  const minutosRestantes =
    minutos % 60;

  return minutosRestantes > 0
    ? `${horas}h ${minutosRestantes}m`
    : `${horas}h`;
};

const obtenerNivelProgreso = (
  valor: number,
  intentadas: number,
  completadas: number,
): string => {
  if (intentadas <= 0) {
    return "Pendiente";
  }

  if (
    completadas > 0 &&
    valor >= 80
  ) {
    return "Avanzado";
  }

  if (valor >= 50) {
    return "Intermedio";
  }

  return "Básico";
};

function Feedback() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [alumno, setAlumno] =
    useState<PerfilAlumno | null>(
      null,
    );

  const [resumen, setResumen] =
    useState<ResumenAlumno | null>(
      null,
    );

  const [
    actividades,
    setActividades,
  ] = useState<
    ProgresoActividad[]
  >([]);

  const [cargando, setCargando] =
    useState(true);

  const [
    errorCarga,
    setErrorCarga,
  ] = useState("");

  const navigate = useNavigate();

  const modoInvitado =
    isGuestSession();

  const cargarRetroalimentacion =
    useCallback(async () => {
      const invitado =
        isGuestSession();

      if (invitado) {
        setAlumno(null);
        setResumen(null);
        setActividades([]);
        setErrorCarga("");
        setCargando(false);
        return;
      }

      const idUsuario =
        obtenerIdUsuarioAutenticado();

      if (!idUsuario) {
        clearAuthSession();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setCargando(true);
      setErrorCarga("");

      const resultados =
        await Promise.allSettled([
          obtenerPerfilAlumno(),
          obtenerResumenAlumno(
            idUsuario,
          ),
          obtenerProgresoAlumno(
            idUsuario,
          ),
        ]);

      const [
        resultadoPerfil,
        resultadoResumen,
        resultadoActividades,
      ] = resultados;

      let huboError = false;

      if (
        resultadoPerfil.status ===
        "fulfilled"
      ) {
        setAlumno(
          extraerPerfil(
            resultadoPerfil.value,
          ),
        );
      } else {
        huboError = true;

        console.error(
          "No se pudo cargar el perfil del alumno:",
          resultadoPerfil.reason,
        );
      }

      if (
        resultadoResumen.status ===
        "fulfilled"
      ) {
        setResumen(
          resultadoResumen.value
            .resumen ?? null,
        );
      } else {
        huboError = true;

        console.error(
          "No se pudo cargar el resumen de retroalimentación:",
          resultadoResumen.reason,
        );
      }

      if (
        resultadoActividades.status ===
        "fulfilled"
      ) {
        setActividades(
          Array.isArray(
            resultadoActividades.value
              .progreso,
          )
            ? resultadoActividades.value
                .progreso
            : [],
        );
      } else {
        huboError = true;
        setActividades([]);

        console.error(
          "No se pudo cargar el historial de actividades:",
          resultadoActividades.reason,
        );
      }

      setErrorCarga(
        huboError
          ? "Algunos datos no pudieron actualizarse. Revisa que el servidor esté encendido."
          : "",
      );

      setCargando(false);
    }, [navigate]);

  useEffect(() => {
    document.body.style.overflow =
      menuOpen
        ? "hidden"
        : "auto";

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    void cargarRetroalimentacion();

    const actualizarAlVolver =
      () => {
        void cargarRetroalimentacion();
      };

    const actualizarAlMostrar =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          void cargarRetroalimentacion();
        }
      };

    window.addEventListener(
      "focus",
      actualizarAlVolver,
    );

    document.addEventListener(
      "visibilitychange",
      actualizarAlMostrar,
    );

    return () => {
      window.removeEventListener(
        "focus",
        actualizarAlVolver,
      );

      document.removeEventListener(
        "visibilitychange",
        actualizarAlMostrar,
      );
    };
  }, [cargarRetroalimentacion]);

  const irARuta = (
    ruta: string,
  ) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();

    navigate("/login", {
      replace: true,
    });
  };

  const nombreAlumno =
    modoInvitado
      ? getDisplayName()
      : alumno?.nombre_completo
          ?.trim()
          .split(/\s+/)[0] ||
        alumno?.nombreCompleto
          ?.trim()
          .split(/\s+/)[0] ||
        alumno?.usuario ||
        getDisplayName() ||
        "explorador";

  const gradoAlumno =
    modoInvitado
      ? "Invitado"
      : alumno?.grado_escolar ||
        alumno?.grado ||
        "Estudiante";

  const promedioCalculado =
    useMemo(() => {
      if (
        actividades.length === 0
      ) {
        return 0;
      }

      const suma =
        actividades.reduce(
          (
            acumulador,
            actividad,
          ) =>
            acumulador +
            obtenerPrecisionActividad(
              actividad,
            ),
          0,
        );

      return limitarPorcentaje(
        suma /
          actividades.length,
      );
    }, [actividades]);

  const completadasCalculadas =
    useMemo(
      () =>
        actividades.filter(
          (actividad) =>
            Boolean(
              actividad.completada,
            ),
        ).length,
      [actividades],
    );

  const tiempoCalculado =
    useMemo(
      () =>
        actividades.reduce(
          (
            acumulador,
            actividad,
          ) =>
            acumulador +
            numeroSeguro(
              actividad
                .tiempo_segundos,
            ),
          0,
        ),
      [actividades],
    );

  const estrellasCalculadas =
    useMemo(
      () =>
        actividades.reduce(
          (
            acumulador,
            actividad,
          ) =>
            acumulador +
            numeroSeguro(
              actividad
                .estrellas_obtenidas,
            ),
          0,
        ),
      [actividades],
    );

  const actividadesIntentadas =
    modoInvitado
      ? 0
      : numeroSeguro(
          resumen
            ?.actividades_intentadas,
        ) ||
        actividades.length;

  const leccionesCompletadas =
    modoInvitado
      ? 0
      : numeroSeguro(
          resumen
            ?.actividades_completadas ??
            resumen
              ?.lecciones_completadas,
        ) ||
        completadasCalculadas;

  const promedioResumen =
    numeroSeguro(
      resumen?.promedio_general ??
        resumen
          ?.precision_promedio,
    );

  const promedioGeneral =
    modoInvitado
      ? 0
      : promedioResumen > 0
        ? limitarPorcentaje(
            promedioResumen,
          )
        : promedioCalculado;

  const progresoResumen =
    numeroSeguro(
      resumen?.progreso_general,
    );

  const progresoGeneral =
    modoInvitado
      ? 0
      : progresoResumen > 0
        ? limitarPorcentaje(
            progresoResumen,
          )
        : promedioGeneral;

  const estrellasTotalesResumen =
    numeroSeguro(
      resumen?.estrellas_totales ??
        resumen?.estrellas_ganadas,
    );

  const estrellasGanadas =
    modoInvitado
      ? 0
      : estrellasTotalesResumen >
          0
        ? estrellasTotalesResumen
        : estrellasCalculadas;

  const tiempoTotalResumen =
    numeroSeguro(
      resumen
        ?.tiempo_total_segundos ??
        resumen
          ?.tiempo_estudio_segundos,
    );

  const tiempoTotal =
    modoInvitado
      ? 0
      : tiempoTotalResumen > 0
        ? tiempoTotalResumen
        : tiempoCalculado;

  const divisorTiempo =
    actividadesIntentadas > 0
      ? actividadesIntentadas
      : actividades.length;

  const tiempoPromedio =
    divisorTiempo > 0
      ? tiempoTotal /
        divisorTiempo
      : 0;

  const tiempoPromedioTexto =
    formatearTiempo(
      tiempoPromedio,
    );

  const topics =
    useMemo<GuiaMundo[]>(
      () =>
        MUNDOS_GUIA.map(
          (configuracion) => {
            const aliases =
              configuracion.aliases.map(
                normalizarTexto,
              );

            const actividadesMundo =
              actividades.filter(
                (actividad) => {
                  const mundo =
                    normalizarTexto(
                      actividad.mundo ??
                        "",
                    );

                  return aliases.some(
                    (alias) =>
                      mundo.includes(
                        alias,
                      ),
                  );
                },
              );

            const intentadas =
              actividadesMundo.length;

            const completadas =
              actividadesMundo.filter(
                (actividad) =>
                  Boolean(
                    actividad.completada,
                  ),
              ).length;

            const value =
              intentadas > 0
                ? limitarPorcentaje(
                    actividadesMundo.reduce(
                      (
                        acumulador,
                        actividad,
                      ) =>
                        acumulador +
                        obtenerPrecisionActividad(
                          actividad,
                        ),
                      0,
                    ) /
                      intentadas,
                  )
                : 0;

            return {
              label:
                configuracion.label,
              level:
                obtenerNivelProgreso(
                  value,
                  intentadas,
                  completadas,
                ),
              value,
              intentadas,
              completadas,
            };
          },
        ),
      [actividades],
    );

  const mejorTema =
    useMemo(() => {
      const grupos =
        actividades.reduce<
          Record<
            string,
            {
              total: number;
              suma: number;
            }
          >
        >(
          (
            acumulador,
            actividad,
          ) => {
            const tema =
              actividad.tema?.trim() ||
              actividad.mundo?.trim() ||
              "General";

            if (!acumulador[tema]) {
              acumulador[tema] = {
                total: 0,
                suma: 0,
              };
            }

            acumulador[tema].total +=
              1;

            acumulador[tema].suma +=
              obtenerPrecisionActividad(
                actividad,
              );

            return acumulador;
          },
          {},
        );

      const mejor =
        Object.entries(grupos)
          .map(
            ([
              label,
              datos,
            ]) => ({
              label,
              promedio:
                datos.total > 0
                  ? datos.suma /
                    datos.total
                  : 0,
            }),
          )
          .sort(
            (a, b) =>
              b.promedio -
              a.promedio,
          )[0];

      return mejor?.label ||
        "Sin datos";
    }, [actividades]);

  const temaPorPracticar =
    useMemo(() => {
      const mundoPendiente =
        [...topics].sort(
          (a, b) =>
            a.value - b.value,
        )[0];

      return mundoPendiente
        ?.label ||
        "nuevas actividades";
    }, [topics]);

  const mensajeNova =
    actividadesIntentadas <= 0
      ? `¡Hola, ${nombreAlumno}! Es momento de comenzar tu aventura.`
      : leccionesCompletadas > 0
        ? `¡Buen trabajo, ${nombreAlumno}! Ya completaste ${leccionesCompletadas} ${
            leccionesCompletadas === 1
              ? "actividad"
              : "actividades"
          }.`
        : `¡Ya comenzaste, ${nombreAlumno}! Sigue practicando para completar tu primera actividad.`;

  const consejoNova =
    actividadesIntentadas <= 0
      ? "Completa tu primera actividad para generar recomendaciones personalizadas."
      : promedioGeneral >= 80
        ? `Tu precisión promedio es de ${promedioGeneral}%. ¡Vas excelente!`
        : promedioGeneral >= 50
          ? `Tu precisión promedio es de ${promedioGeneral}%. Estás avanzando, pero todavía puedes mejorar.`
          : `Tu precisión promedio es de ${promedioGeneral}%. Revisa las pistas antes de volver a intentarlo.`;

  const sugerenciaNova =
    actividadesIntentadas <= 0
      ? "Cuando completes actividades, Nova te dará consejos personalizados."
      : `Te recomiendo practicar ${temaPorPracticar} y revisar tus respuestas anteriores.`;

  return (
    <main className="fbk-page">
      <button
        type="button"
        className={`fbk-hamburger-btn ${
          menuOpen
            ? "fbk-hamburger-open"
            : ""
        }`}
        onClick={() =>
          setMenuOpen(
            (estadoActual) =>
              !estadoActual,
          )
        }
        aria-label="Abrir menú"
      >
        <img
          src={menuHamburguesa}
          alt="Menú"
        />
      </button>

      {menuOpen && (
        <div
          className="fbk-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
          aria-hidden="true"
        />
      )}

      <aside
        className={`fbk-sidebar ${
          menuOpen
            ? "fbk-sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="fbk-sidebar-logo"
        />

        <nav className="fbk-sidebar-menu">
          <button
            type="button"
            className="fbk-menu-item"
            onClick={() =>
              irARuta("/dashboard")
            }
          >
            <FiGrid />
            <span>
              Dashboard principal
            </span>
          </button>

          <button
            type="button"
            className="fbk-menu-item"
            onClick={() =>
              irARuta(
                "/seleccion-mundos",
              )
            }
          >
            <GiRingedPlanet />
            <span>
              Selección de mundos
            </span>
          </button>

          <button
            type="button"
            className="fbk-menu-item fbk-active"
          >
            <FiMessageSquare />
            <span>
              Retroalimentación
            </span>
          </button>

          <button
            type="button"
            className="fbk-menu-item"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />
            <span>Recompensas</span>
          </button>

          <button
            type="button"
            className="fbk-menu-item"
            onClick={() =>
              irARuta(
                "/perfil-alumno",
              )
            }
          >
            <FiUser />
            <span>
              Perfil del alumno
            </span>
          </button>

          <button
            type="button"
            className="fbk-menu-item"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />
            <span>Estadísticas</span>
          </button>
        </nav>

        <div className="fbk-sidebar-bottom-card">
          <div className="fbk-mini-fox-circle">
            <img
              src={zorritoRe}
              alt="Nova"
            />
          </div>

          <h3>
            ¡Sigue así, {nombreAlumno}!
          </h3>

          <p>
            Cada paso te acerca a tus
            metas.
          </p>

          <div className="fbk-mini-status">
            <img
              src={estrellaRe}
              alt="Estrella"
            />

            <span>
              {leccionesCompletadas >
              0
                ? `Llevas ${leccionesCompletadas} actividades completadas`
                : "Comienza una actividad para avanzar"}
            </span>
          </div>
        </div>
      </aside>

      <section className="fbk-content"><StudentReviews/>
        <header className="fbk-topbar">
          <div>
            <h1>
              Retroalimentación
            </h1>

            <p>
              Revisa tu progreso,
              consejos y recomendaciones
              personalizadas.
            </p>

            {errorCarga && (
              <p
                role="alert"
                style={{
                  color: "#b42318",
                  fontWeight: 700,
                  marginTop: "8px",
                }}
              >
                {errorCarga}
              </p>
            )}
          </div>

          <div className="fbk-topbar-user-area">
            <button
              type="button"
              className="fbk-bell-btn"
              aria-label="Notificaciones"
            >
              <FiBell />
            </button>

            <div className="fbk-profile-chip">
              <img
                src={zorritoRe}
                alt={nombreAlumno}
              />

              <div>
                <strong>
                  {cargando
                    ? "..."
                    : nombreAlumno}
                </strong>

                <span>
                  {gradoAlumno}
                </span>
              </div>

              <FiChevronDown />
            </div>
          </div>
        </header>

        <section className="fbk-grid">
          <article className="fbk-card fbk-summary-card">
            <div className="fbk-card-icon fbk-blue-icon">
              <FiBarChart2 />
            </div>

            <h2>
              Resumen de Desempeño
            </h2>

            <span className="fbk-summary-badge">
              General
            </span>

            <div className="fbk-summary-box">
              <div className="fbk-summary-row">
                <FiCheck />
                <span>
                  Ejercicios Correctos:
                </span>

                <strong>
                  {cargando
                    ? "..."
                    : `${promedioGeneral}%`}
                </strong>
              </div>

              <div className="fbk-summary-row">
                <FiCheck />
                <span>
                  Tiempo Promedio:
                </span>

                <strong>
                  {cargando
                    ? "..."
                    : tiempoPromedioTexto}
                </strong>
              </div>

              <div className="fbk-summary-row">
                <FiCheck />
                <span>Mejor Tema:</span>

                <strong>
                  {cargando
                    ? "..."
                    : mejorTema}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                irARuta(
                  "/estadisticas",
                )
              }
            >
              Ver Detalles →
            </button>
          </article>

          <article className="fbk-card fbk-guide-card">
            <div className="fbk-card-icon fbk-green-icon">
              <FiBookOpen />
            </div>

            <h2>
              Tu Guía de Estudio
            </h2>

            <p>
              Recomendaciones basadas
              en tus últimas actividades,{" "}
              {nombreAlumno}.
            </p>

            <div className="fbk-main-progress">
              <span
                style={{
                  width: `${progresoGeneral}%`,
                }}
              />
            </div>

            <strong className="fbk-percent-text">
              {cargando
                ? "..."
                : `${progresoGeneral}% completado`}
            </strong>

            <div className="fbk-guide-list">
              {topics.map(
                (topic) => (
                  <div
                    className="fbk-guide-item"
                    key={topic.label}
                  >
                    <div>
                      <span>
                        {topic.label}
                      </span>

                      <b>
                        {topic.level}
                      </b>
                    </div>

                    <i>
                      <span
                        style={{
                          width: `${topic.value}%`,
                        }}
                      />
                    </i>
                  </div>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                irARuta(
                  "/seleccion-mundos",
                )
              }
            >
              Comenzar Guía →
            </button>
          </article>

          <article className="fbk-card fbk-nova-card">
            <div className="fbk-card-icon fbk-orange-icon">
              <img
                src={zorritoRe}
                alt="Nova"
              />
            </div>

            <h2>Mensaje de Nova</h2>

            <div className="fbk-message-panel">
              <p>{mensajeNova}</p>
              <p>{consejoNova}</p>
              <p>{sugerenciaNova}</p>
            </div>

            <button
              type="button"
              onClick={() =>
                irARuta(
                  "/estadisticas",
                )
              }
            >
              Ver Historial →
            </button>
          </article>

          <aside className="fbk-progress-panel">
            <h2>
              ¡Progreso Constante!
            </h2>

            <p>
              Sigue las guías de Nova
              para avanzar.
            </p>

            <img
              src={
                zorritoRetroalimentacion
              }
              alt="Zorrito retroalimentación"
              className="fbk-progress-fox"
            />

            <div className="fbk-progress-stats">
              <div>
                <img
                  src={estrellaRe}
                  alt="Estrella"
                />

                <strong>
                  {cargando
                    ? "..."
                    : leccionesCompletadas}
                </strong>

                <span>
                  Actividades completadas
                </span>
              </div>

              <div>
                <img
                  src={estrellaRe}
                  alt="Estrella"
                />

                <strong>
                  {cargando
                    ? "..."
                    : estrellasGanadas}
                </strong>

                <span>
                  Estrellas ganadas
                </span>
              </div>
            </div>
          </aside>
        </section>

        <footer className="fbk-footer">
          <p>
            © MathNova. Todos los
            derechos reservados.
          </p>

          <div className="fbk-footer-icons">
            <button
              type="button"
              className="fbk-footer-icon-btn"
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
            >
              <FiLogOut className="fbk-logout-icon" />
            </button>

            <FiHelpCircle className="fbk-help-icon" />
            <FiSettings className="fbk-settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Feedback;
