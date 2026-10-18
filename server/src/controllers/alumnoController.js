const pool = require("../db");

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const mundoNombre = {
  MathNumbers: "Planeta Números",
  MathGeometry: "Mundo Geometría",
  MathData: "Galaxia Datos"
};

const columnasProgresoRequeridas = [
  "usuario_id",
  "mundo",
  "actividad_slug",
  "actividad_nombre",
  "puntaje",
  "estrellas",
  "completada",
  "tiempo_segundos",
  "respuestas_correctas",
  "total_preguntas",
  "fecha_inicio",
  "fecha_completado"
];

const crearEstadisticasVacias = () => ({
  leccionesCompletadas: 0,
  estrellasGanadas: 0,
  rachaActual: 0,
  promedioGeneral: 0,
  progresoSemanal: diasSemana.map((dia) => ({
    dia,
    lecciones: 0
  })),
  rendimientoPorTema: [
    { tema: "MathNumbers", promedio: 0 },
    { tema: "MathGeometry", promedio: 0 },
    { tema: "MathData", promedio: 0 }
  ],
  dominioPorMundo: [
    { mundo: "Planeta Números", promedio: 0 },
    { mundo: "Mundo Geometría", promedio: 0 },
    { mundo: "Galaxia Datos", promedio: 0 }
  ],
  tiempoEstudio: {
    minutos: 0,
    actividadesCompletas: 0,
    semanal: diasSemana.map((dia) => ({
      dia,
      minutos: 0
    }))
  }
});

const obtenerUsuarioAutenticado = (req) => {
  const usuario = req.usuario || req.user;
  const usuarioId = usuario?.id_usuario || usuario?.id || usuario?.usuario_id;

  if (!usuario || !usuarioId) {
    return null;
  }

  return {
    ...usuario,
    id_usuario: usuarioId
  };
};

const existeTablaProgreso = async () => {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'progreso_alumno'
    ) AS existe`
  );

  return Boolean(result.rows[0]?.existe);
};

const tablaProgresoLista = async () => {
  const existe = await existeTablaProgreso();

  if (!existe) {
    return false;
  }

  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
     AND table_name = 'progreso_alumno'`
  );

  const columnas = result.rows.map((row) => row.column_name);

  return columnasProgresoRequeridas.every((columna) =>
    columnas.includes(columna)
  );
};

const obtenerInicioSemana = () => {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diferencia = dia === 0 ? -6 : 1 - dia;

  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() + diferencia);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 7);

  return { inicio, fin };
};

const fechaKey = (fecha) => {
  if (!fecha) return "";

  const d = new Date(fecha);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  return d.toISOString().slice(0, 10);
};

const calcularRacha = (fechas) => {
  if (!fechas || fechas.length === 0) return 0;

  const dias = new Set(
    fechas
      .map((item) => fechaKey(item.dia))
      .filter((dia) => dia !== "")
  );

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);

  const hoyKey = fechaKey(hoy);
  const ayerKey = fechaKey(ayer);

  let inicio = null;

  if (dias.has(hoyKey)) {
    inicio = hoy;
  } else if (dias.has(ayerKey)) {
    inicio = ayer;
  } else {
    return 0;
  }

  let racha = 0;
  const cursor = new Date(inicio);

  while (dias.has(fechaKey(cursor))) {
    racha += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return racha;
};

const obtenerResumenAlumno = async (usuarioId) => {
  const resumenResult = await pool.query(
    `SELECT
      COUNT(*) FILTER (WHERE completada = true)::int AS lecciones_completadas,
      COALESCE(SUM(estrellas), 0)::int AS estrellas_ganadas,
      COALESCE(ROUND(AVG(puntaje) FILTER (WHERE completada = true)), 0)::int AS promedio_general,
      COALESCE(ROUND(SUM(tiempo_segundos) / 60.0), 0)::int AS minutos
     FROM public.progreso_alumno
     WHERE usuario_id = $1`,
    [usuarioId]
  );

  return resumenResult.rows[0] || {};
};

const obtenerPerfilAlumno = async (req, res) => {
  try {
    const usuario = obtenerUsuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: "No hay usuario autenticado"
      });
    }

    const progresoListo = await tablaProgresoLista();

    let resumen = crearEstadisticasVacias();
    let actividadesRecientes = [];

    if (progresoListo) {
      const resumenDB = await obtenerResumenAlumno(usuario.id_usuario);

      const fechasResult = await pool.query(
        `SELECT DISTINCT DATE(fecha_completado) AS dia
         FROM public.progreso_alumno
         WHERE usuario_id = $1
         AND completada = true
         AND fecha_completado IS NOT NULL
         ORDER BY dia DESC`,
        [usuario.id_usuario]
      );

      const recientesResult = await pool.query(
        `SELECT mundo, actividad_slug, actividad_nombre, puntaje, estrellas, completada, fecha_completado
         FROM public.progreso_alumno
         WHERE usuario_id = $1
         ORDER BY COALESCE(fecha_completado, fecha_inicio) DESC
         LIMIT 5`,
        [usuario.id_usuario]
      );

      resumen = {
        ...resumen,
        leccionesCompletadas: Number(resumenDB.lecciones_completadas || 0),
        estrellasGanadas: Number(resumenDB.estrellas_ganadas || 0),
        promedioGeneral: Number(resumenDB.promedio_general || 0),
        rachaActual: calcularRacha(fechasResult.rows),
        tiempoEstudio: {
          ...resumen.tiempoEstudio,
          minutos: Number(resumenDB.minutos || 0),
          actividadesCompletas: Number(resumenDB.lecciones_completadas || 0)
        }
      };

      actividadesRecientes = recientesResult.rows.map((item) => ({
        mundo: item.mundo,
        actividadSlug: item.actividad_slug,
        actividadNombre: item.actividad_nombre,
        puntaje: Number(item.puntaje || 0),
        estrellas: Number(item.estrellas || 0),
        completada: Boolean(item.completada),
        fechaCompletado: item.fecha_completado
      }));
    }

    const evolucion = await require('../services/seguimientoService').perfil(usuario);
    return res.json({
      ok: true,
      perfil: {
        id: usuario.id_usuario,
        id_usuario: usuario.id_usuario,
        grado: usuario.grado,
        escuela: usuario.escuela,
        fecha_registro: usuario.fecha_registro,
        miembro_desde: usuario.fecha_registro,
        avatar_url: evolucion.perfil.avatar_url,
        nivel: evolucion.perfil.nivel,
        titulo: `Evolución ${evolucion.perfil.etapa}`,
        nombreCompleto: usuario.nombre_completo,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        usuario: usuario.usuario,
        rol: usuario.rol,
        estado: usuario.estado
      },
      resumen,
      actividadesRecientes
    });
  } catch (error) {
    console.error("Error al obtener perfil del alumno:", error);

    return res.status(500).json({
      ok: false,
      mensaje: error.message || "No se pudo cargar el perfil del alumno"
    });
  }
};

const obtenerEstadisticasAlumno = async (req, res) => {
  try {
    const usuario = obtenerUsuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: "No hay usuario autenticado"
      });
    }

    const progresoListo = await tablaProgresoLista();

    if (!progresoListo) {
      return res.json({
        ok: true,
        estadisticas: crearEstadisticasVacias()
      });
    }

    const { inicio, fin } = obtenerInicioSemana();

    const resumen = await obtenerResumenAlumno(usuario.id_usuario);

    const semanalResult = await pool.query(
      `SELECT DATE(fecha_completado) AS dia, COUNT(*)::int AS lecciones
       FROM public.progreso_alumno
       WHERE usuario_id = $1
       AND completada = true
       AND fecha_completado >= $2
       AND fecha_completado < $3
       GROUP BY DATE(fecha_completado)
       ORDER BY dia`,
      [usuario.id_usuario, inicio, fin]
    );

    const tiempoSemanalResult = await pool.query(
      `SELECT DATE(fecha_completado) AS dia, COALESCE(ROUND(SUM(tiempo_segundos) / 60.0), 0)::int AS minutos
       FROM public.progreso_alumno
       WHERE usuario_id = $1
       AND completada = true
       AND fecha_completado >= $2
       AND fecha_completado < $3
       GROUP BY DATE(fecha_completado)
       ORDER BY dia`,
      [usuario.id_usuario, inicio, fin]
    );

    const rendimientoResult = await pool.query(
      `SELECT mundo, COALESCE(ROUND(AVG(puntaje)), 0)::int AS promedio
       FROM public.progreso_alumno
       WHERE usuario_id = $1
       AND completada = true
       GROUP BY mundo`,
      [usuario.id_usuario]
    );

    const fechasResult = await pool.query(
      `SELECT DISTINCT DATE(fecha_completado) AS dia
       FROM public.progreso_alumno
       WHERE usuario_id = $1
       AND completada = true
       AND fecha_completado IS NOT NULL
       ORDER BY dia DESC`,
      [usuario.id_usuario]
    );

    const base = crearEstadisticasVacias();

    const progresoSemanal = base.progresoSemanal.map((item, index) => {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + index);

      const encontrado = semanalResult.rows.find(
        (row) => fechaKey(row.dia) === fechaKey(fecha)
      );

      return {
        dia: item.dia,
        lecciones: encontrado ? Number(encontrado.lecciones || 0) : 0
      };
    });

    const tiempoSemanal = base.tiempoEstudio.semanal.map((item, index) => {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + index);

      const encontrado = tiempoSemanalResult.rows.find(
        (row) => fechaKey(row.dia) === fechaKey(fecha)
      );

      return {
        dia: item.dia,
        minutos: encontrado ? Number(encontrado.minutos || 0) : 0
      };
    });

    const rendimientoPorTema = base.rendimientoPorTema.map((item) => {
      const encontrado = rendimientoResult.rows.find(
        (row) => row.mundo === item.tema
      );

      return {
        tema: item.tema,
        promedio: encontrado ? Number(encontrado.promedio || 0) : 0
      };
    });

    const dominioPorMundo = rendimientoPorTema.map((item) => ({
      mundo: mundoNombre[item.tema] || item.tema,
      promedio: item.promedio
    }));

    return res.json({
      ok: true,
      estadisticas: {
        leccionesCompletadas: Number(resumen.lecciones_completadas || 0),
        estrellasGanadas: Number(resumen.estrellas_ganadas || 0),
        rachaActual: calcularRacha(fechasResult.rows),
        promedioGeneral: Number(resumen.promedio_general || 0),
        progresoSemanal,
        rendimientoPorTema,
        dominioPorMundo,
        tiempoEstudio: {
          minutos: Number(resumen.minutos || 0),
          actividadesCompletas: Number(resumen.lecciones_completadas || 0),
          semanal: tiempoSemanal
        }
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del alumno:", error);

    return res.status(500).json({
      ok: false,
      mensaje: error.message || "No se pudieron cargar las estadísticas del alumno"
    });
  }
};

const guardarProgresoAlumno = async (req, res) => {
  try {
    const usuario = obtenerUsuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: "No hay usuario autenticado"
      });
    }

    const progresoListo = await tablaProgresoLista();

    if (!progresoListo) {
      return res.status(500).json({
        ok: false,
        mensaje: "La tabla progreso_alumno no existe o está incompleta"
      });
    }

    const {
      mundo,
      actividadSlug,
      actividadNombre,
      puntaje,
      estrellas,
      completada,
      tiempoSegundos,
      respuestasCorrectas,
      totalPreguntas
    } = req.body;

    if (!mundo || !actividadSlug || !actividadNombre) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan datos de la actividad"
      });
    }

    const result = await pool.query(
      `INSERT INTO public.progreso_alumno (
        usuario_id,
        mundo,
        actividad_slug,
        actividad_nombre,
        puntaje,
        estrellas,
        completada,
        tiempo_segundos,
        respuestas_correctas,
        total_preguntas,
        fecha_completado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CASE WHEN $7 = true THEN NOW() ELSE NULL END)
      ON CONFLICT (usuario_id, actividad_slug)
      DO UPDATE SET
        mundo = EXCLUDED.mundo,
        actividad_nombre = EXCLUDED.actividad_nombre,
        puntaje = GREATEST(public.progreso_alumno.puntaje, EXCLUDED.puntaje),
        estrellas = GREATEST(public.progreso_alumno.estrellas, EXCLUDED.estrellas),
        completada = public.progreso_alumno.completada OR EXCLUDED.completada,
        tiempo_segundos = public.progreso_alumno.tiempo_segundos + EXCLUDED.tiempo_segundos,
        respuestas_correctas = GREATEST(public.progreso_alumno.respuestas_correctas, EXCLUDED.respuestas_correctas),
        total_preguntas = GREATEST(public.progreso_alumno.total_preguntas, EXCLUDED.total_preguntas),
        fecha_completado = CASE
          WHEN EXCLUDED.completada = true THEN NOW()
          ELSE public.progreso_alumno.fecha_completado
        END
      RETURNING *`,
      [
        usuario.id_usuario,
        mundo,
        actividadSlug,
        actividadNombre,
        Number(puntaje || 0),
        Number(estrellas || 0),
        Boolean(completada),
        Number(tiempoSegundos || 0),
        Number(respuestasCorrectas || 0),
        Number(totalPreguntas || 0)
      ]
    );

    return res.json({
      ok: true,
      mensaje: "Progreso guardado correctamente",
      progreso: result.rows[0]
    });
  } catch (error) {
    console.error("Error al guardar progreso:", error);

    return res.status(500).json({
      ok: false,
      mensaje: error.message || "No se pudo guardar el progreso"
    });
  }
};

module.exports = {
  obtenerPerfilAlumno,
  obtenerEstadisticasAlumno,
  guardarProgresoAlumno
};