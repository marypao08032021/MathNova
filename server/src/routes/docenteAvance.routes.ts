const {scopeStudent,scopeGroup}=require('../services/docenteScope');
import { Router, Request, Response } from "express";

type QueryResult<T> = {
  rows: T[];
  rowCount?: number;
};

const pool = require("../db") as {
  query: <T = any>(sql: string, params?: unknown[]) => Promise<QueryResult<T>>;
};

const router = Router();

type TablasAvance = {
  grupos: boolean;
  grupoAlumnos: boolean;
  actividadProgreso: boolean;
  actividadProporcionalidad: boolean;
  actividadRampas: boolean;
  actividadTripulacion: boolean;
  actividadHolograma: boolean;
  actividadSensor: boolean;
};

type ActividadDb = {
  codigo: string;
  titulo: string;
  mundo: string;
  tema: string;
  estudiantes_intentaron: number | null;
  completadas: number | null;
  intentos: number | null;
  promedio_precision: number | null;
  ultima_actividad: string | null;
};

type AlumnoAvanceDb = {
  id_usuario: number;
  nombre_completo: string;
  correo: string | null;
  id_grupo: number | null;
  grupo: string | null;
  codigo: string | null;
  titulo: string | null;
  mundo: string | null;
  tema: string | null;
  aciertos: number | null;
  total_preguntas: number | null;
  precision: number | null;
  completada: boolean | null;
  intentos: number | null;
  tiempo_segundos: number | null;
  fecha_ultimo_intento: string | null;
};

function obtenerIniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "AL";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

function obtenerColor(idUsuario: number) {
  const colores = [
    "#1264e8",
    "#7c3aed",
    "#f59e0b",
    "#32405f",
    "#0f9f9b",
    "#00a651",
    "#ef4444",
    "#ec4899",
  ];

  return colores[Math.abs(idUsuario) % colores.length];
}

function obtenerIdGrupo(valor: unknown) {
  if (!valor || valor === "todos") return null;

  const numero = Number(valor);

  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
}

function obtenerTextoFiltro(valor: unknown) {
  if (typeof valor !== "string") return null;

  const limpio = valor.trim();

  if (!limpio || limpio.toLowerCase() === "todos") return null;

  return limpio;
}

function normalizarCodigo(codigo = "") {
  const valor = codigo.trim().toLowerCase();

  const alias: Record<string, string> = {
    "cofre-bienvenida": "mathnumbers-cofre-bienvenida",
    "ascensor-bunker": "mathnumbers-ascensor-bunker",
    "radar-supervivencia": "mathnumbers-radar-supervivencia",
    "escuadron-tactico": "mathnumbers-escuadron-tactico",
    "generador-energia-inversa": "mathdata-proporcionalidad-inversa",
    "proporcionalidad-inversa": "mathdata-proporcionalidad-inversa",
    "rampas-lanzamiento": "mathgeometry-rampas",
    "rampas-de-lanzamiento": "mathgeometry-rampas",
    tripulacion: "mathdata-tripulacion",
    holograma: "mathdata-holograma",
    "sensor-frecuencias": "mathdata-sensor-frecuencias",
  };

  return alias[valor] || valor;
}

function normalizarCodigoSql(columna: string) {
  return `
    CASE LOWER(COALESCE(NULLIF(${columna}, ''), 'actividad'))
      WHEN 'cofre-bienvenida' THEN 'mathnumbers-cofre-bienvenida'
      WHEN 'ascensor-bunker' THEN 'mathnumbers-ascensor-bunker'
      WHEN 'radar-supervivencia' THEN 'mathnumbers-radar-supervivencia'
      WHEN 'escuadron-tactico' THEN 'mathnumbers-escuadron-tactico'
      WHEN 'generador-energia-inversa' THEN 'mathdata-proporcionalidad-inversa'
      WHEN 'proporcionalidad-inversa' THEN 'mathdata-proporcionalidad-inversa'
      WHEN 'rampas-lanzamiento' THEN 'mathgeometry-rampas'
      WHEN 'rampas-de-lanzamiento' THEN 'mathgeometry-rampas'
      WHEN 'tripulacion' THEN 'mathdata-tripulacion'
      WHEN 'holograma' THEN 'mathdata-holograma'
      WHEN 'sensor-frecuencias' THEN 'mathdata-sensor-frecuencias'
      ELSE LOWER(COALESCE(NULLIF(${columna}, ''), 'actividad'))
    END
  `;
}

function obtenerEstado(params: {
  tieneActividad: boolean;
  completada: boolean;
  precision: number | null;
  intentos: number;
}) {
  if (!params.tieneActividad) {
    return {
      estado: "No iniciada" as const,
      progreso: 0,
    };
  }

  if (params.completada) {
    return {
      estado: "Completada" as const,
      progreso: 100,
    };
  }

  if (
    (params.precision !== null && params.precision < 70) ||
    params.intentos >= 3
  ) {
    return {
      estado: "Requiere apoyo" as const,
      progreso:
        params.precision !== null
          ? Math.max(10, Math.min(95, Math.round(params.precision)))
          : 45,
    };
  }

  return {
    estado: "En progreso" as const,
    progreso:
      params.precision !== null
        ? Math.max(10, Math.min(95, Math.round(params.precision)))
        : 55,
  };
}

function obtenerDescripcionProgreso(params: {
  tieneActividad: boolean;
  aciertos: number;
  totalPreguntas: number;
  precision: number | null;
  completada: boolean;
}) {
  if (!params.tieneActividad) return "Sin intento";

  if (params.totalPreguntas > 0) {
    return `${params.aciertos}/${params.totalPreguntas} correctas`;
  }

  if (params.precision !== null) {
    return `${Math.round(params.precision)}%`;
  }

  return params.completada ? "Completada" : "En proceso";
}

async function existeTabla(tabla: string) {
  const resultado = await pool.query<{ existe: boolean }>(
    "SELECT to_regclass($1) IS NOT NULL AS existe",
    [tabla]
  );

  return Boolean(resultado.rows[0]?.existe);
}

async function obtenerTablasDisponibles(): Promise<TablasAvance> {
  const [
    grupos,
    grupoAlumnos,
    actividadProgreso,
    actividadProporcionalidad,
    actividadRampas,
    actividadTripulacion,
    actividadHolograma,
    actividadSensor,
  ] = await Promise.all([
    existeTabla("public.grupos"),
    existeTabla("public.grupo_alumnos"),
    existeTabla("public.actividad_progreso"),
    existeTabla("public.actividad_proporcionalidad"),
    existeTabla("public.actividad_rampas"),
    existeTabla("public.actividad_tripulacion"),
    existeTabla("public.actividad_holograma"),
    existeTabla("public.actividad_sensor"),
  ]);

  return {
    grupos,
    grupoAlumnos,
    actividadProgreso,
    actividadProporcionalidad,
    actividadRampas,
    actividadTripulacion,
    actividadHolograma,
    actividadSensor,
  };
}

function crearCteGruposAlumno(tablas: TablasAvance) {
  if (!tablas.grupos || !tablas.grupoAlumnos) {
    return `
      grupos_alumno AS (
        SELECT
          NULL::bigint AS id_alumno,
          NULL::bigint AS id_grupo,
          NULL::text AS nombre_grupo
        WHERE false
      )
    `;
  }

  return `
    grupos_alumno AS (
      SELECT DISTINCT ON (ga.id_alumno)
        ga.id_alumno::bigint AS id_alumno,
        ga.id_grupo::bigint AS id_grupo,
        g.nombre_grupo::text AS nombre_grupo
      FROM public.grupo_alumnos ga
      INNER JOIN public.grupos g
        ON g.id_grupo = ga.id_grupo
      WHERE ga.estado=true AND ${scopeGroup('g')}
      ORDER BY ga.id_alumno, ga.id_grupo DESC
    )
  `;
}

function crearSelectProgresoVacio() {
  return `
    SELECT
      NULL::bigint AS id_usuario,
      NULL::text AS codigo,
      NULL::text AS titulo,
      NULL::text AS mundo,
      NULL::text AS tema,
      0::int AS aciertos,
      0::int AS total_preguntas,
      NULL::float AS precision,
      false::boolean AS completada,
      0::int AS intentos,
      0::int AS tiempo_segundos,
      NULL::timestamp AS fecha_ultimo_intento
    WHERE false
  `;
}

function longitudHistorial(columna = "historial_intentos") {
  return `
    CASE
      WHEN jsonb_typeof(COALESCE(${columna}::jsonb, '[]'::jsonb)) = 'array'
      THEN jsonb_array_length(COALESCE(${columna}::jsonb, '[]'::jsonb))
      ELSE 0
    END
  `;
}

function crearSelectLegacy(params: {
  tabla: string;
  mundo: string;
  tema: string;
  codigo: string;
  titulo: string;
  intentosExtra: string;
}) {
  return `
    SELECT
      id_estudiante::bigint AS id_usuario,
      '${params.codigo}'::text AS codigo,
      '${params.titulo}'::text AS titulo,
      '${params.mundo}'::text AS mundo,
      '${params.tema}'::text AS tema,
      CASE WHEN COALESCE(completada, false) THEN 1 ELSE 0 END::int AS aciertos,
      1::int AS total_preguntas,
      CASE
        WHEN COALESCE(completada, false) THEN 100::float
        ELSE NULL::float
      END AS precision,
      COALESCE(completada, false)::boolean AS completada,
      GREATEST(1, COALESCE((${params.intentosExtra}), 0))::int AS intentos,
      COALESCE(tiempo_total, 0)::int AS tiempo_segundos,
      NOW()::timestamp AS fecha_ultimo_intento
    FROM public.${params.tabla}
  `;
}

function crearCteProgreso(tablas: TablasAvance) {
  const selects: string[] = [];

  if (tablas.actividadProgreso) {
    selects.push(`
      SELECT
        id_usuario::bigint AS id_usuario,
        ${normalizarCodigoSql("actividad_codigo")}::text AS codigo,
        COALESCE(NULLIF(actividad_titulo, ''), 'Actividad MathNova')::text AS titulo,
        COALESCE(NULLIF(mundo, ''), 'MathNova')::text AS mundo,
        COALESCE(NULLIF(tema, ''), 'General')::text AS tema,
        COALESCE(aciertos, 0)::int AS aciertos,
        COALESCE(total_preguntas, 0)::int AS total_preguntas,
        CASE
          WHEN precision IS NULL THEN NULL::float
          ELSE LEAST(100, GREATEST(0, precision))::float
        END AS precision,
        COALESCE(completada, false)::boolean AS completada,
        GREATEST(COALESCE(intentos, 1), 1)::int AS intentos,
        COALESCE(tiempo_segundos, 0)::int AS tiempo_segundos,
        COALESCE(fecha_ultimo_intento, NOW())::timestamp AS fecha_ultimo_intento
      FROM public.actividad_progreso
    `);
  }

  if (tablas.actividadProporcionalidad) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_proporcionalidad",
        mundo: "MathData",
        tema: "Proporcionalidad",
        codigo: "mathdata-proporcionalidad-inversa",
        titulo: "El Generador de Energía Inversa",
        intentosExtra: `COALESCE(intentos_completados, 0) + ${longitudHistorial()}`,
      })
    );
  }

  if (tablas.actividadRampas) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_rampas",
        mundo: "MathGeometry",
        tema: "Pendiente y ecuaciones",
        codigo: "mathgeometry-rampas",
        titulo: "Rampas de lanzamiento",
        intentosExtra: `COALESCE(intentos_verificacion, 0) + ${longitudHistorial()}`,
      })
    );
  }

  if (tablas.actividadTripulacion) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_tripulacion",
        mundo: "MathData",
        tema: "Tablas y patrones",
        codigo: "mathdata-tripulacion",
        titulo: "Encuesta de tripulación",
        intentosExtra: `COALESCE(intentos_modulo, 0) + ${longitudHistorial()}`,
      })
    );
  }

  if (tablas.actividadHolograma) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_holograma",
        mundo: "MathData",
        tema: "Gráficas",
        codigo: "mathdata-holograma",
        titulo: "Holograma de reportes",
        intentosExtra: `
          COALESCE(intentos_tipo_grafica, 0)
          + COALESCE(intentos_pregunta_barra, 0)
          + COALESCE(intentos_pregunta_sector, 0)
          + ${longitudHistorial()}
        `,
      })
    );
  }

  if (tablas.actividadSensor) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_sensor",
        mundo: "MathData",
        tema: "Frecuencias",
        codigo: "mathdata-sensor-frecuencias",
        titulo: "Sensor de frecuencias",
        intentosExtra: `
          COALESCE(intentos_pregunta_senal, 0)
          + COALESCE(intentos_pregunta_zona, 0)
          + ${longitudHistorial()}
        `,
      })
    );
  }

  return `
    progreso_base AS (
      ${selects.length > 0 ? selects.join("\nUNION ALL\n") : crearSelectProgresoVacio()}
    )
  `;
}

function crearCtesBase(tablas: TablasAvance) {
  return `
    WITH
    ${crearCteGruposAlumno(tablas)},
    ${crearCteProgreso(tablas)}
  `;
}

async function obtenerGrupos(tablas: TablasAvance) {
  if (!tablas.grupos) {
    return [];
  }

  const cteAlumnosGrupo = tablas.grupoAlumnos
    ? `
      alumnos_grupo AS (
        SELECT
          id_grupo::bigint AS id_grupo,
          COUNT(DISTINCT id_alumno)::int AS total_alumnos
        FROM public.grupo_alumnos
        GROUP BY id_grupo
      )
    `
    : `
      alumnos_grupo AS (
        SELECT
          NULL::bigint AS id_grupo,
          0::int AS total_alumnos
        WHERE false
      )
    `;

  const resultado = await pool.query<{
    id_grupo: number;
    nombre_grupo: string;
    total_alumnos: number;
  }>(`
    WITH ${cteAlumnosGrupo}
    SELECT
      g.id_grupo,
      g.nombre_grupo,
      COALESCE(ag.total_alumnos, 0)::int AS total_alumnos
    FROM public.grupos g
    LEFT JOIN alumnos_grupo ag
      ON ag.id_grupo = g.id_grupo
    WHERE ${scopeGroup('g')}
    ORDER BY g.nombre_grupo ASC;
  `);

  return resultado.rows;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const idGrupo = obtenerIdGrupo(req.query.grupo);
    const mundoFiltro = obtenerTextoFiltro(req.query.mundo);
    const actividadSolicitada = obtenerTextoFiltro(req.query.actividad);
    const actividadNormalizada = actividadSolicitada
      ? normalizarCodigo(actividadSolicitada)
      : null;

    const tablas = await obtenerTablasDisponibles();
    const ctesBase = crearCtesBase(tablas);

    const [grupos, actividadesResultado] = await Promise.all([
      obtenerGrupos(tablas),
      pool.query<ActividadDb>(`
        ${ctesBase}
        SELECT
          codigo,
          MAX(titulo)::text AS titulo,
          MAX(mundo)::text AS mundo,
          MAX(tema)::text AS tema,
          COUNT(DISTINCT id_usuario)::int AS estudiantes_intentaron,
          COUNT(*) FILTER (WHERE completada = true)::int AS completadas,
          COALESCE(SUM(intentos), 0)::int AS intentos,
          ROUND(AVG(precision)::numeric, 1)::float AS promedio_precision,
          MAX(fecha_ultimo_intento) AS ultima_actividad
        FROM progreso_base
        WHERE codigo IS NOT NULL
        GROUP BY codigo
        ORDER BY estudiantes_intentaron DESC, completadas DESC, titulo ASC;
      `),
    ]);

    const actividadesTodas = actividadesResultado.rows.map((actividad) => ({
      codigo: actividad.codigo,
      titulo: actividad.titulo,
      mundo: actividad.mundo || "MathNova",
      tema: actividad.tema || "General",
      estudiantes_intentaron: Number(actividad.estudiantes_intentaron || 0),
      completadas: Number(actividad.completadas || 0),
      intentos: Number(actividad.intentos || 0),
      promedio:
        actividad.promedio_precision === null ||
        actividad.promedio_precision === undefined
          ? null
          : Number((Number(actividad.promedio_precision) / 10).toFixed(1)),
      ultima_actividad: actividad.ultima_actividad,
    }));

    const actividadesFiltradas = mundoFiltro
      ? actividadesTodas.filter(
          (actividad) =>
            actividad.mundo.toLowerCase() === mundoFiltro.toLowerCase()
        )
      : actividadesTodas;

    const actividadSeleccionada =
      actividadesFiltradas.find(
        (actividad) => actividad.codigo === actividadNormalizada
      )?.codigo ||
      actividadesFiltradas[0]?.codigo ||
      null;

    const alumnosResultado = await pool.query<AlumnoAvanceDb>(
      `
      ${ctesBase},
      progreso_actividad AS (
        SELECT DISTINCT ON (id_usuario)
          id_usuario,
          codigo,
          titulo,
          mundo,
          tema,
          aciertos,
          total_preguntas,
          precision,
          completada,
          intentos,
          tiempo_segundos,
          fecha_ultimo_intento
        FROM progreso_base
        WHERE $2::text IS NOT NULL
          AND codigo = $2::text
        ORDER BY id_usuario, fecha_ultimo_intento DESC NULLS LAST
      )
      SELECT
        r.id_usuario,
        r.nombre_completo,
        r.correo,
        ga.id_grupo,
        COALESCE(ga.nombre_grupo, 'Sin grupo') AS grupo,
        pa.codigo,
        pa.titulo,
        pa.mundo,
        pa.tema,
        pa.aciertos,
        pa.total_preguntas,
        pa.precision,
        pa.completada,
        pa.intentos,
        pa.tiempo_segundos,
        pa.fecha_ultimo_intento
      FROM public.registro r
      LEFT JOIN grupos_alumno ga
        ON ga.id_alumno = r.id_usuario
      LEFT JOIN progreso_actividad pa
        ON pa.id_usuario = r.id_usuario
      WHERE ${scopeStudent('r')} AND LOWER(COALESCE(r.rol, '')) IN ('estudiante','alumno')
        AND COALESCE(r.estado, true) = true
        AND (
          $1::bigint IS NULL
          OR ga.id_grupo = $1::bigint
        )
      ORDER BY r.nombre_completo ASC;
      `,
      [idGrupo, actividadSeleccionada]
    );

    const alumnos = alumnosResultado.rows.map((alumno) => {
      const tieneActividad = Boolean(alumno.codigo);
      const precision =
        alumno.precision === null || alumno.precision === undefined
          ? null
          : Number(alumno.precision);
      const intentos = Number(alumno.intentos || 0);
      const aciertos = Number(alumno.aciertos || 0);
      const totalPreguntas = Number(alumno.total_preguntas || 0);
      const completada = Boolean(alumno.completada);
      const estado = obtenerEstado({
        tieneActividad,
        completada,
        precision,
        intentos,
      });

      return {
        id: Number(alumno.id_usuario),
        id_alumno: Number(alumno.id_usuario),
        iniciales: obtenerIniciales(alumno.nombre_completo),
        nombre: alumno.nombre_completo,
        correo: alumno.correo,
        color: obtenerColor(Number(alumno.id_usuario)),
        id_grupo: alumno.id_grupo ? Number(alumno.id_grupo) : null,
        grupo: alumno.grupo || "Sin grupo",
        actividad_codigo: alumno.codigo,
        actividad_titulo: alumno.titulo || "Sin intento",
        mundo: alumno.mundo,
        tema: alumno.tema,
        estado: estado.estado,
        progreso: estado.progreso,
        descripcionProgreso: obtenerDescripcionProgreso({
          tieneActividad,
          aciertos,
          totalPreguntas,
          precision,
          completada,
        }),
        intentos,
        ultimaActividad: alumno.fecha_ultimo_intento,
        promedio:
          precision === null ? null : Number((precision / 10).toFixed(1)),
        tiempo_segundos: Number(alumno.tiempo_segundos || 0),
      };
    });

    const total = alumnos.length;
    const noIniciada = alumnos.filter(
      (alumno) => alumno.estado === "No iniciada"
    ).length;
    const enProgreso = alumnos.filter(
      (alumno) => alumno.estado === "En progreso"
    ).length;
    const completada = alumnos.filter(
      (alumno) => alumno.estado === "Completada"
    ).length;
    const requiereApoyo = alumnos.filter(
      (alumno) => alumno.estado === "Requiere apoyo"
    ).length;
    const alumnosConPromedio = alumnos.filter(
      (alumno) => alumno.promedio !== null
    );
    const alumnosConTiempo = alumnos.filter(
      (alumno) => alumno.tiempo_segundos > 0
    );

    const progresoPromedio =
      total > 0
        ? Math.round(
            alumnos.reduce((suma, alumno) => suma + alumno.progreso, 0) / total
          )
        : 0;

    const promedioActividad =
      alumnosConPromedio.length > 0
        ? Number(
            (
              alumnosConPromedio.reduce(
                (suma, alumno) => suma + Number(alumno.promedio),
                0
              ) / alumnosConPromedio.length
            ).toFixed(1)
          )
        : null;

    const tiempoPromedioMinutos =
      alumnosConTiempo.length > 0
        ? Math.round(
            alumnosConTiempo.reduce(
              (suma, alumno) => suma + alumno.tiempo_segundos,
              0
            ) /
              alumnosConTiempo.length /
              60
          )
        : 0;

    const atencion = [...alumnos]
      .filter(
        (alumno) =>
          alumno.estado === "Requiere apoyo" || alumno.estado === "No iniciada"
      )
      .sort((a, b) => {
        const prioridadA = a.estado === "Requiere apoyo" ? 0 : 1;
        const prioridadB = b.estado === "Requiere apoyo" ? 0 : 1;

        if (prioridadA !== prioridadB) return prioridadA - prioridadB;

        return a.progreso - b.progreso;
      })
      .slice(0, 5)
      .map((alumno) => ({
        id: alumno.id,
        iniciales: alumno.iniciales,
        nombre: alumno.nombre,
        color: alumno.color,
        motivo:
          alumno.estado === "No iniciada"
            ? "Sin intentos"
            : `${alumno.intentos} intento${alumno.intentos === 1 ? "" : "s"}`,
      }));

    return res.json({
      ok: true,
      grupos,
      mundos: Array.from(
        new Set(actividadesTodas.map((actividad) => actividad.mundo))
      ).filter(Boolean),
      actividades: actividadesTodas,
      actividad_seleccionada: actividadSeleccionada,
      alumnos,
      atencion,
      resumen: {
        total,
        noIniciada,
        enProgreso,
        completada,
        requiereApoyo,
        progresoPromedio,
        promedioActividad,
        intentosTotales: alumnos.reduce(
          (suma, alumno) => suma + alumno.intentos,
          0
        ),
        tiempoPromedioMinutos,
      },
    });
  } catch (error) {
    console.error("Error al obtener avance de actividad docente:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo cargar el avance de actividad.",
    });
  }
});

export default router;
