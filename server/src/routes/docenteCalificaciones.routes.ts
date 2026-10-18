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

type TablasCalificaciones = {
  grupos: boolean;
  grupoAlumnos: boolean;
  actividadProgreso: boolean;
  actividadProporcionalidad: boolean;
  actividadRampas: boolean;
  actividadTripulacion: boolean;
  actividadHolograma: boolean;
  actividadSensor: boolean;
};

type AlumnoDb = {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  usuario: string | null;
  id_grupo: number | null;
  grupo: string | null;
  actividades_intentadas: number | null;
  actividades_completadas: number | null;
  actividades_calificadas: number | null;
  intentos_totales: number | null;
  promedio_precision: number | null;
  estrellas: number | null;
  tiempo_total_segundos: number | null;
  ultimo_modulo: string | null;
  ultimo_mundo: string | null;
  ultima_actividad: string | null;
};

type ActividadDb = {
  actividad_titulo: string;
  mundo: string;
  promedio: number | null;
  completadas: number | null;
  intentadas: number | null;
  intentos: number | null;
};

type DetalleActividadDb = {
  id_usuario: number;
  mundo: string | null;
  tema: string | null;
  actividad_codigo: string | null;
  actividad_titulo: string | null;
  respuestas: unknown;
  aciertos: number | null;
  total_preguntas: number | null;
  precision: number | null;
  estrellas_obtenidas: number | null;
  xp_obtenido: number | null;
  completada: boolean | null;
  tiempo_segundos: number | null;
  intentos: number | null;
  fecha_ultimo_intento: string | null;
};

type RespuestaDetalle = {
  campo: string;
  etiqueta: string;
  valor: string;
  abierta: boolean;
};

function obtenerIniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "AL";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

function obtenerColor(idUsuario: number) {
  const colores = [
    "blue",
    "purple",
    "orange",
    "gray",
    "silver",
    "green",
    "yellow",
    "violet",
  ];

  return colores[Math.abs(idUsuario) % colores.length];
}

function obtenerIdGrupo(valor: unknown) {
  if (!valor || valor === "todos") return null;

  const numero = Number(valor);

  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
}

function obtenerEstado(promedio: number | null, actividadesIntentadas: number) {
  if (actividadesIntentadas <= 0) {
    return {
      texto: "Sin progreso",
      clase: "pendiente" as const,
    };
  }

  if (promedio === null) {
    return {
      texto: "En proceso",
      clase: "pendiente" as const,
    };
  }

  if (promedio >= 9) {
    return {
      texto: "Excelente",
      clase: "excelente" as const,
    };
  }

  if (promedio >= 7) {
    return {
      texto: "Bien",
      clase: "bien" as const,
    };
  }

  return {
    texto: "En riesgo",
    clase: "alerta" as const,
  };
}

function normalizarMundo(mundo = "") {
  const texto = mundo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "");

  if (texto === "mathnumbers" || texto === "numbers") return "MathNumbers";
  if (texto === "mathdata" || texto === "data") return "MathData";
  if (texto === "mathgeometry" || texto === "geometry") return "MathGeometry";

  return mundo || "MathNova";
}

function etiquetaCampo(campo: string) {
  return campo
    .replace(/\.\d+/g, (coincidencia) => ` ${coincidencia.replace(".", "#")}`)
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function valorLegible(valor: unknown) {
  if (valor === null || valor === undefined) return "";

  if (typeof valor === "string") return valor.trim();
  if (typeof valor === "number" || typeof valor === "boolean") {
    return String(valor);
  }

  try {
    return JSON.stringify(valor);
  } catch {
    return String(valor);
  }
}

function extraerRespuestas(respuestas: unknown) {
  const detalles: RespuestaDetalle[] = [];

  const visitar = (valor: unknown, ruta: string, profundidad: number) => {
    if (profundidad > 5 || detalles.length >= 90) return;

    if (
      valor === null ||
      valor === undefined ||
      typeof valor === "function"
    ) {
      return;
    }

    if (
      typeof valor === "string" ||
      typeof valor === "number" ||
      typeof valor === "boolean"
    ) {
      const texto = valorLegible(valor);

      if (!texto) return;

      const rutaNormalizada = ruta
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const abierta =
        typeof valor === "string" &&
        texto.length >= 3 &&
        /explic|texto|justific|razon|argument|coment|reflex|respuesta_abierta|prediccion|bitacora|descripcion|observacion/.test(
          rutaNormalizada
        );

      detalles.push({
        campo: ruta || "respuesta",
        etiqueta: etiquetaCampo(ruta || "respuesta"),
        valor: texto.slice(0, 700),
        abierta,
      });

      return;
    }

    if (Array.isArray(valor)) {
      valor.forEach((item, index) =>
        visitar(item, ruta ? `${ruta}.${index + 1}` : `${index + 1}`, profundidad + 1)
      );
      return;
    }

    if (typeof valor === "object") {
      Object.entries(valor as Record<string, unknown>).forEach(([clave, item]) =>
        visitar(item, ruta ? `${ruta}.${clave}` : clave, profundidad + 1)
      );
    }
  };

  visitar(respuestas, "", 0);

  return detalles;
}

function obtenerEstadoActividadDetalle(
  precision: number | null,
  completada: boolean
) {
  if (completada && precision !== null && precision >= 80) {
    return {
      texto: "Va muy bien",
      clase: "completed" as const,
      recomendacion:
        "El alumno resolvió esta actividad con buen resultado automático.",
    };
  }

  if (completada && precision !== null && precision >= 60) {
    return {
      texto: "Bien, con áreas de refuerzo",
      clase: "progress" as const,
      recomendacion:
        "La actividad está completada, pero conviene reforzar los conceptos donde falló.",
    };
  }

  if (precision !== null && precision < 60) {
    return {
      texto: "Requiere apoyo",
      clase: "locked" as const,
      recomendacion:
        "El resultado automático es bajo; conviene practicar nuevamente este tema.",
    };
  }

  return {
    texto: completada ? "Completada" : "En proceso",
    clase: completada ? ("completed" as const) : ("progress" as const),
    recomendacion:
      "Hay progreso guardado, pero todavía no hay suficiente calificación para interpretar rendimiento.",
  };
}

async function existeTabla(tabla: string) {
  const resultado = await pool.query<{ existe: boolean }>(
    "SELECT to_regclass($1) IS NOT NULL AS existe",
    [tabla]
  );

  return Boolean(resultado.rows[0]?.existe);
}

async function obtenerTablasDisponibles(): Promise<TablasCalificaciones> {
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

function crearCteGruposAlumno(tablas: TablasCalificaciones) {
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
      NULL::text AS mundo,
      NULL::text AS tema,
      NULL::text AS actividad_codigo,
      NULL::text AS actividad_titulo,
      NULL::jsonb AS respuestas,
      0::int AS aciertos,
      0::int AS total_preguntas,
      NULL::float AS precision,
      0::int AS estrellas_obtenidas,
      0::int AS xp_obtenido,
      false::boolean AS completada,
      0::int AS tiempo_segundos,
      0::int AS intentos,
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
      '${params.mundo}'::text AS mundo,
      '${params.tema}'::text AS tema,
      '${params.codigo}'::text AS actividad_codigo,
      '${params.titulo}'::text AS actividad_titulo,
      NULL::jsonb AS respuestas,
      CASE WHEN COALESCE(completada, false) THEN 1 ELSE 0 END::int AS aciertos,
      1::int AS total_preguntas,
      CASE
        WHEN COALESCE(completada, false) THEN 100::float
        ELSE NULL::float
      END AS precision,
      CASE WHEN COALESCE(completada, false) THEN 3 ELSE 0 END::int AS estrellas_obtenidas,
      COALESCE(xp_obtenido, 0)::int AS xp_obtenido,
      COALESCE(completada, false)::boolean AS completada,
      COALESCE(tiempo_total, 0)::int AS tiempo_segundos,
      GREATEST(
        1,
        COALESCE((${params.intentosExtra}), 0)
      )::int AS intentos,
      NOW()::timestamp AS fecha_ultimo_intento
    FROM public.${params.tabla}
  `;
}

function crearCteProgreso(tablas: TablasCalificaciones) {
  const selects: string[] = [];

  if (tablas.actividadProgreso) {
    selects.push(`
      SELECT
        id_usuario::bigint AS id_usuario,
        COALESCE(NULLIF(mundo, ''), 'MathNova')::text AS mundo,
        COALESCE(NULLIF(tema, ''), 'General')::text AS tema,
        COALESCE(NULLIF(actividad_codigo, ''), 'actividad')::text AS actividad_codigo,
        COALESCE(NULLIF(actividad_titulo, ''), 'Actividad MathNova')::text AS actividad_titulo,
        COALESCE(respuestas, '{}'::jsonb) AS respuestas,
        COALESCE(aciertos, 0)::int AS aciertos,
        COALESCE(total_preguntas, 0)::int AS total_preguntas,
        CASE
          WHEN precision IS NULL THEN NULL::float
          ELSE LEAST(100, GREATEST(0, precision))::float
        END AS precision,
        COALESCE(estrellas_obtenidas, 0)::int AS estrellas_obtenidas,
        COALESCE(xp_obtenido, 0)::int AS xp_obtenido,
        COALESCE(completada, false)::boolean AS completada,
        COALESCE(tiempo_segundos, 0)::int AS tiempo_segundos,
        GREATEST(COALESCE(intentos, 1), 1)::int AS intentos,
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
        titulo: "Proporcionalidad inversa",
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
        titulo: "Tripulación de datos",
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
        titulo: "Holograma de gráficas",
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

function crearCtesBase(tablas: TablasCalificaciones) {
  return `
    WITH
    ${crearCteGruposAlumno(tablas)},
    ${crearCteProgreso(tablas)}
  `;
}

router.get("/alumno/:idUsuario", async (req: Request, res: Response) => {
  try {
    const idUsuario = Number(req.params.idUsuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El alumno no es válido.",
      });
    }

    const tablas = await obtenerTablasDisponibles();
    const ctesBase = crearCtesBase(tablas);

    const [alumnoResultado, actividadesResultado] = await Promise.all([
      pool.query<AlumnoDb>(
        `
        ${ctesBase},
        progreso_resumen AS (
          SELECT
            id_usuario,
            COUNT(*)::int AS actividades_intentadas,
            COUNT(*) FILTER (WHERE completada = true)::int AS actividades_completadas,
            COUNT(*) FILTER (WHERE precision IS NOT NULL)::int AS actividades_calificadas,
            COALESCE(SUM(intentos), 0)::int AS intentos_totales,
            COALESCE(SUM(estrellas_obtenidas), 0)::int AS estrellas,
            COALESCE(SUM(tiempo_segundos), 0)::int AS tiempo_total_segundos,
            ROUND((AVG(precision) FILTER (WHERE precision IS NOT NULL))::numeric, 1)::float
              AS promedio_precision,
            MAX(fecha_ultimo_intento) AS ultima_actividad
          FROM progreso_base
          WHERE id_usuario = $1::bigint
          GROUP BY id_usuario
        ),
        ultimo_modulo AS (
          SELECT DISTINCT ON (id_usuario)
            id_usuario,
            actividad_titulo,
            mundo,
            fecha_ultimo_intento
          FROM progreso_base
          WHERE id_usuario = $1::bigint
          ORDER BY id_usuario, fecha_ultimo_intento DESC NULLS LAST
        )
        SELECT
          r.id_usuario,
          r.nombre_completo,
          r.correo,
          r.usuario,
          ga.id_grupo,
          COALESCE(ga.nombre_grupo, 'Sin grupo') AS grupo,
          COALESCE(pr.actividades_intentadas, 0)::int AS actividades_intentadas,
          COALESCE(pr.actividades_completadas, 0)::int AS actividades_completadas,
          COALESCE(pr.actividades_calificadas, 0)::int AS actividades_calificadas,
          COALESCE(pr.intentos_totales, 0)::int AS intentos_totales,
          pr.promedio_precision,
          COALESCE(pr.estrellas, 0)::int AS estrellas,
          COALESCE(pr.tiempo_total_segundos, 0)::int AS tiempo_total_segundos,
          um.actividad_titulo AS ultimo_modulo,
          um.mundo AS ultimo_mundo,
          pr.ultima_actividad
        FROM public.registro r
        LEFT JOIN grupos_alumno ga
          ON ga.id_alumno = r.id_usuario
        LEFT JOIN progreso_resumen pr
          ON pr.id_usuario = r.id_usuario
        LEFT JOIN ultimo_modulo um
          ON um.id_usuario = r.id_usuario
        WHERE ${scopeStudent('r')} AND r.id_usuario = $1::bigint
          AND COALESCE(r.estado, true) = true
        LIMIT 1;
        `,
        [idUsuario]
      ),
      pool.query<DetalleActividadDb>(
        `
        ${ctesBase}
        SELECT
          pb.id_usuario,
          pb.mundo,
          pb.tema,
          pb.actividad_codigo,
          pb.actividad_titulo,
          pb.respuestas,
          pb.aciertos,
          pb.total_preguntas,
          pb.precision,
          pb.estrellas_obtenidas,
          pb.xp_obtenido,
          pb.completada,
          pb.tiempo_segundos,
          pb.intentos,
          pb.fecha_ultimo_intento
        FROM progreso_base pb
        WHERE pb.id_usuario = $1::bigint
        ORDER BY pb.fecha_ultimo_intento DESC NULLS LAST, pb.actividad_titulo ASC;
        `,
        [idUsuario]
      ),
    ]);

    const alumno = alumnoResultado.rows[0];

    if (!alumno) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró el alumno.",
      });
    }

    const actividades = actividadesResultado.rows.map((actividad) => {
      const precision =
        actividad.precision === null || actividad.precision === undefined
          ? null
          : Number(actividad.precision);
      const completada = Boolean(actividad.completada);
      const respuestasDetalle = extraerRespuestas(actividad.respuestas);
      const estado = obtenerEstadoActividadDetalle(precision, completada);

      return {
        codigo: actividad.actividad_codigo || "actividad",
        titulo: actividad.actividad_titulo || "Actividad MathNova",
        mundo: normalizarMundo(actividad.mundo || "MathNova"),
        tema: actividad.tema || "General",
        aciertos: Number(actividad.aciertos || 0),
        total_preguntas: Number(actividad.total_preguntas || 0),
        precision,
        calificacion: precision === null ? null : Number((precision / 10).toFixed(1)),
        estrellas: Number(actividad.estrellas_obtenidas || 0),
        xp: Number(actividad.xp_obtenido || 0),
        completada,
        intentos: Number(actividad.intentos || 0),
        tiempo_segundos: Number(actividad.tiempo_segundos || 0),
        fecha_ultimo_intento: actividad.fecha_ultimo_intento || null,
        estado: estado.texto,
        estado_clase: estado.clase,
        recomendacion: estado.recomendacion,
        respuestas_abiertas: respuestasDetalle.filter((respuesta) => respuesta.abierta),
        respuestas_detalle: respuestasDetalle,
      };
    });

    const mundosBase = ["MathNumbers", "MathGeometry", "MathData"];
    const mundosExtra = Array.from(
      new Set(
        actividades
          .map((actividad) => actividad.mundo)
          .filter((mundo) => !mundosBase.includes(mundo))
      )
    );

    const mundos = [...mundosBase, ...mundosExtra].map((mundo) => {
      const actividadesMundo = actividades.filter(
        (actividad) => normalizarMundo(actividad.mundo) === mundo
      );
      const actividadesConPromedio = actividadesMundo.filter(
        (actividad) => actividad.calificacion !== null
      );
      const promedio =
        actividadesConPromedio.length > 0
          ? Number(
              (
                actividadesConPromedio.reduce(
                  (suma, actividad) => suma + Number(actividad.calificacion),
                  0
                ) / actividadesConPromedio.length
              ).toFixed(1)
            )
          : null;

      return {
        id: mundo,
        nombre: mundo,
        actividades_realizadas: actividadesMundo.length,
        actividades_completadas: actividadesMundo.filter(
          (actividad) => actividad.completada
        ).length,
        promedio,
        intentos: actividadesMundo.reduce(
          (suma, actividad) => suma + actividad.intentos,
          0
        ),
        respuestas_abiertas: actividadesMundo.reduce(
          (suma, actividad) => suma + actividad.respuestas_abiertas.length,
          0
        ),
      };
    });

    const actividadesCalificadas = actividades.filter(
      (actividad) => actividad.calificacion !== null
    );
    const promedio =
      actividadesCalificadas.length > 0
        ? Number(
            (
              actividadesCalificadas.reduce(
                (suma, actividad) => suma + Number(actividad.calificacion),
                0
              ) / actividadesCalificadas.length
            ).toFixed(1)
          )
        : null;
    const estadoAlumno = obtenerEstado(promedio, actividades.length);

    return res.json({
      ok: true,
      alumno: {
        id: Number(alumno.id_usuario),
        nombre: alumno.nombre_completo,
        correo: alumno.correo,
        usuario: alumno.usuario,
        iniciales: obtenerIniciales(alumno.nombre_completo),
        color: obtenerColor(Number(alumno.id_usuario)),
        id_grupo: alumno.id_grupo ? Number(alumno.id_grupo) : null,
        grupo: alumno.grupo || "Sin grupo",
        promedio,
        estado: estadoAlumno.texto,
        estado_clase: estadoAlumno.clase,
      },
      resumen: {
        actividades_intentadas: actividades.length,
        actividades_completadas: actividades.filter(
          (actividad) => actividad.completada
        ).length,
        actividades_calificadas: actividadesCalificadas.length,
        intentos_totales: actividades.reduce(
          (suma, actividad) => suma + actividad.intentos,
          0
        ),
        estrellas_totales: actividades.reduce(
          (suma, actividad) => suma + actividad.estrellas,
          0
        ),
        xp_total: actividades.reduce((suma, actividad) => suma + actividad.xp, 0),
        tiempo_total_segundos: actividades.reduce(
          (suma, actividad) => suma + actividad.tiempo_segundos,
          0
        ),
        respuestas_abiertas: actividades.reduce(
          (suma, actividad) => suma + actividad.respuestas_abiertas.length,
          0
        ),
        promedio,
      },
      mundos,
      actividades,
    });
  } catch (error) {
    console.error("Error al obtener detalle de calificaciones:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo cargar el detalle del alumno.",
    });
  }
});

async function obtenerGrupos(tablas: TablasCalificaciones) {
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
    const tablas = await obtenerTablasDisponibles();
    const ctesBase = crearCtesBase(tablas);

    const [grupos, alumnosResultado, actividadesResultado] = await Promise.all([
      obtenerGrupos(tablas),
      pool.query<AlumnoDb>(
        `
        ${ctesBase},
        progreso_resumen AS (
          SELECT
            id_usuario,
            COUNT(*)::int AS actividades_intentadas,
            COUNT(*) FILTER (WHERE completada = true)::int AS actividades_completadas,
            COUNT(*) FILTER (WHERE precision IS NOT NULL)::int AS actividades_calificadas,
            COALESCE(SUM(intentos), 0)::int AS intentos_totales,
            COALESCE(SUM(estrellas_obtenidas), 0)::int AS estrellas,
            COALESCE(SUM(tiempo_segundos), 0)::int AS tiempo_total_segundos,
            ROUND((AVG(precision) FILTER (WHERE precision IS NOT NULL))::numeric, 1)::float
              AS promedio_precision,
            MAX(fecha_ultimo_intento) AS ultima_actividad
          FROM progreso_base
          GROUP BY id_usuario
        ),
        ultimo_modulo AS (
          SELECT DISTINCT ON (id_usuario)
            id_usuario,
            actividad_titulo,
            mundo,
            fecha_ultimo_intento
          FROM progreso_base
          ORDER BY id_usuario, fecha_ultimo_intento DESC NULLS LAST
        )
        SELECT
          r.id_usuario,
          r.nombre_completo,
          r.correo,
          r.usuario,
          ga.id_grupo,
          COALESCE(ga.nombre_grupo, 'Sin grupo') AS grupo,
          COALESCE(pr.actividades_intentadas, 0)::int AS actividades_intentadas,
          COALESCE(pr.actividades_completadas, 0)::int AS actividades_completadas,
          COALESCE(pr.actividades_calificadas, 0)::int AS actividades_calificadas,
          COALESCE(pr.intentos_totales, 0)::int AS intentos_totales,
          pr.promedio_precision,
          COALESCE(pr.estrellas, 0)::int AS estrellas,
          COALESCE(pr.tiempo_total_segundos, 0)::int AS tiempo_total_segundos,
          um.actividad_titulo AS ultimo_modulo,
          um.mundo AS ultimo_mundo,
          pr.ultima_actividad
        FROM public.registro r
        LEFT JOIN grupos_alumno ga
          ON ga.id_alumno = r.id_usuario
        LEFT JOIN progreso_resumen pr
          ON pr.id_usuario = r.id_usuario
        LEFT JOIN ultimo_modulo um
          ON um.id_usuario = r.id_usuario
        WHERE ${scopeStudent('r')} AND LOWER(COALESCE(r.rol, '')) IN ('estudiante','alumno')
          AND COALESCE(r.estado, true) = true
          AND (
            $1::bigint IS NULL
            OR ga.id_grupo = $1::bigint
          )
        ORDER BY r.nombre_completo ASC;
        `,
        [idGrupo]
      ),
      pool.query<ActividadDb>(
        `
        ${ctesBase}
        SELECT
          pb.actividad_titulo,
          pb.mundo,
          ROUND((AVG(pb.precision) / 10)::numeric, 1)::float AS promedio,
          COUNT(*) FILTER (WHERE pb.completada = true)::int AS completadas,
          COUNT(*)::int AS intentadas,
          COALESCE(SUM(pb.intentos), 0)::int AS intentos
        FROM progreso_base pb
        INNER JOIN public.registro r
          ON r.id_usuario = pb.id_usuario
        LEFT JOIN grupos_alumno ga
          ON ga.id_alumno = r.id_usuario
        WHERE ${scopeStudent('r')} AND LOWER(COALESCE(r.rol, '')) IN ('estudiante','alumno')
          AND COALESCE(r.estado, true) = true
          AND pb.precision IS NOT NULL
          AND (
            $1::bigint IS NULL
            OR ga.id_grupo = $1::bigint
          )
        GROUP BY pb.actividad_titulo, pb.mundo
        ORDER BY completadas DESC, promedio DESC, pb.actividad_titulo ASC
        LIMIT 4;
        `,
        [idGrupo]
      ),
    ]);

    const alumnos = alumnosResultado.rows.map((alumno) => {
      const actividadesIntentadas = Number(alumno.actividades_intentadas || 0);
      const actividadesCompletadas = Number(alumno.actividades_completadas || 0);
      const actividadesCalificadas = Number(alumno.actividades_calificadas || 0);
      const intentosTotales = Number(alumno.intentos_totales || 0);
      const promedioPrecision =
        alumno.promedio_precision === null ||
        alumno.promedio_precision === undefined
          ? null
          : Number(alumno.promedio_precision);

      const promedio =
        actividadesCalificadas > 0 && promedioPrecision !== null
          ? Number((promedioPrecision / 10).toFixed(1))
          : null;

      const estado = obtenerEstado(promedio, actividadesIntentadas);

      return {
        id: Number(alumno.id_usuario),
        nombre: alumno.nombre_completo,
        correo: alumno.correo,
        usuario: alumno.usuario,
        iniciales: obtenerIniciales(alumno.nombre_completo),
        color: obtenerColor(Number(alumno.id_usuario)),
        id_grupo: alumno.id_grupo ? Number(alumno.id_grupo) : null,
        grupo: alumno.grupo || "Sin grupo",
        ultimo_modulo: alumno.ultimo_modulo || "Sin actividades",
        ultimo_mundo: alumno.ultimo_mundo || null,
        ultima_actividad: alumno.ultima_actividad || null,
        actividades_intentadas: actividadesIntentadas,
        actividades_completadas: actividadesCompletadas,
        actividades_calificadas: actividadesCalificadas,
        intentos_totales: intentosTotales,
        promedio,
        estrellas: Number(alumno.estrellas || 0),
        tiempo_total_segundos: Number(alumno.tiempo_total_segundos || 0),
        estado: estado.texto,
        estado_clase: estado.clase,
      };
    });

    const alumnosConPromedio = alumnos.filter(
      (alumno) => alumno.promedio !== null
    );

    const alumnosConProgreso = alumnos.filter(
      (alumno) => alumno.actividades_intentadas > 0
    );

    const promedioGeneral =
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

    const topAlumnos = [...alumnosConPromedio]
      .sort((a, b) => Number(b.promedio) - Number(a.promedio))
      .slice(0, 5);

    const mejorAlumno = topAlumnos[0] || null;

    return res.json({
      ok: true,
      grupos,
      alumnos,
      promedio_por_actividad: actividadesResultado.rows.map((actividad) => ({
        actividad_titulo: actividad.actividad_titulo,
        mundo: actividad.mundo,
        promedio:
          actividad.promedio === null || actividad.promedio === undefined
            ? null
            : Number(actividad.promedio),
        completadas: Number(actividad.completadas || 0),
        intentadas: Number(actividad.intentadas || 0),
        intentos: Number(actividad.intentos || 0),
      })),
      top_alumnos: topAlumnos,
      resumen: {
        total_alumnos: alumnos.length,
        alumnos_con_progreso: alumnosConProgreso.length,
        alumnos_sin_progreso: alumnos.length - alumnosConProgreso.length,
        actividades_calificadas: alumnos.reduce(
          (suma, alumno) => suma + alumno.actividades_calificadas,
          0
        ),
        actividades_completadas: alumnos.reduce(
          (suma, alumno) => suma + alumno.actividades_completadas,
          0
        ),
        intentos_totales: alumnos.reduce(
          (suma, alumno) => suma + alumno.intentos_totales,
          0
        ),
        estrellas_totales: alumnos.reduce(
          (suma, alumno) => suma + alumno.estrellas,
          0
        ),
        promedio_general: promedioGeneral,
        mejor_promedio: mejorAlumno?.promedio ?? null,
        mejor_alumno: mejorAlumno?.nombre ?? null,
      },
    });
  } catch (error) {
    console.error("Error al obtener calificaciones docente:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron cargar las calificaciones.",
    });
  }
});

export default router;
