import type { Request, Response } from "express";

const pool = require("../db");
const pilotService = require("../services/pilotService");

type ProgresoActividadBody = {
  id_usuario?: number | string;
  mundo?: string;
  tema?: string | null;
  actividad_codigo?: string;
  actividad_titulo?: string;
  respuestas?: unknown;
  aciertos?: number | string;
  total_preguntas?: number | string;
  tiempo_segundos?: number | string;
  xp_base?: number | string;
  completada?: boolean;
};

type DbExecutor = {
  query: (
    consulta: string,
    parametros?: unknown[]
  ) => Promise<{
    rows: Record<string, unknown>[];
    rowCount?: number | null;
  }>;
};

type ResumenMetasSemanales = {
  inicio_semana: string;
  fin_semana: string;
  lecciones_completadas: number;
  tiempo_estudio_segundos: number;
  actividades_resueltas: number;
};

type RecompensasMetas = {
  meta_lecciones: boolean;
  meta_tiempo: boolean;
  meta_actividades: boolean;
};

const ZONA_HORARIA = "America/Mexico_City";

const META_LECCIONES = 10;
const META_TIEMPO_SEGUNDOS = 5 * 60 * 60;
const META_ACTIVIDADES = 20;
const RECOMPENSA_META = 100;

const CODIGO_META_LECCIONES = "meta_lecciones";
const CODIGO_META_TIEMPO = "meta_tiempo";
const CODIGO_META_ACTIVIDADES = "meta_actividades";

const convertirEntero = (
  valor: unknown,
  predeterminado = 0
): number => {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return predeterminado;
  }

  return Math.trunc(numero);
};

const calcularEstrellas = (
  aciertos: number,
  totalPreguntas: number
): number => {
  if (!totalPreguntas || totalPreguntas <= 0) return 0;

  const precision = (aciertos / totalPreguntas) * 100;

  if (precision >= 100) return 3;
  if (precision >= 70) return 2;
  if (precision >= 50) return 1;

  return 0;
};

/**
 * Estas tablas permiten conservar cada intento por separado.
 * La tabla actividad_progreso continúa funcionando como resumen
 * acumulado por actividad, mientras actividad_intentos guarda el
 * historial necesario para calcular correctamente cada semana.
 */
const asegurarTablasMetas = async (
  db: DbExecutor
): Promise<void> => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.actividad_intentos (
      id_intento BIGSERIAL PRIMARY KEY,
      id_usuario INTEGER NOT NULL,
      mundo VARCHAR(120) NOT NULL,
      tema VARCHAR(180),
      actividad_codigo VARCHAR(180) NOT NULL,
      actividad_titulo VARCHAR(255) NOT NULL,
      aciertos INTEGER NOT NULL DEFAULT 0,
      total_preguntas INTEGER NOT NULL DEFAULT 0,
      precision NUMERIC(5, 2) NOT NULL DEFAULT 0,
      estrellas_obtenidas INTEGER NOT NULL DEFAULT 0,
      xp_obtenido INTEGER NOT NULL DEFAULT 0,
      completada BOOLEAN NOT NULL DEFAULT FALSE,
      tiempo_segundos INTEGER NOT NULL DEFAULT 0,
      fecha_intento TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS
      idx_actividad_intentos_usuario_fecha
    ON public.actividad_intentos (
      id_usuario,
      fecha_intento DESC
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS
      idx_actividad_intentos_usuario_codigo
    ON public.actividad_intentos (
      id_usuario,
      actividad_codigo
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS public.metas_semanales_recompensas (
      id_recompensa BIGSERIAL PRIMARY KEY,
      id_usuario INTEGER NOT NULL,
      semana_inicio DATE NOT NULL,
      meta_codigo VARCHAR(80) NOT NULL,
      estrellas INTEGER NOT NULL DEFAULT ${RECOMPENSA_META},
      fecha_reclamada TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS
      uq_metas_recompensas_usuario_semana_codigo
    ON public.metas_semanales_recompensas (
      id_usuario,
      semana_inicio,
      meta_codigo
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS
      idx_metas_recompensas_usuario_semana
    ON public.metas_semanales_recompensas (
      id_usuario,
      semana_inicio DESC
    );
  `);
};

const obtenerInicioSemanaActual = async (
  db: DbExecutor
): Promise<string> => {
  const result = await db.query(
    `
    SELECT
      DATE_TRUNC(
        'week',
        NOW() AT TIME ZONE $1
      )::date::text AS inicio_semana;
    `,
    [ZONA_HORARIA]
  );

  return String(result.rows[0]?.inicio_semana ?? "");
};

const consultarMetasSemanales = async (
  db: DbExecutor,
  idUsuario: number,
  inicioSemana?: string
): Promise<ResumenMetasSemanales> => {
  const semanaInicio =
    inicioSemana || (await obtenerInicioSemanaActual(db));

  const result = await db.query(
    `
    WITH intentos_semana AS (
      /*
       * Intentos nuevos registrados de forma individual durante
       * la semana actual.
       */
      SELECT
        actividad_codigo,
        BOOL_OR(completada) AS completada,
        COALESCE(
          SUM(tiempo_segundos),
          0
        )::int AS tiempo_segundos,
        COUNT(*)::int AS cantidad_intentos
      FROM public.actividad_intentos
      WHERE id_usuario = $1
        AND (
          fecha_intento AT TIME ZONE $3
        )::date >= $2::date
        AND (
          fecha_intento AT TIME ZONE $3
        )::date < ($2::date + 7)
      GROUP BY actividad_codigo
    ),
    intentos_guardados AS (
      /*
       * Cantidad y tiempo que ya están representados dentro de
       * actividad_intentos. Esto permite recuperar únicamente la
       * parte antigua de actividad_progreso sin duplicar datos.
       */
      SELECT
        actividad_codigo,
        COUNT(*)::int AS cantidad_intentos,
        COALESCE(
          SUM(tiempo_segundos),
          0
        )::int AS tiempo_segundos
      FROM public.actividad_intentos
      WHERE id_usuario = $1
      GROUP BY actividad_codigo
    ),
    progreso_anterior AS (
      /*
       * Recupera los intentos que ya existían antes de crear la
       * tabla actividad_intentos. Se toma la diferencia entre el
       * resumen acumulado y los intentos individuales guardados.
       */
      SELECT
        progreso.actividad_codigo,
        progreso.completada,

        GREATEST(
          COALESCE(progreso.tiempo_segundos, 0)
          - COALESCE(intentos_guardados.tiempo_segundos, 0),
          0
        )::int AS tiempo_segundos,

        GREATEST(
          COALESCE(progreso.intentos, 1)
          - COALESCE(intentos_guardados.cantidad_intentos, 0),
          0
        )::int AS cantidad_intentos

      FROM public.actividad_progreso AS progreso
      LEFT JOIN intentos_guardados
        ON intentos_guardados.actividad_codigo =
          progreso.actividad_codigo
      WHERE progreso.id_usuario = $1
        AND (
          progreso.fecha_ultimo_intento AT TIME ZONE $3
        )::date >= $2::date
        AND (
          progreso.fecha_ultimo_intento AT TIME ZONE $3
        )::date < ($2::date + 7)
        AND (
          GREATEST(
            COALESCE(progreso.intentos, 1)
            - COALESCE(
                intentos_guardados.cantidad_intentos,
                0
              ),
            0
          ) > 0
          OR
          GREATEST(
            COALESCE(progreso.tiempo_segundos, 0)
            - COALESCE(
                intentos_guardados.tiempo_segundos,
                0
              ),
            0
          ) > 0
        )
    ),
    movimientos_semana AS (
      SELECT
        actividad_codigo,
        completada,
        tiempo_segundos,
        cantidad_intentos
      FROM intentos_semana

      UNION ALL

      SELECT
        actividad_codigo,
        completada,
        tiempo_segundos,
        cantidad_intentos
      FROM progreso_anterior
    )
    SELECT
      $2::date::text AS inicio_semana,
      ($2::date + 6)::date::text AS fin_semana,

      COUNT(DISTINCT regexp_replace(actividad_codigo, '-(refuerzo-)?pda-v1$', '')) FILTER (
        WHERE completada = TRUE
      )::int AS lecciones_completadas,

      COALESCE(
        SUM(tiempo_segundos),
        0
      )::int AS tiempo_estudio_segundos,

      COALESCE(
        SUM(cantidad_intentos),
        0
      )::int AS actividades_resueltas

    FROM movimientos_semana;
    `,
    [idUsuario, semanaInicio, ZONA_HORARIA]
  );

  const fila = result.rows[0] || {};

  return {
    inicio_semana: String(
      fila.inicio_semana || semanaInicio
    ),
    fin_semana: String(fila.fin_semana || semanaInicio),
    lecciones_completadas: Math.max(
      0,
      convertirEntero(fila.lecciones_completadas)
    ),
    tiempo_estudio_segundos: Math.max(
      0,
      convertirEntero(fila.tiempo_estudio_segundos)
    ),
    actividades_resueltas: Math.max(
      0,
      convertirEntero(fila.actividades_resueltas)
    ),
  };
};

const consultarRecompensasMetas = async (
  db: DbExecutor,
  idUsuario: number,
  inicioSemana: string
): Promise<RecompensasMetas> => {
  const result = await db.query(
    `
    SELECT meta_codigo
    FROM public.metas_semanales_recompensas
    WHERE id_usuario = $1
      AND semana_inicio = $2::date;
    `,
    [idUsuario, inicioSemana]
  );

  const codigos = new Set(
    result.rows.map((fila) => String(fila.meta_codigo))
  );

  return {
    meta_lecciones: codigos.has(CODIGO_META_LECCIONES),
    meta_tiempo: codigos.has(CODIGO_META_TIEMPO),
    meta_actividades: codigos.has(CODIGO_META_ACTIVIDADES),
  };
};

/**
 * Inserta únicamente las recompensas que todavía no existen.
 * La restricción UNIQUE evita estrellas duplicadas aunque el usuario
 * recargue la página o la misma petición se ejecute varias veces.
 */
const otorgarRecompensasCumplidas = async (
  db: DbExecutor,
  idUsuario: number,
  metas: ResumenMetasSemanales
): Promise<string[]> => {
  const metasCumplidas: string[] = [];

  if (metas.lecciones_completadas >= META_LECCIONES) {
    metasCumplidas.push(CODIGO_META_LECCIONES);
  }

  if (metas.tiempo_estudio_segundos >= META_TIEMPO_SEGUNDOS) {
    metasCumplidas.push(CODIGO_META_TIEMPO);
  }

  if (metas.actividades_resueltas >= META_ACTIVIDADES) {
    metasCumplidas.push(CODIGO_META_ACTIVIDADES);
  }

  const recompensasNuevas: string[] = [];

  for (const metaCodigo of metasCumplidas) {
    const result = await db.query(
      `
      INSERT INTO public.metas_semanales_recompensas (
        id_usuario,
        semana_inicio,
        meta_codigo,
        estrellas
      )
      VALUES ($1, $2::date, $3, $4)
      ON CONFLICT (
        id_usuario,
        semana_inicio,
        meta_codigo
      )
      DO NOTHING
      RETURNING meta_codigo;
      `,
      [
        idUsuario,
        metas.inicio_semana,
        metaCodigo,
        RECOMPENSA_META,
      ]
    );

    if (result.rows.length > 0) {
      recompensasNuevas.push(metaCodigo);
    }
  }

  return recompensasNuevas;
};

const calcularPorcentajeMeta = (
  actual: number,
  objetivo: number
): number => {
  if (objetivo <= 0) return 0;

  return Math.max(
    0,
    Math.min(100, Math.round((actual / objetivo) * 100))
  );
};

const construirRespuestaMetas = (
  metas: ResumenMetasSemanales,
  recompensas: RecompensasMetas
) => ({
  inicio_semana: metas.inicio_semana,
  fin_semana: metas.fin_semana,

  lecciones_completadas: metas.lecciones_completadas,
  tiempo_estudio_segundos: metas.tiempo_estudio_segundos,
  tiempo_estudio_minutos: Math.floor(
    metas.tiempo_estudio_segundos / 60
  ),
  actividades_resueltas: metas.actividades_resueltas,

  meta_lecciones_reclamada: recompensas.meta_lecciones,
  meta_tiempo_reclamada: recompensas.meta_tiempo,
  meta_actividades_reclamada: recompensas.meta_actividades,

  lecciones: {
    codigo: CODIGO_META_LECCIONES,
    actual: metas.lecciones_completadas,
    objetivo: META_LECCIONES,
    porcentaje: calcularPorcentajeMeta(
      metas.lecciones_completadas,
      META_LECCIONES
    ),
    completada: metas.lecciones_completadas >= META_LECCIONES,
    recompensa_estrellas: RECOMPENSA_META,
    recompensa_otorgada: recompensas.meta_lecciones,
  },

  tiempo: {
    codigo: CODIGO_META_TIEMPO,
    actual: metas.tiempo_estudio_segundos,
    objetivo: META_TIEMPO_SEGUNDOS,
    porcentaje: calcularPorcentajeMeta(
      metas.tiempo_estudio_segundos,
      META_TIEMPO_SEGUNDOS
    ),
    completada:
      metas.tiempo_estudio_segundos >= META_TIEMPO_SEGUNDOS,
    recompensa_estrellas: RECOMPENSA_META,
    recompensa_otorgada: recompensas.meta_tiempo,
  },

  actividades: {
    codigo: CODIGO_META_ACTIVIDADES,
    actual: metas.actividades_resueltas,
    objetivo: META_ACTIVIDADES,
    porcentaje: calcularPorcentajeMeta(
      metas.actividades_resueltas,
      META_ACTIVIDADES
    ),
    completada: metas.actividades_resueltas >= META_ACTIVIDADES,
    recompensa_estrellas: RECOMPENSA_META,
    recompensa_otorgada: recompensas.meta_actividades,
  },
});

export const guardarProgresoActividad = async (
  req: Request<Record<string, never>, unknown, ProgresoActividadBody>,
  res: Response
): Promise<Response> => {
  const client = await pool.connect();

  try {
    let piloto: any = null;
    const pilotCode=require("../services/aulaService").codigo(req.body.actividad_codigo);
    if (pilotService.catalog[pilotCode]) {
      req.body.actividad_codigo=pilotCode;
      try { piloto = pilotService.prepare(req.body, "cierre"); }
      catch (e: any) { return res.status(e.status || 400).json({ok:false,mensaje:e.message}); }
      req.body.aciertos=piloto.evaluation.aciertos;req.body.total_preguntas=piloto.evaluation.total;
      req.body.xp_base=piloto.c.xp;req.body.completada=piloto.evaluation.completada;
    }
    const {
      id_usuario,
      mundo,
      tema,
      actividad_codigo,
      actividad_titulo,
      respuestas,
      aciertos,
      total_preguntas,
      tiempo_segundos,
      xp_base,
      completada: completadaRecibida,
    } = req.body;

    const idUsuarioNum = Number(id_usuario);
    const aciertosNum = Math.max(0, Number(aciertos || 0));
    const totalPreguntasNum = Math.max(
      0,
      Number(total_preguntas || 0)
    );
    const tiempoSegundosNum = Math.max(
      0,
      Number(tiempo_segundos || 0)
    );
    const xpBaseNum = actividad_codigo?.endsWith("-refuerzo-pda-v1") ? 0 : Math.max(0, Number(xp_base || 50));

    if (
      !Number.isInteger(idUsuarioNum) ||
      idUsuarioNum <= 0 ||
      !mundo?.trim() ||
      !actividad_codigo?.trim() ||
      !actividad_titulo?.trim()
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan datos obligatorios para guardar el progreso.",
      });
    }

    const precision =
      totalPreguntasNum > 0
        ? Math.min(
            100,
            Number(
              ((aciertosNum / totalPreguntasNum) * 100).toFixed(2)
            )
          )
        : 0;

    const estrellas = actividad_codigo.endsWith("-refuerzo-pda-v1") ? 0 : calcularEstrellas(
      aciertosNum,
      totalPreguntasNum
    );

    const completada = actividad_codigo.endsWith("-refuerzo-pda-v1") ? false :
      typeof completadaRecibida === "boolean"
        ? completadaRecibida
        : totalPreguntasNum > 0;

    const xpObtenido = Math.round(
      (xpBaseNum * precision) / 100
    );

    await client.query("BEGIN");
    if (piloto) {
      const registrado=await pilotService.begin(client,idUsuarioNum,piloto);
      if(registrado.duplicate) { await client.query("COMMIT");return res.status(200).json(registrado.duplicate.recibo); }
    }
    await asegurarTablasMetas(client);

    // Conserva la evidencia previa incluso si se inicia desde otro navegador.
    let evidenceForSave = respuestas;
    const evidence = respuestas as Record<string, unknown> | undefined;
    const latest = evidence?.latest_attempt as Record<string, unknown> | undefined;
    const attemptId = latest?.attemptId;
    if (actividad_codigo.endsWith("-refuerzo-pda-v1") && typeof attemptId === "string" && /^[a-zA-Z0-9-]{16,80}$/.test(attemptId)) {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${idUsuarioNum}:${actividad_codigo.trim()}`]);
      const prior = await client.query(`SELECT * FROM public.actividad_progreso
        WHERE id_usuario=$1 AND actividad_codigo=$2 FOR UPDATE`,
        [idUsuarioNum, actividad_codigo.trim()]);
      const previous = prior.rows[0]?.respuestas as Record<string, unknown> | undefined;
      const previousHistory = Array.isArray(previous?.attempts) ? previous.attempts as Record<string, unknown>[] : [];
      const previousLatest = previous?.latest_attempt as Record<string, unknown> | undefined;
      if (previousLatest?.attemptId === attemptId || previousHistory.some(a => a.attemptId === attemptId)) {
        await client.query("COMMIT");
        return res.json({ ok: true, mensaje: "Evidencia ya registrada.", progreso: prior.rows[0] });
      }
      const previousNumber = Number(previousLatest?.attemptNumber || 0);
      const current = { ...latest, attemptId, attemptNumber: Math.max(previousNumber + 1, Number(latest?.attemptNumber) || 1), assisted: Boolean(previousLatest || latest?.assisted) };
      const incomingHistory = Array.isArray(evidence?.attempts) ? evidence.attempts as Record<string, unknown>[] : [];
      const merged = [...previousHistory, ...incomingHistory.filter(a => a.attemptId !== attemptId), current];
      const unique = merged.filter((a, index, all) => !a.attemptId || all.findIndex(b => b.attemptId === a.attemptId) === index);
      const first = previous?.first_attempt ?? evidence?.first_attempt ?? current;
      const firstId = (first as Record<string, unknown>)?.attemptId;
      const history = [first, ...unique.filter(a => a.attemptId !== firstId).slice(-9)];
      evidenceForSave = { ...evidence, first_attempt: first, latest_attempt: current, attempts: history, attempt_count: current.attemptNumber, assistance_after_feedback: current.assisted };
    }

    /**
     * Primero registramos el intento individual. Esta fila es la que
     * permite separar correctamente lo hecho en cada semana.
     */
    await client.query(
      `
      INSERT INTO public.actividad_intentos (
        id_usuario,
        mundo,
        tema,
        actividad_codigo,
        actividad_titulo,
        aciertos,
        total_preguntas,
        precision,
        estrellas_obtenidas,
        xp_obtenido,
        completada,
        tiempo_segundos,
        fecha_intento
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, NOW()
      );
      `,
      [
        idUsuarioNum,
        mundo.trim(),
        tema?.trim() || null,
        actividad_codigo.trim(),
        actividad_titulo.trim(),
        aciertosNum,
        totalPreguntasNum,
        precision,
        estrellas,
        xpObtenido,
        completada,
        tiempoSegundosNum,
      ]
    );

    /**
     * actividad_progreso se mantiene como resumen acumulado por
     * actividad, por lo que el resto de MathNova continúa funcionando.
     */
    const result = await client.query(
      `
      INSERT INTO public.actividad_progreso AS progreso_actual (
        id_usuario,
        mundo,
        tema,
        actividad_codigo,
        actividad_titulo,
        respuestas,
        aciertos,
        total_preguntas,
        precision,
        estrellas_obtenidas,
        xp_obtenido,
        completada,
        tiempo_segundos,
        intentos,
        fecha_ultimo_intento
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6::jsonb, $7, $8, $9, $10,
        $11, $12, $13, 1, NOW()
      )
      ON CONFLICT (id_usuario, actividad_codigo)
      DO UPDATE SET
        mundo = EXCLUDED.mundo,
        tema = EXCLUDED.tema,
        actividad_titulo = EXCLUDED.actividad_titulo,

        respuestas = CASE
          WHEN (EXCLUDED.respuestas->'mission_expansion'->>'version' = 'mission-v2' AND COALESCE(progreso_actual.respuestas->'mission_expansion'->>'version', '') <> 'mission-v2') OR EXCLUDED.actividad_codigo LIKE '%-refuerzo-pda-v1' OR EXCLUDED.precision >= COALESCE(
            progreso_actual.precision,
            0
          )
          THEN CASE WHEN EXCLUDED.respuestas->'mission_expansion'->>'version' = 'mission-v2'
            THEN EXCLUDED.respuestas || CASE
              WHEN COALESCE(progreso_actual.respuestas->'mission_expansion'->>'version', '') <> 'mission-v2'
              THEN jsonb_build_object('previous_mission', jsonb_build_object(
                'respuestas', progreso_actual.respuestas,
                'aciertos', progreso_actual.aciertos,
                'total_preguntas', progreso_actual.total_preguntas,
                'precision', progreso_actual.precision,
                'completada', progreso_actual.completada))
              WHEN progreso_actual.respuestas ? 'previous_mission'
              THEN jsonb_build_object('previous_mission', progreso_actual.respuestas->'previous_mission')
              ELSE '{}'::jsonb END
            ELSE EXCLUDED.respuestas END
          ELSE progreso_actual.respuestas
        END,

        aciertos = CASE
          WHEN (EXCLUDED.respuestas->'mission_expansion'->>'version' = 'mission-v2' AND COALESCE(progreso_actual.respuestas->'mission_expansion'->>'version', '') <> 'mission-v2') OR EXCLUDED.actividad_codigo LIKE '%-refuerzo-pda-v1' OR EXCLUDED.precision >= COALESCE(
            progreso_actual.precision,
            0
          )
          THEN EXCLUDED.aciertos
          ELSE progreso_actual.aciertos
        END,

        total_preguntas = CASE
          WHEN (EXCLUDED.respuestas->'mission_expansion'->>'version' = 'mission-v2' AND COALESCE(progreso_actual.respuestas->'mission_expansion'->>'version', '') <> 'mission-v2') OR EXCLUDED.actividad_codigo LIKE '%-refuerzo-pda-v1' OR EXCLUDED.precision >= COALESCE(
            progreso_actual.precision,
            0
          )
          THEN EXCLUDED.total_preguntas
          ELSE progreso_actual.total_preguntas
        END,

        precision = CASE WHEN (EXCLUDED.respuestas->'mission_expansion'->>'version' = 'mission-v2' AND COALESCE(progreso_actual.respuestas->'mission_expansion'->>'version', '') <> 'mission-v2') OR EXCLUDED.actividad_codigo LIKE '%-refuerzo-pda-v1' THEN EXCLUDED.precision ELSE GREATEST(
          COALESCE(progreso_actual.precision, 0),
          EXCLUDED.precision
        ) END,

        estrellas_obtenidas = GREATEST(
          COALESCE(progreso_actual.estrellas_obtenidas, 0),
          EXCLUDED.estrellas_obtenidas
        ),

        xp_obtenido = GREATEST(
          COALESCE(progreso_actual.xp_obtenido, 0),
          EXCLUDED.xp_obtenido
        ),

        completada = CASE WHEN (EXCLUDED.respuestas->'mission_expansion'->>'version' = 'mission-v2' AND COALESCE(progreso_actual.respuestas->'mission_expansion'->>'version', '') <> 'mission-v2') THEN EXCLUDED.completada ELSE
          COALESCE(progreso_actual.completada, FALSE)
          OR EXCLUDED.completada END,

        intentos =
          COALESCE(progreso_actual.intentos, 0) + 1,

        tiempo_segundos =
          COALESCE(progreso_actual.tiempo_segundos, 0)
          + EXCLUDED.tiempo_segundos,

        fecha_ultimo_intento = NOW()

      RETURNING *;
      `,
      [
        idUsuarioNum,
        mundo.trim(),
        tema?.trim() || null,
        actividad_codigo.trim(),
        actividad_titulo.trim(),
        JSON.stringify(evidenceForSave ?? {}),
        aciertosNum,
        totalPreguntasNum,
        precision,
        estrellas,
        xpObtenido,
        completada,
        tiempoSegundosNum,
      ]
    );

    const metasSemanales = await consultarMetasSemanales(
      client,
      idUsuarioNum
    );

    const recompensasNuevas = await otorgarRecompensasCumplidas(
      client,
      idUsuarioNum,
      metasSemanales
    );

    const recompensas = await consultarRecompensasMetas(
      client,
      idUsuarioNum,
      metasSemanales.inicio_semana
    );

    const receipt={ok:true,mensaje:"Progreso guardado correctamente.",progreso:result.rows[0],metas_semanales:construirRespuestaMetas(metasSemanales,recompensas),recompensas_nuevas:recompensasNuevas,...(piloto?{intento_piloto:{id:piloto.p.id,evaluacion:piloto.evaluation,tiempo_segundos:tiempoSegundosNum,xp_obtenido:xpObtenido,estrellas_obtenidas:estrellas}}:{})};
    if(piloto)await client.query('UPDATE public.mathnova_intentos_piloto SET recibo=$1::jsonb WHERE id=$2',[JSON.stringify(receipt),piloto.p.id]);
    await client.query("COMMIT");

    console.log("PROGRESO GUARDADO:", {
      id_usuario: idUsuarioNum,
      actividad_codigo,
      precision,
      estrellas,
      completada,
      recompensas_nuevas: recompensasNuevas,
    });

    return res.status(200).json(receipt);
  } catch (error: unknown) {
    await client.query("ROLLBACK");

    const detalle =
      error instanceof Error ? error.message : String(error);

    console.error("Error al guardar progreso:", error);

    return res.status((error as {status?:number})?.status || 500).json({
      ok: false,
      mensaje: (error as {status?:number;message?:string})?.status ? (error as Error).message : "Error al guardar progreso de la actividad.",
      detalle:
        process.env.NODE_ENV === "development"
          ? detalle
          : undefined,
    });
  } finally {
    client.release();
  }
};

export const obtenerProgresoAlumno = async (
  req: Request<{ id_usuario: string }>,
  res: Response
): Promise<Response> => {
  try {
    const idUsuario = Number(req.params.id_usuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El id del usuario no es válido.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id_progreso,
        id_usuario,
        mundo,
        tema,
        actividad_codigo,
        actividad_titulo,
        respuestas,
        aciertos,
        total_preguntas,
        precision,
        estrellas_obtenidas,
        xp_obtenido,
        completada,
        tiempo_segundos,
        intentos,
        fecha_ultimo_intento
      FROM public.actividad_progreso
      WHERE id_usuario = $1
      ORDER BY fecha_ultimo_intento DESC;
      `,
      [idUsuario]
    );

    return res.json({
      ok: true,
      total: result.rowCount ?? result.rows.length,
      progreso: result.rows,
    });
  } catch (error: unknown) {
    console.error("Error al obtener progreso:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener progreso del alumno.",
    });
  }
};

export const obtenerResumenAlumno = async (
  req: Request<{ id_usuario: string }>,
  res: Response
): Promise<Response> => {
  try {
    const idUsuario = Number(req.params.id_usuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El id del usuario no es válido.",
      });
    }

    await asegurarTablasMetas(pool);

    /*
     * Antes de calcular las estrellas totales, revisamos si el
     * alumno ya cumplió alguna meta semanal. De esta forma, abrir
     * el perfil también reclama las recompensas pendientes.
     */
    const metasSemanales = await consultarMetasSemanales(
      pool,
      idUsuario
    );

    await otorgarRecompensasCumplidas(
      pool,
      idUsuario,
      metasSemanales
    );

    const resumenResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(estrellas_obtenidas),
          0
        )::int AS estrellas_actividades,

        COALESCE(
          SUM(xp_obtenido),
          0
        )::int AS xp_total,

        COUNT(*) FILTER (
          WHERE completada = TRUE AND actividad_codigo NOT LIKE '%-pda-v1'
        )::int AS actividades_completadas,

        COUNT(*) FILTER (WHERE actividad_codigo NOT LIKE '%-pda-v1')::int AS actividades_intentadas,

        COALESCE(
          ROUND(AVG(precision) FILTER (WHERE actividad_codigo NOT LIKE '%-pda-v1'), 2),
          0
        )::float AS precision_promedio,

        COALESCE(
          SUM(tiempo_segundos),
          0
        )::int AS tiempo_total_segundos

      FROM public.actividad_progreso
      WHERE id_usuario = $1;
      `,
      [idUsuario]
    );

    const recompensasResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(estrellas), 0)::int AS estrellas_metas
      FROM public.metas_semanales_recompensas
      WHERE id_usuario = $1;
      `,
      [idUsuario]
    );

    const mundosResult = await pool.query(
      `
      SELECT
        mundo,

        COUNT(*) FILTER (
          WHERE completada = TRUE AND actividad_codigo NOT LIKE '%-pda-v1'
        )::int AS completadas,

        COUNT(*) FILTER (WHERE actividad_codigo NOT LIKE '%-pda-v1')::int AS intentadas,

        COALESCE(
          SUM(estrellas_obtenidas),
          0
        )::int AS estrellas,

        COALESCE(
          SUM(xp_obtenido),
          0
        )::int AS xp,

        COALESCE(
          ROUND(AVG(precision) FILTER (WHERE actividad_codigo NOT LIKE '%-pda-v1'), 2),
          0
        )::float AS precision

      FROM public.actividad_progreso
      WHERE id_usuario = $1
      GROUP BY mundo
      ORDER BY mundo;
      `,
      [idUsuario]
    );

    const rachaResult = await pool.query(
      `
      SELECT COALESCE(
        (
          WITH dias AS (
            SELECT DISTINCT
              (
                fecha_intento AT TIME ZONE $2
              )::date AS dia
            FROM public.actividad_intentos
            WHERE id_usuario = $1
              AND completada = TRUE

            UNION

            /*
             * Conserva el último día de los registros antiguos que
             * existían antes de crear actividad_intentos.
             */
            SELECT DISTINCT
              fecha_ultimo_intento::date AS dia
            FROM public.actividad_progreso
            WHERE id_usuario = $1
              AND completada = TRUE
          ),
          ordenados AS (
            SELECT
              dia,
              dia - (
                ROW_NUMBER() OVER (ORDER BY dia)
              )::int AS grupo
            FROM dias
          ),
          ultimo AS (
            SELECT dia, grupo
            FROM ordenados
            ORDER BY dia DESC
            LIMIT 1
          )
          SELECT
            CASE
              WHEN ultimo.dia >=
                (NOW() AT TIME ZONE $2)::date - 1
              THEN (
                SELECT COUNT(*)
                FROM ordenados
                WHERE grupo = ultimo.grupo
              )
              ELSE 0
            END
          FROM ultimo
        ),
        0
      )::int AS racha_actual;
      `,
      [idUsuario, ZONA_HORARIA]
    );

    const resumenBase = resumenResult.rows[0] || {};

    const estrellasActividades = Number(
      resumenBase.estrellas_actividades || 0
    );

    const estrellasMetas = Number(
      recompensasResult.rows[0]?.estrellas_metas || 0
    );

    const estrellasTotales =
      estrellasActividades + estrellasMetas;

    const tiempoTotalSegundos = Number(
      resumenBase.tiempo_total_segundos || 0
    );

    const resumen = {
      estrellas_totales: estrellasTotales,
      estrellas_ganadas: estrellasTotales,
      estrellas_actividades: estrellasActividades,
      estrellas_metas: estrellasMetas,

      xp_total: Number(resumenBase.xp_total || 0),

      actividades_completadas: Number(
        resumenBase.actividades_completadas || 0
      ),

      lecciones_completadas: Number(
        resumenBase.actividades_completadas || 0
      ),

      actividades_intentadas: Number(
        resumenBase.actividades_intentadas || 0
      ),

      precision_promedio: Number(
        resumenBase.precision_promedio || 0
      ),

      promedio_general: Number(
        resumenBase.precision_promedio || 0
      ),

      progreso_general: Number(
        resumenBase.precision_promedio || 0
      ),

      tiempo_total_segundos: tiempoTotalSegundos,
      tiempo_estudio_segundos: tiempoTotalSegundos,
      tiempo_estudio_minutos: Math.floor(
        tiempoTotalSegundos / 60
      ),

      racha_actual: Number(
        rachaResult.rows[0]?.racha_actual || 0
      ),
    };

    return res.json({
      ok: true,
      resumen,
      mundos: mundosResult.rows,
    });
  } catch (error: unknown) {
    console.error(
      "Error al obtener resumen del alumno:",
      error
    );

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener resumen del alumno.",
    });
  }
};

/**
 * GET /api/progreso/metas-semanales/:id_usuario
 */
export const obtenerMetasSemanales = async (
  req: Request<{ id_usuario: string }>,
  res: Response
): Promise<Response> => {
  const client = await pool.connect();

  try {
    const idUsuario = Number(req.params.id_usuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "El id del usuario no es válido.",
      });
    }

    await client.query("BEGIN");
    await asegurarTablasMetas(client);

    const metas = await consultarMetasSemanales(
      client,
      idUsuario
    );

    /**
     * Esta sincronización es idempotente y recupera cualquier premio
     * pendiente en caso de que una petición anterior se interrumpiera.
     */
    const recompensasNuevas = await otorgarRecompensasCumplidas(
      client,
      idUsuario,
      metas
    );

    const recompensas = await consultarRecompensasMetas(
      client,
      idUsuario,
      metas.inicio_semana
    );

    await client.query("COMMIT");

    return res.json({
      ok: true,
      metas: construirRespuestaMetas(metas, recompensas),
      recompensas_nuevas: recompensasNuevas,
    });
  } catch (error: unknown) {
    await client.query("ROLLBACK");

    console.error(
      "Error al obtener las metas semanales:",
      error
    );

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener las metas semanales.",
    });
  } finally {
    client.release();
  }
};

export const obtenerProgresoActividad = async (
  req: Request<{
    id_usuario: string;
    actividad_codigo: string;
  }>,
  res: Response
): Promise<Response> => {
  try {
    const idUsuario = Number(req.params.id_usuario);
    const { actividad_codigo } = req.params;

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0 ||
      !actividad_codigo?.trim()
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: "Los datos de la actividad no son válidos.",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM public.actividad_progreso
      WHERE id_usuario = $1
        AND actividad_codigo = $2
      LIMIT 1;
      `,
      [idUsuario, actividad_codigo.trim()]
    );

    return res.json({
      ok: true,
      progreso: result.rows[0] || null,
    });
  } catch (error: unknown) {
    console.error(
      "Error al obtener progreso de actividad:",
      error
    );

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener progreso de la actividad.",
    });
  }
};
