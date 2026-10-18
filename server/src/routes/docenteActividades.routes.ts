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

type ColorActividad = "blue" | "green" | "orange" | "purple";

type CatalogoActividad = {
  codigo: string;
  titulo: string;
  mundo: "MathNumbers" | "MathData" | "MathGeometry";
  tema: string;
  descripcion: string;
  dificultad: "Básica" | "Media" | "Reto";
  duracion: string;
  color: ColorActividad;
};

type ProgresoActividadDb = {
  id_usuario: number;
  nombre_completo: string;
  correo: string | null;
  codigo: string;
  titulo: string;
  mundo: string;
  tema: string;
  respuestas: Record<string, unknown> | null;
  aciertos: number | null;
  total_preguntas: number | null;
  precision: number | null;
  completada: boolean | null;
  intentos: number | null;
  estrellas: number | null;
  tiempo_segundos: number | null;
  fecha_ultimo_intento: string | null;
};

type RespuestaAbierta = {
  id_usuario: number;
  alumno: string;
  iniciales: string;
  actividad_codigo: string;
  actividad_titulo: string;
  campo: string;
  respuesta: string;
  fecha: string | null;
};

const catalogoBase: CatalogoActividad[] = [
  {
    codigo: "mathnumbers-cofre-bienvenida",
    titulo: "El Cofre de Bienvenida",
    mundo: "MathNumbers",
    tema: "Fracciones y decimales",
    descripcion:
      "Actividad introductoria con respuestas automáticas sobre fracciones y decimales.",
    dificultad: "Básica",
    duracion: "15 min",
    color: "orange",
  },
  {
    codigo: "mathnumbers-ascensor-bunker",
    titulo: "El Ascensor del Búnker",
    mundo: "MathNumbers",
    tema: "Positivos y negativos",
    descripcion:
      "Ordena números enteros y explica el criterio usado para tomar decisiones.",
    dificultad: "Media",
    duracion: "18 min",
    color: "orange",
  },
  {
    codigo: "mathnumbers-radar-supervivencia",
    titulo: "El Radar de Supervivencia",
    mundo: "MathNumbers",
    tema: "Positivos y negativos",
    descripcion:
      "Ubica posiciones numéricas y registra una explicación del procedimiento.",
    dificultad: "Media",
    duracion: "20 min",
    color: "orange",
  },
  {
    codigo: "mathnumbers-escuadron-tactico",
    titulo: "Escuadrón Táctico: Desactivación",
    mundo: "MathNumbers",
    tema: "Jerarquía y propiedades",
    descripcion:
      "Resuelve retos de jerarquía de operaciones con calificación automática.",
    dificultad: "Media",
    duracion: "20 min",
    color: "orange",
  },
  {
    codigo: "puente-prioridades",
    titulo: "El Puente de Prioridades",
    mundo: "MathNumbers",
    tema: "Jerarquía y propiedades",
    descripcion:
      "Trabaja prioridad de operaciones y recoge explicación abierta del alumno.",
    dificultad: "Media",
    duracion: "18 min",
    color: "orange",
  },
  {
    codigo: "espejos-boveda",
    titulo: "Los Espejos de la Bóveda",
    mundo: "MathNumbers",
    tema: "Jerarquía y propiedades",
    descripcion:
      "Compara expresiones y justifica respuestas con una explicación escrita.",
    dificultad: "Reto",
    duracion: "20 min",
    color: "orange",
  },
  {
    codigo: "enigma-variables",
    titulo: "El Enigma de Variables",
    mundo: "MathNumbers",
    tema: "Introducción al álgebra",
    descripcion:
      "Interpreta variables, construye expresiones y explica el razonamiento.",
    dificultad: "Reto",
    duracion: "22 min",
    color: "orange",
  },
  {
    codigo: "simulador-codigos",
    titulo: "El Simulador de Códigos Algebraicos",
    mundo: "MathNumbers",
    tema: "Introducción al álgebra",
    descripcion:
      "Predice valores usando reglas algebraicas y guarda explicación abierta.",
    dificultad: "Reto",
    duracion: "22 min",
    color: "orange",
  },
  {
    codigo: "mathdata-proporcionalidad-inversa",
    titulo: "El Generador de Energía Inversa",
    mundo: "MathData",
    tema: "Proporcionalidad",
    descripcion:
      "Reconoce relaciones de proporcionalidad inversa usando tablas y patrones.",
    dificultad: "Media",
    duracion: "20 min",
    color: "blue",
  },
  {
    codigo: "mathdata-tripulacion",
    titulo: "Encuesta de tripulación",
    mundo: "MathData",
    tema: "Tablas y patrones",
    descripcion:
      "Organiza datos de una tripulación y valida respuestas de forma automática.",
    dificultad: "Básica",
    duracion: "16 min",
    color: "blue",
  },
  {
    codigo: "mathdata-holograma",
    titulo: "Holograma de reportes",
    mundo: "MathData",
    tema: "Gráficas",
    descripcion:
      "Interpreta gráficas de barras y sectores a partir de datos del sistema.",
    dificultad: "Media",
    duracion: "20 min",
    color: "purple",
  },
  {
    codigo: "mathdata-sensor-frecuencias",
    titulo: "Sensor de frecuencias",
    mundo: "MathData",
    tema: "Frecuencias",
    descripcion:
      "Analiza frecuencia absoluta y relativa con validación automática.",
    dificultad: "Media",
    duracion: "20 min",
    color: "purple",
  },
  {
    codigo: "mathgeometry-rampas",
    titulo: "Rampas de lanzamiento",
    mundo: "MathGeometry",
    tema: "Pendiente y ecuaciones",
    descripcion:
      "Calcula pendientes y ecuaciones en una misión de geometría analítica.",
    dificultad: "Reto",
    duracion: "25 min",
    color: "green",
  },
];

function obtenerIniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "AL";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
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

function obtenerColorPorMundo(mundo: string): ColorActividad {
  if (normalizarMundo(mundo) === "MathData") return "blue";
  if (normalizarMundo(mundo) === "MathGeometry") return "green";
  return "orange";
}

function obtenerDificultad(promedio: number | null, intentos: number) {
  if (promedio !== null && promedio < 7) return "Reto";
  if (intentos >= 20) return "Media";
  return "Básica";
}

function obtenerEstadoActividad(
  estudiantesIntentaron: number,
  promedio: number | null,
  completadas: number
): { texto: string; clase: "enabled" | "disabled" | "warning" } {
  if (estudiantesIntentaron <= 0) {
    return {
      texto: "Sin intentos",
      clase: "disabled",
    };
  }

  if (promedio !== null && promedio < 7) {
    return {
      texto: "Requiere apoyo",
      clase: "warning",
    };
  }

  if (completadas > 0) {
    return {
      texto: "Con progreso",
      clase: "enabled",
    };
  }

  return {
    texto: "En proceso",
    clase: "enabled",
  };
}

async function existeTabla(tabla: string) {
  const resultado = await pool.query<{ existe: boolean }>(
    "SELECT to_regclass($1) IS NOT NULL AS existe",
    [tabla]
  );

  return Boolean(resultado.rows[0]?.existe);
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

function crearSelectProgresoVacio() {
  return `
    SELECT
      NULL::bigint AS id_usuario,
      NULL::text AS codigo,
      NULL::text AS titulo,
      NULL::text AS mundo,
      NULL::text AS tema,
      NULL::jsonb AS respuestas,
      0::int AS aciertos,
      0::int AS total_preguntas,
      NULL::float AS precision,
      false::boolean AS completada,
      0::int AS intentos,
      0::int AS estrellas,
      0::int AS tiempo_segundos,
      NULL::timestamp AS fecha_ultimo_intento
    WHERE false
  `;
}

function crearSelectLegacy(params: {
  tabla: string;
  codigo: string;
  titulo: string;
  mundo: string;
  tema: string;
  intentosExtra: string;
}) {
  return `
    SELECT
      id_estudiante::bigint AS id_usuario,
      '${params.codigo}'::text AS codigo,
      '${params.titulo}'::text AS titulo,
      '${params.mundo}'::text AS mundo,
      '${params.tema}'::text AS tema,
      NULL::jsonb AS respuestas,
      CASE WHEN COALESCE(completada, false) THEN 1 ELSE 0 END::int AS aciertos,
      1::int AS total_preguntas,
      CASE
        WHEN COALESCE(completada, false) THEN 100::float
        ELSE NULL::float
      END AS precision,
      COALESCE(completada, false)::boolean AS completada,
      GREATEST(1, COALESCE((${params.intentosExtra}), 0))::int AS intentos,
      CASE WHEN COALESCE(completada, false) THEN 3 ELSE 0 END::int AS estrellas,
      COALESCE(tiempo_total, 0)::int AS tiempo_segundos,
      NOW()::timestamp AS fecha_ultimo_intento
    FROM public.${params.tabla}
  `;
}

async function crearCteProgreso() {
  const [
    actividadProgreso,
    actividadProporcionalidad,
    actividadRampas,
    actividadTripulacion,
    actividadHolograma,
    actividadSensor,
  ] = await Promise.all([
    existeTabla("public.actividad_progreso"),
    existeTabla("public.actividad_proporcionalidad"),
    existeTabla("public.actividad_rampas"),
    existeTabla("public.actividad_tripulacion"),
    existeTabla("public.actividad_holograma"),
    existeTabla("public.actividad_sensor"),
  ]);

  const selects: string[] = [];

  if (actividadProgreso) {
    selects.push(`
      SELECT
        id_usuario::bigint AS id_usuario,
        COALESCE(NULLIF(actividad_codigo, ''), 'actividad')::text AS codigo,
        COALESCE(NULLIF(actividad_titulo, ''), 'Actividad MathNova')::text AS titulo,
        COALESCE(NULLIF(mundo, ''), 'MathNova')::text AS mundo,
        COALESCE(NULLIF(tema, ''), 'General')::text AS tema,
        COALESCE(respuestas, '{}'::jsonb) AS respuestas,
        COALESCE(aciertos, 0)::int AS aciertos,
        COALESCE(total_preguntas, 0)::int AS total_preguntas,
        CASE
          WHEN precision IS NULL THEN NULL::float
          ELSE LEAST(100, GREATEST(0, precision))::float
        END AS precision,
        COALESCE(completada, false)::boolean AS completada,
        GREATEST(COALESCE(intentos, 1), 1)::int AS intentos,
        COALESCE(estrellas_obtenidas, 0)::int AS estrellas,
        COALESCE(tiempo_segundos, 0)::int AS tiempo_segundos,
        COALESCE(fecha_ultimo_intento, NOW())::timestamp AS fecha_ultimo_intento
      FROM public.actividad_progreso
    `);
  }

  if (actividadProporcionalidad) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_proporcionalidad",
        codigo: "mathdata-proporcionalidad-inversa",
        titulo: "El Generador de Energía Inversa",
        mundo: "MathData",
        tema: "Proporcionalidad",
        intentosExtra: `COALESCE(intentos_completados, 0) + ${longitudHistorial()}`,
      })
    );
  }

  if (actividadRampas) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_rampas",
        codigo: "mathgeometry-rampas",
        titulo: "Rampas de lanzamiento",
        mundo: "MathGeometry",
        tema: "Pendiente y ecuaciones",
        intentosExtra: `COALESCE(intentos_verificacion, 0) + ${longitudHistorial()}`,
      })
    );
  }

  if (actividadTripulacion) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_tripulacion",
        codigo: "mathdata-tripulacion",
        titulo: "Encuesta de tripulación",
        mundo: "MathData",
        tema: "Tablas y patrones",
        intentosExtra: `COALESCE(intentos_modulo, 0) + ${longitudHistorial()}`,
      })
    );
  }

  if (actividadHolograma) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_holograma",
        codigo: "mathdata-holograma",
        titulo: "Holograma de reportes",
        mundo: "MathData",
        tema: "Gráficas",
        intentosExtra: `
          COALESCE(intentos_tipo_grafica, 0)
          + COALESCE(intentos_pregunta_barra, 0)
          + COALESCE(intentos_pregunta_sector, 0)
          + ${longitudHistorial()}
        `,
      })
    );
  }

  if (actividadSensor) {
    selects.push(
      crearSelectLegacy({
        tabla: "actividad_sensor",
        codigo: "mathdata-sensor-frecuencias",
        titulo: "Sensor de frecuencias",
        mundo: "MathData",
        tema: "Frecuencias",
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

function extraerRespuestasAbiertas(
  respuestas: Record<string, unknown> | null,
  fila: ProgresoActividadDb
) {
  const abiertas: RespuestaAbierta[] = [];

  if (!respuestas || typeof respuestas !== "object") {
    return abiertas;
  }

  const visitar = (valor: unknown, ruta: string, profundidad: number) => {
    if (profundidad > 3 || abiertas.length >= 4) return;

    if (typeof valor === "string") {
      const texto = valor.trim();
      const rutaNormalizada = ruta.toLowerCase();
      const pareceAbierta =
        /explic|texto|justific|razon|razón|argument|coment|reflex|respuesta_abierta/.test(
          rutaNormalizada
        );

      if (pareceAbierta && texto.length >= 3) {
        abiertas.push({
          id_usuario: Number(fila.id_usuario),
          alumno: fila.nombre_completo,
          iniciales: obtenerIniciales(fila.nombre_completo),
          actividad_codigo: fila.codigo,
          actividad_titulo: fila.titulo,
          campo: ruta,
          respuesta: texto.slice(0, 220),
          fecha: fila.fecha_ultimo_intento,
        });
      }

      return;
    }

    if (Array.isArray(valor)) {
      valor.forEach((item, index) => visitar(item, `${ruta}.${index + 1}`, profundidad + 1));
      return;
    }

    if (valor && typeof valor === "object") {
      Object.entries(valor as Record<string, unknown>).forEach(([clave, item]) =>
        visitar(item, ruta ? `${ruta}.${clave}` : clave, profundidad + 1)
      );
    }
  };

  visitar(respuestas, "", 0);

  return abiertas;
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const cteProgreso = await crearCteProgreso();

    const progresoResultado = await pool.query<ProgresoActividadDb>(`
      WITH ${cteProgreso}
      SELECT
        pb.id_usuario,
        r.nombre_completo,
        r.correo,
        pb.codigo,
        pb.titulo,
        pb.mundo,
        pb.tema,
        pb.respuestas,
        pb.aciertos,
        pb.total_preguntas,
        pb.precision,
        pb.completada,
        pb.intentos,
        pb.estrellas,
        pb.tiempo_segundos,
        pb.fecha_ultimo_intento
      FROM progreso_base pb
      INNER JOIN public.registro r
        ON r.id_usuario = pb.id_usuario
      WHERE ${scopeStudent('r')} AND LOWER(COALESCE(r.rol, '')) IN ('estudiante','alumno')
        AND COALESCE(r.estado, true) = true
      ORDER BY pb.fecha_ultimo_intento DESC NULLS LAST;
    `);

    const mapa = new Map<
      string,
      CatalogoActividad & {
        estudiantes: Set<number>;
        estudiantesCompletaron: Set<number>;
        completadas: number;
        intentos: number;
        precisionSuma: number;
        precisionConteo: number;
        estrellas: number;
        tiempoSegundos: number;
        respuestasAbiertas: RespuestaAbierta[];
        ultimaActividad: string | null;
      }
    >();

    catalogoBase.forEach((actividad) => {
      mapa.set(normalizarCodigo(actividad.codigo), {
        ...actividad,
        estudiantes: new Set<number>(),
        estudiantesCompletaron: new Set<number>(),
        completadas: 0,
        intentos: 0,
        precisionSuma: 0,
        precisionConteo: 0,
        estrellas: 0,
        tiempoSegundos: 0,
        respuestasAbiertas: [],
        ultimaActividad: null,
      });
    });

    const estudiantesAlcanzados = new Set<number>();
    const respuestasAbiertasGlobales: RespuestaAbierta[] = [];

    progresoResultado.rows.forEach((fila) => {
      const codigo = normalizarCodigo(fila.codigo);
      const actividadCatalogo =
        mapa.get(codigo) ||
        ({
          codigo,
          titulo: fila.titulo || "Actividad MathNova",
          mundo: normalizarMundo(fila.mundo) as CatalogoActividad["mundo"],
          tema: fila.tema || "General",
          descripcion:
            "Actividad registrada desde el progreso real de los alumnos.",
          dificultad: obtenerDificultad(
            fila.precision === null ? null : Number(fila.precision) / 10,
            Number(fila.intentos || 0)
          ),
          duracion: "Automática",
          color: obtenerColorPorMundo(fila.mundo),
          estudiantes: new Set<number>(),
          estudiantesCompletaron: new Set<number>(),
          completadas: 0,
          intentos: 0,
          precisionSuma: 0,
          precisionConteo: 0,
          estrellas: 0,
          tiempoSegundos: 0,
          respuestasAbiertas: [],
          ultimaActividad: null,
        } as CatalogoActividad & {
          estudiantes: Set<number>;
          estudiantesCompletaron: Set<number>;
          completadas: number;
          intentos: number;
          precisionSuma: number;
          precisionConteo: number;
          estrellas: number;
          tiempoSegundos: number;
          respuestasAbiertas: RespuestaAbierta[];
          ultimaActividad: string | null;
        });

      actividadCatalogo.estudiantes.add(Number(fila.id_usuario));
      estudiantesAlcanzados.add(Number(fila.id_usuario));

      if (fila.completada) {
        actividadCatalogo.estudiantesCompletaron.add(Number(fila.id_usuario));
        actividadCatalogo.completadas += 1;
      }

      actividadCatalogo.intentos += Number(fila.intentos || 0);
      actividadCatalogo.estrellas += Number(fila.estrellas || 0);
      actividadCatalogo.tiempoSegundos += Number(fila.tiempo_segundos || 0);

      if (fila.precision !== null && fila.precision !== undefined) {
        actividadCatalogo.precisionSuma += Number(fila.precision);
        actividadCatalogo.precisionConteo += 1;
      }

      if (
        fila.fecha_ultimo_intento &&
        (!actividadCatalogo.ultimaActividad ||
          new Date(fila.fecha_ultimo_intento) >
            new Date(actividadCatalogo.ultimaActividad))
      ) {
        actividadCatalogo.ultimaActividad = fila.fecha_ultimo_intento;
      }

      const abiertas = extraerRespuestasAbiertas(fila.respuestas, fila);
      actividadCatalogo.respuestasAbiertas.push(...abiertas);
      respuestasAbiertasGlobales.push(...abiertas);

      mapa.set(codigo, actividadCatalogo);
    });

    const actividades = Array.from(mapa.values()).map((actividad, index) => {
      const promedio =
        actividad.precisionConteo > 0
          ? Number((actividad.precisionSuma / actividad.precisionConteo / 10).toFixed(1))
          : null;

      const estado = obtenerEstadoActividad(
        actividad.estudiantes.size,
        promedio,
        actividad.completadas
      );

      return {
        id: index + 1,
        codigo: actividad.codigo,
        titulo: actividad.titulo,
        mundo: normalizarMundo(actividad.mundo),
        tema: actividad.tema,
        descripcion: actividad.descripcion,
        dificultad: actividad.dificultad,
        duracion: actividad.duracion,
        color: actividad.color,
        estudiantes_intentaron: actividad.estudiantes.size,
        estudiantes_completaron: actividad.estudiantesCompletaron.size,
        completadas: actividad.completadas,
        intentos: actividad.intentos,
        promedio,
        estrellas: actividad.estrellas,
        tiempo_total_segundos: actividad.tiempoSegundos,
        respuestas_abiertas: actividad.respuestasAbiertas.length,
        muestras_respuestas: actividad.respuestasAbiertas
          .sort((a, b) => {
            if (!a.fecha) return 1;
            if (!b.fecha) return -1;
            return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
          })
          .slice(0, 5),
        ultima_actividad: actividad.ultimaActividad,
        estado: estado.texto,
        estado_clase: estado.clase,
      };
    });

    actividades.sort((a, b) => {
      if (b.estudiantes_intentaron !== a.estudiantes_intentaron) {
        return b.estudiantes_intentaron - a.estudiantes_intentaron;
      }

      return a.titulo.localeCompare(b.titulo, "es");
    });

    const actividadesConIntentos = actividades.filter(
      (actividad) => actividad.estudiantes_intentaron > 0
    );

    const actividadesConPromedio = actividades.filter(
      (actividad) => actividad.promedio !== null
    );

    const promedioGeneral =
      actividadesConPromedio.length > 0
        ? Number(
            (
              actividadesConPromedio.reduce(
                (suma, actividad) => suma + Number(actividad.promedio),
                0
              ) / actividadesConPromedio.length
            ).toFixed(1)
          )
        : null;

    return res.json({
      ok: true,
      actividades,
      respuestas_abiertas_recientes: respuestasAbiertasGlobales
        .sort((a, b) => {
          if (!a.fecha) return 1;
          if (!b.fecha) return -1;
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        })
        .slice(0, 8),
      resumen: {
        total_actividades: actividades.length,
        actividades_con_intentos: actividadesConIntentos.length,
        actividades_sin_intentos:
          actividades.length - actividadesConIntentos.length,
        estudiantes_alcanzados: estudiantesAlcanzados.size,
        intentos_totales: actividades.reduce(
          (suma, actividad) => suma + actividad.intentos,
          0
        ),
        completadas_totales: actividades.reduce(
          (suma, actividad) => suma + actividad.completadas,
          0
        ),
        respuestas_abiertas: respuestasAbiertasGlobales.length,
        promedio_general: promedioGeneral,
      },
    });
  } catch (error) {
    console.error("Error al obtener actividades docente:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron cargar las actividades del docente.",
    });
  }
});

export default router;
