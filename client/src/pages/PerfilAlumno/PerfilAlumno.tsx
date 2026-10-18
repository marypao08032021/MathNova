import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { obtenerPerfilAlumno } from "../../services/alumnoService";
import {
  obtenerResumenAlumno,
  obtenerProgresoAlumno as obtenerProgresoActividades,
  type ProgresoActividad as ProgresoActividadReal,
} from "../../services/progresoService";

import { clearAuthSession, getSessionUser } from "../../utils/authSession";

import "../Dashboard/Dashboard.css";
import "./PerfilAlumno.css";

import logo from "../../assets/logo_MathNova.png";
import menuHamburguesa from "../../assets/menu-hamburguesa.png";

import alexPerfil from "../../assets/alex-perfil.png";
import estrellasPerfil from "../../assets/estrellas-totales-perfil.png";
import zorritoPerfilAlumno from "../../assets/zorrito_perfil_alumno.png";

import mundo1 from "../../assets/mundo-1-MathNumbers.png";
import mundo2 from "../../assets/mundo-2-MathGeometry.png";
import mundo3 from "../../assets/mundo-3-MathData.png";

import primerosPasos from "../../assets/primeros-pasos (2).png";
import explorador from "../../assets/explorador.png";
import calculadorAgil from "../../assets/calculador-agil.png";
import constancia from "../../assets/constancia.png";

import {
  FiGrid,
  FiBookOpen,
  FiEdit,
  FiMessageSquare,
  FiUser,
  FiBarChart2,
  FiHome,
  FiCalendar,
  FiClock,
  FiArrowUpRight,
  FiCheckCircle,
  FiCheck,
  FiHelpCircle,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

import {
  GiRingedPlanet,
  GiTrophyCup,
  GiFlame,
} from "react-icons/gi";

type MundoCompletado = {
  id: number;
  nombre: string;
  completado: boolean;
};

type InsigniaAlumno = {
  id: number;
  nombre: string;
  estado: string;
};

type MundoResumen = {
  mundo: string;
  completadas: number;
  intentadas: number;
  estrellas: number;
  xp: number;
  precision: number;
};

type ResumenAlumno = {
  /*
   * Nombres usados por la versión anterior
   * del servicio de perfil.
   */
  leccionesCompletadas?: number;
  estrellasGanadas?: number;
  rachaActual?: number;
  promedioGeneral?: number;

  tiempoEstudio?: {
    minutos?: number;
    actividadesCompletas?: number;
  };

  /*
   * Nombres actuales enviados por
   * /api/progreso/resumen/:id_usuario
   */
  estrellas_totales?: number;
  estrellas_ganadas?: number;
  xp_total?: number;

  actividades_completadas?: number;
  lecciones_completadas?: number;
  actividades_intentadas?: number;

  precision_promedio?: number;
  promedio_general?: number;
  progreso_general?: number;

  tiempo_total_segundos?: number;
  tiempo_estudio_segundos?: number;
  tiempo_estudio_minutos?: number;

  racha_actual?: number;
};

type RespuestaResumenAlumno = {
  ok?: boolean;
  resumen?: ResumenAlumno;
  mundos?: MundoResumen[];
};

type RespuestaProgresoAlumno = {
  ok?: boolean;
  progreso?: ProgresoActividadReal[];
};

type AlumnoPerfil = {
  id?: number | string;
  id_usuario?: number | string;

  nombreCompleto?: string;
  nombre_completo?: string;

  correo?: string;
  usuario?: string | null;
  rol?: string;
  estado?: boolean;

  fecha_registro?: string;
  miembro_desde?: string;

  grado?: string;
  escuela?: string;
  avatar_url?: string | null;

  nivel?: number;
  titulo?: string;

  estrellas_totales?: number;
  racha_actual?: number;
  lecciones_completadas?: number;

  tiempo_estudio_segundos?: number;
  tiempo_estudio?: string;

  progreso_general?: number;

  mundos_completados?: MundoCompletado[];
  insignias?: InsigniaAlumno[];
};

type ActividadPerfil = Partial<ProgresoActividadReal> & {
  id?: number | string;

  titulo?: string;
  actividadNombre?: string;
  actividadSlug?: string;

  estado?: string;
  porcentaje?: number;

  tema?: string | null;
  modulo?: string;

  updated_at?: string | number | Date | null;
  created_at?: string | number | Date | null;
  fecha_creacion?: string | number | Date | null;
  fechaCompletado?: string | number | Date | null;

  estrellas?: number;
  completada?: boolean;

  mundo?: string;

  actividad_titulo?: string;
  actividad_codigo?: string;

  estrellas_obtenidas?: number;
  tiempo_segundos?: number;
  intentos?: number;
  total_intentos?: number;

  fecha_ultimo_intento?: string | number | Date | null;
};

type MetasSemanales = {
  inicioSemana: Date;
  finSemana: Date;
  leccionesCompletadas: number;
  tiempoEstudioSegundos: number;
  actividadesResueltas: number;
};

const convertirNumero = (
  valor: unknown,
  valorPredeterminado = 0
): number => {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : valorPredeterminado;
};

const limitarPorcentaje = (valor: unknown): number => {
  const numero = convertirNumero(valor);

  return Math.max(
    0,
    Math.min(100, Math.round(numero))
  );
};

function PerfilAlumno() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [alumno, setAlumno] =
    useState<AlumnoPerfil | null>(null);

  const [actividades, setActividades] =
    useState<ActividadPerfil[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const obtenerUsuarioLocal = () => {
    const claves = [
      "usuario",
      "mathnova_user",
      "user",
      "authUser",
      "auth_session",
      "session",
    ];

    for (const clave of claves) {
      try {
        const valorLocal =
          localStorage.getItem(clave);

        const valorSesion =
          sessionStorage.getItem(clave);

        const valor = valorLocal || valorSesion;

        if (!valor) {
          continue;
        }

        const datos = JSON.parse(valor);

        return (
          datos?.usuario ??
          datos?.user ??
          datos
        );
      } catch {
        continue;
      }
    }

    return getSessionUser();
  };

  const obtenerIdUsuario = (
    perfil?: AlumnoPerfil | null
  ): number | string | null => {
    const usuarioLocal = obtenerUsuarioLocal();

    return (
      perfil?.id_usuario ??
      perfil?.id ??
      usuarioLocal?.id_usuario ??
      usuarioLocal?.id ??
      usuarioLocal?.usuario_id ??
      usuarioLocal?.id_alumno ??
      null
    );
  };

  const formatearMinutos = (
    minutos?: number
  ): string => {
    const total = Math.max(
      0,
      Math.floor(convertirNumero(minutos))
    );

    if (total < 60) {
      return `${total}m`;
    }

    const horas = Math.floor(total / 60);
    const resto = total % 60;

    return resto > 0
      ? `${horas}h ${resto}m`
      : `${horas}h`;
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token") ||
          localStorage.getItem("mathnova_token") ||
          sessionStorage.getItem("mathnova_token");

        const usuarioGuardado = obtenerUsuarioLocal();

        if (!token && !usuarioGuardado) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        setCargando(true);
        setError("");

        /*
         * Primero obtenemos la información personal
         * del alumno.
         */
        const perfilData =
          await obtenerPerfilAlumno();

        const perfil: AlumnoPerfil =
          perfilData?.perfil ??
          perfilData?.usuario ??
          {};

        const usuarioLocal =
          obtenerUsuarioLocal();

        const idUsuario =
          obtenerIdUsuario(perfil);

        let resumenProgresoData:
          | RespuestaResumenAlumno
          | null = null;

        let progresoData:
          | RespuestaProgresoAlumno
          | null = null;

        /*
         * Después consultamos el progreso real
         * guardado en actividad_progreso.
         */
        if (idUsuario) {
          try {
            const [
              resumenResponse,
              progresoResponse,
            ] = await Promise.all([
              obtenerResumenAlumno(idUsuario),
              obtenerProgresoActividades(idUsuario),
            ]);

            /*
             * Algunos servicios regresan:
             *
             * {
             *   ok: true,
             *   resumen: {...},
             *   mundos: [...]
             * }
             *
             * Otros podrían regresar directamente
             * el objeto resumen. Aquí soportamos ambos.
             */
            const posibleResumen =
              resumenResponse as
                | RespuestaResumenAlumno
                | ResumenAlumno;

            if (
              posibleResumen &&
              typeof posibleResumen === "object" &&
              "resumen" in posibleResumen
            ) {
              resumenProgresoData =
                posibleResumen as RespuestaResumenAlumno;
            } else {
              resumenProgresoData = {
                resumen:
                  posibleResumen as ResumenAlumno,
                mundos: [],
              };
            }

            /*
             * También soportamos que el servicio de
             * progreso regrese un arreglo directo.
             */
            if (Array.isArray(progresoResponse)) {
              progresoData = {
                progreso:
                  progresoResponse as ProgresoActividadReal[],
              };
            } else {
              progresoData =
                progresoResponse as RespuestaProgresoAlumno;
            }
          } catch (errorProgreso) {
            console.warn(
              "No se pudo cargar el progreso del alumno:",
              errorProgreso
            );
          }
        } else {
          console.warn(
            "No se encontró el id_usuario del alumno."
          );
        }

        const resumenAnterior: ResumenAlumno =
          perfilData?.resumen ?? {};

        const resumenNuevo: ResumenAlumno =
          resumenProgresoData?.resumen ?? {};

        /*
         * El resumen nuevo tiene prioridad sobre
         * cualquier valor anterior del perfil.
         */
        const resumen: ResumenAlumno = {
          ...resumenAnterior,
          ...resumenNuevo,
        };

        const tiempoTotalSegundos =
          convertirNumero(
            resumen.tiempo_total_segundos ??
              resumen.tiempo_estudio_segundos ??
              perfil.tiempo_estudio_segundos ??
              0
          );

        const minutosEstudio =
          convertirNumero(
            resumen.tiempo_estudio_minutos ??
              resumen.tiempoEstudio?.minutos ??
              Math.floor(
                tiempoTotalSegundos / 60
              )
          );

        const actividadesCompletadas =
          convertirNumero(
            resumen.actividades_completadas ??
              resumen.lecciones_completadas ??
              resumen.leccionesCompletadas ??
              resumen.tiempoEstudio
                ?.actividadesCompletas ??
              perfil.lecciones_completadas ??
              0
          );

        const estrellasTotales =
          convertirNumero(
            resumen.estrellas_totales ??
              resumen.estrellas_ganadas ??
              resumen.estrellasGanadas ??
              perfil.estrellas_totales ??
              0
          );

        const progresoPromedio =
          convertirNumero(
            resumen.progreso_general ??
              resumen.precision_promedio ??
              resumen.promedio_general ??
              resumen.promedioGeneral ??
              perfil.progreso_general ??
              0
          );

        const rachaActual =
          convertirNumero(
            resumen.racha_actual ??
              resumen.rachaActual ??
              perfil.racha_actual ??
              0
          );

        const alumnoNormalizado: AlumnoPerfil = {
          id:
            perfil.id ??
            perfil.id_usuario ??
            usuarioLocal?.id_usuario ??
            usuarioLocal?.id,

          id_usuario:
            perfil.id_usuario ??
            perfil.id ??
            usuarioLocal?.id_usuario ??
            usuarioLocal?.id,

          nombre_completo:
            perfil.nombre_completo ??
            perfil.nombreCompleto ??
            usuarioLocal?.nombre_completo ??
            usuarioLocal?.nombreCompleto ??
            usuarioLocal?.usuario ??
            "Alumno",

          nombreCompleto:
            perfil.nombreCompleto ??
            perfil.nombre_completo ??
            usuarioLocal?.nombre_completo ??
            usuarioLocal?.nombreCompleto ??
            usuarioLocal?.usuario ??
            "Alumno",

          correo:
            perfil.correo ??
            usuarioLocal?.correo ??
            usuarioLocal?.correo_electronico ??
            "Sin correo",

          usuario:
            perfil.usuario ??
            usuarioLocal?.usuario ??
            null,

          rol:
            perfil.rol ??
            usuarioLocal?.rol ??
            "estudiante",

          estado:
            perfil.estado ??
            usuarioLocal?.estado ??
            true,

          grado:
            perfil.grado ??
            usuarioLocal?.grado ??
            usuarioLocal?.grado_escolar ??
            "Sin asignar",

          escuela:
            perfil.escuela ??
            usuarioLocal?.escuela ??
            "MathNova",

          fecha_registro:
            perfil.fecha_registro ??
            perfil.miembro_desde ??
            usuarioLocal?.fecha_registro,

          miembro_desde:
            perfil.miembro_desde ??
            perfil.fecha_registro ??
            usuarioLocal?.fecha_registro,

          avatar_url:
            perfil.avatar_url ??
            usuarioLocal?.avatar_url ??
            null,

          nivel:
            perfil.nivel ??
            Math.max(
              1,
              Math.floor(estrellasTotales / 6) +
                1
            ),

          titulo:
            perfil.titulo ??
            "Aprendiz Nova",

          estrellas_totales:
            estrellasTotales,

          racha_actual:
            rachaActual,

          lecciones_completadas:
            actividadesCompletadas,

          tiempo_estudio_segundos:
            tiempoTotalSegundos,

          /*
           * Ya no usamos primero el valor antiguo
           * del perfil, porque podía quedarse en "0m".
           */
          tiempo_estudio:
            formatearMinutos(minutosEstudio),

          progreso_general:
            limitarPorcentaje(
              progresoPromedio
            ),
        };

        const actividadesDesdeProgreso =
          Array.isArray(
            progresoData?.progreso
          )
            ? progresoData.progreso.map(
                (actividad) => ({
                  ...actividad,

                  id:
                    actividad.id_progreso,

                  titulo:
                    actividad.actividad_titulo,

                  actividadNombre:
                    actividad.actividad_titulo,

                  actividadSlug:
                    actividad.actividad_codigo,

                  estado:
                    actividad.completada
                      ? "completada"
                      : "en_curso",

                  porcentaje:
                    convertirNumero(
                      actividad.precision
                    ),

                  updated_at:
                    actividad.fecha_ultimo_intento,

                  estrellas:
                    convertirNumero(
                      actividad.estrellas_obtenidas
                    ),
                })
              )
            : [];

        const actividadesAnteriores =
          Array.isArray(
            perfilData?.actividadesRecientes
          )
            ? perfilData.actividadesRecientes
            : [];

        const actividadesNormalizadas =
          actividadesDesdeProgreso.length > 0
            ? actividadesDesdeProgreso
            : actividadesAnteriores;

        console.log(
          "Perfil normalizado:",
          alumnoNormalizado
        );

        console.log(
          "Resumen nuevo del alumno:",
          resumenNuevo
        );

        console.log(
          "Actividades del alumno:",
          actividadesNormalizadas
        );

        setAlumno(alumnoNormalizado);

        setActividades(
          actividadesNormalizadas as ActividadPerfil[]
        );
      } catch (errorPerfil) {
        console.error(
          "Error al cargar perfil del alumno:",
          errorPerfil
        );

        setError(
          "No se pudo cargar el perfil del alumno."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [navigate]);

  const irARuta = (ruta: string) => {
    setMenuOpen(false);
    navigate(ruta);
  };

  const cerrarSesion = () => {
    clearAuthSession();

    navigate("/login", {
      replace: true,
    });
  };

  const formatearFecha = (
    fecha?: string
  ): string => {
    if (!fecha) {
      return "Sin fecha";
    }

    const fechaConvertida =
      new Date(fecha);

    if (
      Number.isNaN(
        fechaConvertida.getTime()
      )
    ) {
      return "Sin fecha";
    }

    return fechaConvertida.toLocaleDateString(
      "es-MX",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatearFechaActividad = (
    fecha:
      | string
      | number
      | Date
      | null
      | undefined
  ): string => {
    if (!fecha) {
      return "Reciente";
    }

    const fechaConvertida =
      new Date(fecha);

    if (
      Number.isNaN(
        fechaConvertida.getTime()
      )
    ) {
      return "Reciente";
    }

    return fechaConvertida.toLocaleString(
      "es-MX",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const obtenerNombreMundo = (
    nombre: string
  ): string => {
    const nombres: Record<
      string,
      string
    > = {
      MathNumbers: "Planeta Números",
      MathGeometry: "Mundo Geometría",
      MathData: "Galaxia Datos",

      "Planeta Números":
        "Planeta Números",

      "Mundo Geometría":
        "Mundo Geometría",

      "Galaxia Datos":
        "Galaxia Datos",
    };

    return nombres[nombre] || nombre;
  };

  const obtenerImagenMundo = (
    nombre: string
  ): string => {
    const imagenes: Record<
      string,
      string
    > = {
      MathNumbers: mundo1,
      MathGeometry: mundo2,
      MathData: mundo3,

      "Planeta Números": mundo1,
      "Mundo Geometría": mundo2,
      "Galaxia Datos": mundo3,
    };

    return imagenes[nombre] || mundo1;
  };

  const obtenerImagenInsignia = (
    nombre: string
  ): string => {
    const imagenes: Record<
      string,
      string
    > = {
      "Primeros Pasos": primerosPasos,
      Explorador: explorador,
      "Cálculo Ágil": calculadorAgil,
      Constancia: constancia,
    };

    return (
      imagenes[nombre] ||
      primerosPasos
    );
  };

  const actividadesSeguras =
    Array.isArray(actividades)
      ? actividades
      : [];

  const leccionesCompletadas =
    convertirNumero(
      alumno?.lecciones_completadas
    );

  const progresoGeneral =
    limitarPorcentaje(
      alumno?.progreso_general
    );

  const metasSemanales: MetasSemanales =
    useMemo(() => {
      const hoy = new Date();
      const inicioSemana = new Date(hoy);
      const diaSemana = hoy.getDay();

      /*
       * getDay() devuelve 0 para domingo. Esta
       * operación permite que la semana siempre
       * comience en lunes.
       */
      const diferenciaHastaLunes =
        diaSemana === 0
          ? -6
          : 1 - diaSemana;

      inicioSemana.setDate(
        hoy.getDate() +
          diferenciaHastaLunes
      );

      inicioSemana.setHours(
        0,
        0,
        0,
        0
      );

      const finSemana = new Date(
        inicioSemana
      );

      finSemana.setDate(
        inicioSemana.getDate() + 6
      );

      finSemana.setHours(
        23,
        59,
        59,
        999
      );

      const leccionesUnicas =
        new Set<string>();

      let tiempoEstudioSegundos = 0;
      let actividadesResueltas = 0;

      actividadesSeguras.forEach(
        (actividad, index) => {
          const fechaActividad =
            actividad.fecha_ultimo_intento ??
            actividad.updated_at ??
            actividad.fechaCompletado ??
            actividad.created_at ??
            actividad.fecha_creacion ??
            null;

          if (!fechaActividad) {
            return;
          }

          const fechaConvertida =
            new Date(fechaActividad);

          if (
            Number.isNaN(
              fechaConvertida.getTime()
            ) ||
            fechaConvertida < inicioSemana ||
            fechaConvertida > finSemana
          ) {
            return;
          }

          const actividadCompletada =
            actividad.completada === true ||
            actividad.estado ===
              "completada";

          if (actividadCompletada) {
            const codigoActividad =
              actividad.actividad_codigo ??
              actividad.actividadSlug ??
              actividad.id_progreso ??
              actividad.id ??
              `${actividad.mundo ?? "mundo"}-${index}`;

            leccionesUnicas.add(
              String(codigoActividad)
            );
          }

          tiempoEstudioSegundos +=
            Math.max(
              0,
              convertirNumero(
                actividad.tiempo_segundos
              )
            );

          /*
           * Cuando el backend incluye el número
           * de intentos lo respetamos. Si no lo
           * incluye, cada registro semanal cuenta
           * como una actividad resuelta.
           */
          const intentosRegistrados =
            convertirNumero(
              actividad.total_intentos ??
                actividad.intentos,
              1
            );

          actividadesResueltas +=
            Math.max(
              1,
              Math.floor(
                intentosRegistrados
              )
            );
        }
      );

      return {
        inicioSemana,
        finSemana,
        leccionesCompletadas:
          leccionesUnicas.size,
        tiempoEstudioSegundos,
        actividadesResueltas,
      };
    }, [actividadesSeguras]);

  const progresoMetaLecciones =
    Math.min(
      (metasSemanales.leccionesCompletadas /
        10) *
        100,
      100
    );

  const progresoMetaHoras =
    Math.min(
      (metasSemanales.tiempoEstudioSegundos /
        18000) *
        100,
      100
    );

  const progresoMetaActividades =
    Math.min(
      (metasSemanales.actividadesResueltas /
        20) *
        100,
      100
    );

  const tiempoMetaSemanal =
    formatearMinutos(
      Math.floor(
        metasSemanales.tiempoEstudioSegundos /
          60
      )
    );

  const actividadReciente =
    useMemo(() => {
      return actividadesSeguras
        .map((actividad) => ({
          ...actividad,

          titulo:
            actividad.titulo ||
            actividad.actividad_titulo ||
            actividad.actividadNombre ||
            actividad.actividadSlug ||
            actividad.actividad_codigo ||
            "Actividad",

          estado:
            actividad.estado ||
            (
              actividad.completada
                ? "completada"
                : "en_curso"
            ),

          updated_at:
            actividad.updated_at ||
            actividad.fecha_ultimo_intento ||
            actividad.fechaCompletado ||
            null,
        }))
        .sort((actividadA, actividadB) => {
          const fechaA =
            actividadA.updated_at
              ? new Date(
                  actividadA.updated_at
                ).getTime()
              : 0;

          const fechaB =
            actividadB.updated_at
              ? new Date(
                  actividadB.updated_at
                ).getTime()
              : 0;

          return fechaB - fechaA;
        })
        .slice(0, 3);
    }, [actividadesSeguras]);

  const mundosCompletados:
    MundoCompletado[] = useMemo(() => {
      if (
        alumno?.mundos_completados &&
        alumno.mundos_completados.length > 0
      ) {
        return alumno.mundos_completados;
      }

      const mundosBase = [
        {
          id: 1,
          nombre: "MathNumbers",
        },
        {
          id: 2,
          nombre: "MathGeometry",
        },
        {
          id: 3,
          nombre: "MathData",
        },
      ];

      return mundosBase.map((mundo) => ({
        ...mundo,

        completado:
          actividadesSeguras.some(
            (actividad) =>
              actividad.mundo ===
                mundo.nombre &&
              actividad.completada === true
          ),
      }));
    }, [
      alumno?.mundos_completados,
      actividadesSeguras,
    ]);

  const insignias:
    InsigniaAlumno[] = useMemo(() => {
      if (
        alumno?.insignias &&
        alumno.insignias.length > 0
      ) {
        return alumno.insignias;
      }

      const algunMundoCompletado =
        mundosCompletados.some(
          (mundo) =>
            mundo.completado
        );

      return [
        {
          id: 1,
          nombre: "Primeros Pasos",

          estado:
            leccionesCompletadas > 0
              ? "Desbloqueada"
              : "Bloqueada",
        },
        {
          id: 2,
          nombre: "Explorador",

          estado:
            algunMundoCompletado
              ? "Desbloqueada"
              : "Bloqueada",
        },
        {
          id: 3,
          nombre: "Cálculo Ágil",

          estado:
            progresoGeneral >= 80
              ? "Desbloqueada"
              : "Bloqueada",
        },
        {
          id: 4,
          nombre: "Constancia",

          estado:
            convertirNumero(
              alumno?.racha_actual
            ) >= 3
              ? "Desbloqueada"
              : "Bloqueada",
        },
      ];
    }, [
      alumno?.insignias,
      alumno?.racha_actual,
      mundosCompletados,
      leccionesCompletadas,
      progresoGeneral,
    ]);

  const textoActividad = (
    actividad: ActividadPerfil
  ): string => {
    const titulo =
      actividad.titulo ||
      actividad.actividad_titulo ||
      actividad.actividadNombre ||
      actividad.actividadSlug ||
      actividad.actividad_codigo ||
      "Actividad";

    if (
      actividad.estado ===
        "completada" ||
      actividad.completada
    ) {
      return `Completaste la actividad “${titulo}”`;
    }

    return `Iniciaste la actividad “${titulo}”`;
  };

  const iconoActividad = (
    actividad: ActividadPerfil
  ) => {
    if (
      actividad.estado ===
        "completada" ||
      actividad.completada
    ) {
      return (
        <FiCheckCircle className="green-icon" />
      );
    }

    return (
      <FiBookOpen className="blue-icon" />
    );
  };

  if (cargando) {
    return (
      <main className="dashboard-page perfil-layout">
        <section className="perfil-content">
          <header className="perfil-title">
            <h1>Cargando perfil...</h1>

            <p>
              Estamos preparando tu
              información.
            </p>
          </header>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page perfil-layout">
        <section className="perfil-content">
          <header className="perfil-title">
            <h1>
              Perfil del alumno
            </h1>

            <p>{error}</p>
          </header>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page perfil-layout">
      <button
        type="button"
        className={`hamburger-btn ${
          menuOpen
            ? "hamburger-open"
            : ""
        }`}
        onClick={() =>
          setMenuOpen(
            (estadoActual) =>
              !estadoActual
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
          className="menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`sidebar ${
          menuOpen
            ? "sidebar-open"
            : ""
        }`}
      >
        <img
          src={logo}
          alt="MathNova"
          className="sidebar-logo"
        />

        <nav className="sidebar-menu">
          <button
            type="button"
            className="menu-item"
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
            className="menu-item"
            onClick={() =>
              irARuta(
                "/seleccion-mundos"
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
            className="menu-item"
            onClick={() =>
              irARuta(
                "/retroalimentacion"
              )
            }
          >
            <FiMessageSquare />

            <span>
              Retroalimentación
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              irARuta("/recompensas")
            }
          >
            <GiTrophyCup />

            <span>
              Recompensas
            </span>
          </button>

          <button
            type="button"
            className="menu-item active"
          >
            <FiUser />

            <span>
              Perfil del alumno
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              irARuta("/estadisticas")
            }
          >
            <FiBarChart2 />

            <span>
              Estadísticas
            </span>
          </button>
        </nav>

        <div className="perfil-menu-fox-box">
          <img
            src={zorritoPerfilAlumno}
            alt="Zorrito perfil alumno"
            className="perfil-menu-fox"
          />
        </div>
      </aside>

      <section className="perfil-content">
          <button type="button" className="mn-edit-profile" onClick={()=>navigate("/cuenta")}>Editar mis datos y avatar</button>
        <header className="perfil-title">
          <h1>Perfil del alumno</h1>

          <p>
            Consulta tu información y
            tus logros.
          </p>
        </header>

        <section className="perfil-top-grid">
          <article className="perfil-main-card">
            <img
              src={
                alumno?.avatar_url ||
                alexPerfil
              }
              alt={
                alumno?.nombre_completo ||
                "Alumno"
              }
              className="alex-img"
            />

            <div className="perfil-name">
              <h2>
                {alumno?.nombre_completo ||
                  "Alumno"}
              </h2>

              <span>
                ⭐ Nivel{" "}
                {alumno?.nivel ?? 1} •{" "}
                {alumno?.titulo ??
                  "Aprendiz Nova"}
              </span>

              <div className="racha-box">
                <GiFlame />

                <div>
                  <p>
                    Racha actual
                  </p>

                  <strong>
                    {alumno?.racha_actual ??
                      0}{" "}
                    días
                  </strong>
                </div>
              </div>
            </div>

            <div className="perfil-divider" />

            <div className="estrellas-box">
              <p>
                Estrellas totales
              </p>

              <div>
                <img
                  src={estrellasPerfil}
                  alt="Estrellas"
                />

                <strong>
                  {alumno?.estrellas_totales ??
                    0}
                </strong>
              </div>

              <span>
                {(alumno?.estrellas_totales ??
                  0) > 0
                  ? "¡Sigue así, vas increíble!"
                  : "Completa actividades para ganar estrellas"}
              </span>
            </div>
          </article>

          <article className="mini-card green-mini">
            <h3>
              Lecciones completadas
            </h3>

            <strong>
              {leccionesCompletadas}
            </strong>

            <FiBookOpen className="card-icon" />
          </article>

          <article className="mini-card blue-mini">
            <h3>
              Tiempo de estudio
            </h3>

            <strong>
              {alumno?.tiempo_estudio ??
                "0m"}
            </strong>

            <FiClock />
          </article>

          <article className="mini-card purple-mini">
            <h3>
              Progreso general
            </h3>

            <strong>
              {progresoGeneral}%
            </strong>

            <FiArrowUpRight />
          </article>
        </section>

        <section className="perfil-middle-grid">
          <article className="perfil-panel datos-panel">
            <h2>
              Datos del alumno
            </h2>

            <div className="dato-row">
              <FiUser />

              <span>
                Nombre completo
              </span>

              <strong>
                {alumno?.nombre_completo ||
                  "Sin nombre"}
              </strong>
            </div>

            <div className="dato-row">
              <FiBookOpen />

              <span>Grado</span>

              <strong>
                {alumno?.grado ||
                  "Sin asignar"}
              </strong>
            </div>

            <div className="dato-row">
              <FiHome />

              <span>Escuela</span>

              <strong>
                {alumno?.escuela ||
                  "MathNova"}
              </strong>
            </div>

            <div className="dato-row">
              <FiCalendar />

              <span>
                Miembro desde
              </span>

              <strong>
                {formatearFecha(
                  alumno?.miembro_desde ||
                    alumno?.fecha_registro
                )}
              </strong>
            </div>
          </article>

          <article className="perfil-panel mundos-panel">
            <h2>
              Mundos completados
            </h2>

            <div className="mundos-list">
              {mundosCompletados.map(
                (mundo) => (
                  <div
                    className="mundo-item"
                    key={mundo.id}
                  >
                    <div className="mundo-img-box">
                      <img
                        src={obtenerImagenMundo(
                          mundo.nombre
                        )}
                        alt={obtenerNombreMundo(
                          mundo.nombre
                        )}
                      />

                      {mundo.completado && (
                        <span className="check-badge">
                          <FiCheck />
                        </span>
                      )}
                    </div>

                    <span>
                      {obtenerNombreMundo(
                        mundo.nombre
                      )}
                    </span>
                  </div>
                )
              )}
            </div>

            <button
              type="button"
              className="ver-link"
              onClick={() =>
                irARuta(
                  "/seleccion-mundos"
                )
              }
            >
              Ver todos los mundos →
            </button>
          </article>

          <article className="perfil-panel insignias-panel">
            <div className="panel-header">
              <h2>
                Insignias destacadas
              </h2>

              <button
                type="button"
                className="ver-link"
                onClick={() =>
                  irARuta(
                    "/recompensas"
                  )
                }
              >
                Ver todas
              </button>
            </div>

            <div className="insignias-list">
              {insignias.map(
                (insignia) => (
                  <div
                    className="insignia-item"
                    key={insignia.id}
                  >
                    <img
                      src={obtenerImagenInsignia(
                        insignia.nombre
                      )}
                      alt={
                        insignia.nombre
                      }
                    />

                    <strong>
                      {insignia.nombre}
                    </strong>

                    <span>
                      {insignia.estado}
                    </span>
                  </div>
                )
              )}
            </div>
          </article>
        </section>

        <section className="perfil-bottom-grid">
          <article className="perfil-panel actividad-panel">
            <h2>
              Actividad reciente
            </h2>

            {actividadReciente.length >
            0 ? (
              actividadReciente.map(
                (actividad, index) => (
                  <div
                    className="actividad-row"
                    key={
                      actividad.id ||
                      actividad.id_progreso ||
                      actividad.actividadSlug ||
                      actividad.actividad_codigo ||
                      `${actividad.mundo}-${index}`
                    }
                  >
                    {iconoActividad(
                      actividad
                    )}

                    <span>
                      {textoActividad(
                        actividad
                      )}
                    </span>

                    <small>
                      {formatearFechaActividad(
                        actividad.updated_at
                      )}
                    </small>

                    <strong>
                      ⭐ +
                      {actividad.estrellas_obtenidas ??
                        actividad.estrellas ??
                        0}
                    </strong>
                  </div>
                )
              )
            ) : (
              <div className="recent-empty-box">
                <p>
                  Aún no tienes
                  actividad reciente.
                </p>

                <span>
                  Cuando inicies o
                  completes actividades,
                  aparecerán aquí
                  automáticamente.
                </span>
              </div>
            )}

            <button
              type="button"
              className="ver-link"
              onClick={() =>
                irARuta(
                  "/seleccion-mundos"
                )
              }
            >
              Ver toda tu actividad →
            </button>
          </article>

          <article className="perfil-panel metas-panel">
            <div className="panel-header">
              <h2>
                Metas de la semana
              </h2>

              <span>
                Semana actual
              </span>
            </div>

            <div className="meta-row">
              <FiBookOpen />

              <span>
                Completa 10 lecciones
              </span>

              <div className="meta-bar">
                <span
                  style={{
                    width: `${progresoMetaLecciones}%`,
                  }}
                />
              </div>

              <strong>
                {
                  metasSemanales.leccionesCompletadas
                }
                /10
              </strong>

              <b>
                {metasSemanales.leccionesCompletadas >=
                10
                  ? "✅ Cumplida"
                  : "⭐ +100"}
              </b>
            </div>

            <div className="meta-row">
              <FiClock />

              <span>
                Estudia 5 horas esta
                semana
              </span>

              <div className="meta-bar">
                <span
                  style={{
                    width: `${progresoMetaHoras}%`,
                  }}
                />
              </div>

              <strong>
                {tiempoMetaSemanal} / 5h
              </strong>

              <b>
                {metasSemanales.tiempoEstudioSegundos >=
                18000
                  ? "✅ Cumplida"
                  : "⭐ +100"}
              </b>
            </div>

            <div className="meta-row">
              <FiEdit />

              <span>
                Resuelve 20 actividades
              </span>

              <div className="meta-bar">
                <span
                  style={{
                    width: `${progresoMetaActividades}%`,
                  }}
                />
              </div>

              <strong>
                {
                  metasSemanales.actividadesResueltas
                }
                /20
              </strong>

              <b>
                {metasSemanales.actividadesResueltas >=
                20
                  ? "✅ Cumplida"
                  : "⭐ +100"}
              </b>
            </div>

            <button
              type="button"
              className="ver-link"
              onClick={() =>
                irARuta("/estadisticas")
              }
            >
              Ver todas mis metas →
            </button>
          </article>
        </section>

        <footer className="dashboard-footer">
          <p>
            © MathNova. Todos los
            derechos reservados.
          </p>

          <div className="footer-icons">
            <button
              type="button"
              className="footer-icon-btn"
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
            >
              <FiLogOut className="logout-icon" />
            </button>

            <FiHelpCircle className="help-icon" />
            <FiSettings className="settings-icon" />
          </div>
        </footer>
      </section>
    </main>
  );
}

export default PerfilAlumno;