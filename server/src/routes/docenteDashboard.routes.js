const {scopeStudent,scopeGroup}=require('../services/docenteScope');
const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const gruposResultado = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM public.grupos g WHERE ${scopeGroup("g")}
    `);

    const alumnosRegistradosResultado = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM public.registro r
      WHERE ${scopeStudent('r')} AND LOWER(COALESCE(r.rol, '')) IN ('estudiante','alumno')
        AND estado = true
    `);

    const existeGrupoAlumnosResultado = await pool.query(`
      SELECT to_regclass('public.grupo_alumnos') IS NOT NULL AS existe
    `);

    const existeGrupoAlumnos =
      existeGrupoAlumnosResultado.rows[0]?.existe === true;

    let alumnosSinGrupo = 0;
    let alumnosRezagados = [];

    if (existeGrupoAlumnos) {
      const alumnosSinGrupoResultado = await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM public.registro r
        WHERE LOWER(COALESCE(r.rol, '')) = 'estudiante'
          AND r.estado = true
          AND NOT EXISTS (
            SELECT 1
            FROM public.grupo_alumnos ga
            WHERE ga.id_alumno = r.id_usuario
              AND ga.estado = true
          )
      `);

      alumnosSinGrupo = Number(alumnosSinGrupoResultado.rows[0]?.total || 0);

      const alumnosRezagadosResultado = await pool.query(`
        SELECT
          r.id_usuario AS id_alumno,
          r.nombre_completo AS nombre,
          'Sin grupo' AS grupo,
          'Asignación pendiente' AS tema,
          'Sin grupo' AS situacion
        FROM public.registro r
        WHERE LOWER(COALESCE(r.rol, '')) = 'estudiante'
          AND r.estado = true
          AND NOT EXISTS (
            SELECT 1
            FROM public.grupo_alumnos ga
            WHERE ga.id_alumno = r.id_usuario
              AND ga.estado = true
          )
        ORDER BY r.nombre_completo ASC
        LIMIT 5
      `);

      alumnosRezagados = alumnosRezagadosResultado.rows;
    } else {
      alumnosSinGrupo = Number(alumnosRegistradosResultado.rows[0]?.total || 0);

      const alumnosRezagadosResultado = await pool.query(`
        SELECT
          r.id_usuario AS id_alumno,
          r.nombre_completo AS nombre,
          'Sin grupo' AS grupo,
          'Asignación pendiente' AS tema,
          'Sin grupo' AS situacion
        FROM public.registro r
        WHERE LOWER(COALESCE(r.rol, '')) = 'estudiante'
          AND r.estado = true
        ORDER BY r.nombre_completo ASC
        LIMIT 5
      `);

      alumnosRezagados = alumnosRezagadosResultado.rows;
    }

    const gruposActivos = Number(gruposResultado.rows[0]?.total || 0);
    const alumnosRegistrados = Number(
      alumnosRegistradosResultado.rows[0]?.total || 0
    );

    const avisos = [];

    if (gruposActivos === 0) {
      avisos.push("Aún no hay grupos creados.");
    }

    if (alumnosRegistrados === 0) {
      avisos.push("Aún no tienes alumnos asignados a tus grupos.");
    }

    if (alumnosSinGrupo > 0) {
      avisos.push(
        `${alumnosSinGrupo} alumno${
          alumnosSinGrupo === 1 ? "" : "s"
        } todavía no pertenece${alumnosSinGrupo === 1 ? "" : "n"} a ningún grupo.`
      );
    }

    if (!existeGrupoAlumnos) {
      avisos.push("La tabla grupo_alumnos todavía no existe o no está disponible.");
    }

    if (avisos.length === 0) {
      avisos.push("Todo se ve en orden por ahora.");
    }

    return res.json({
      ok: true,
      resumen: {
        grupos_activos: gruposActivos,
        alumnos_registrados: alumnosRegistrados,
        alumnos_sin_grupo: alumnosSinGrupo,
        alumnos_rezagados: alumnosRezagados.length,
      },
      alumnos_rezagados: alumnosRezagados,
      mejor_desempeno: [],
      avisos,
    });
  } catch (error) {
    console.error("Error al cargar dashboard docente:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo cargar el dashboard docente.",
    });
  }
});

module.exports = router;