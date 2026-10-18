const {scopeStudent,scopeGroup}=require('../services/docenteScope');
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

function obtenerIniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "AL";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

function obtenerColor(idUsuario) {
  const colores = ["azul", "verde", "morado", "naranja", "rojo", "turquesa"];
  return colores[Number(idUsuario) % colores.length];
}

function obtenerBarraProgreso(progreso) {
  if (progreso === null || progreso === undefined) return "sin-datos";
  if (progreso >= 75) return "alta";
  if (progreso >= 40) return "media";
  return "baja";
}

router.get("/", async (req, res) => {
  try {
    const busqueda = req.query.buscar?.trim() || "";

    const resultado = await pool.query(
      `
      WITH progreso_resumen AS (
        SELECT
          id_usuario,
          ROUND(AVG(COALESCE(precision, 0))::numeric, 1) AS promedio_precision,
          COUNT(*)::int AS total_actividades,
          COUNT(*) FILTER (WHERE completada = true)::int AS actividades_completadas
        FROM public.actividad_progreso
        GROUP BY id_usuario
      ),
      ultimo_modulo AS (
        SELECT DISTINCT ON (id_usuario)
          id_usuario,
          actividad_titulo
        FROM public.actividad_progreso
        ORDER BY id_usuario, fecha_ultimo_intento DESC
      ),
      grupos_alumno AS (
        SELECT DISTINCT ON (ga.id_alumno)
          ga.id_alumno,
          g.nombre_grupo
        FROM public.grupo_alumnos ga
        INNER JOIN public.grupos g
          ON g.id_grupo = ga.id_grupo
        WHERE ga.estado = true AND ${scopeGroup('g')}
        ORDER BY ga.id_alumno, g.nombre_grupo ASC
      )
      SELECT
        r.id_usuario,
        r.nombre_completo,
        r.correo,
        r.usuario,
        r.estado,
        COALESCE(ga.nombre_grupo, 'Sin grupo') AS grupo,
        COALESCE(um.actividad_titulo, 'Sin módulo') AS modulo,
        pr.promedio_precision,
        pr.total_actividades,
        pr.actividades_completadas
      FROM public.registro r
      LEFT JOIN progreso_resumen pr
        ON pr.id_usuario = r.id_usuario
      LEFT JOIN ultimo_modulo um
        ON um.id_usuario = r.id_usuario
      LEFT JOIN grupos_alumno ga
        ON ga.id_alumno = r.id_usuario
      WHERE ${scopeStudent('r')} AND LOWER(COALESCE(r.rol, '')) IN ('estudiante','alumno')
        AND r.estado = true
        AND (
          $1 = ''
          OR LOWER(r.nombre_completo) LIKE LOWER($2)
          OR LOWER(r.correo) LIKE LOWER($2)
          OR LOWER(COALESCE(r.usuario, '')) LIKE LOWER($2)
        )
      ORDER BY r.fecha_registro DESC, r.id_usuario DESC
      `,
      [busqueda, `%${busqueda}%`]
    );

    const alumnos = resultado.rows.map((alumno) => {
      const totalActividades = Number(alumno.total_actividades || 0);
      const actividadesCompletadas = Number(alumno.actividades_completadas || 0);
      const tieneProgreso = totalActividades > 0;

      const progreso = tieneProgreso
        ? Math.round((actividadesCompletadas * 100) / totalActividades)
        : null;

      const promedio =
        tieneProgreso &&
        alumno.promedio_precision !== null &&
        alumno.promedio_precision !== undefined
          ? Number((Number(alumno.promedio_precision) / 10).toFixed(1))
          : null;

      const tieneRezago =
        tieneProgreso &&
        promedio !== null &&
        (promedio < 7 || (progreso !== null && progreso < 40));

      let estado = "Sin progreso";

      if (tieneProgreso) {
        estado = tieneRezago ? "Rezago" : "Activo";
      }

      return {
        id: alumno.id_usuario,
        nombre: alumno.nombre_completo,
        correo: alumno.correo,
        usuario: alumno.usuario,
        iniciales: obtenerIniciales(alumno.nombre_completo),
        color: obtenerColor(alumno.id_usuario),
        grupo: alumno.grupo || "Sin grupo",
        modulo: alumno.modulo || "Sin módulo",
        progreso,
        promedio,
        total_actividades: totalActividades,
        actividades_completadas: actividadesCompletadas,
        estado,
        barra: obtenerBarraProgreso(progreso),
      };
    });

    const total = alumnos.length;
    const activos = alumnos.filter((alumno) => alumno.estado === "Activo").length;
    const rezago = alumnos.filter((alumno) => alumno.estado === "Rezago").length;
    const sinProgreso = alumnos.filter(
      (alumno) => alumno.estado === "Sin progreso"
    ).length;

    const progresoBajo = alumnos.filter(
      (alumno) => alumno.progreso !== null && alumno.progreso < 40
    ).length;

    const alumnosConPromedio = alumnos.filter(
      (alumno) => alumno.promedio !== null && alumno.promedio !== undefined
    );

    const alumnosConProgreso = alumnos.filter(
      (alumno) => alumno.progreso !== null && alumno.progreso !== undefined
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

    const progresoPromedio =
      alumnosConProgreso.length > 0
        ? Math.round(
            alumnosConProgreso.reduce(
              (suma, alumno) => suma + Number(alumno.progreso),
              0
            ) / alumnosConProgreso.length
          )
        : null;

    return res.json({
      ok: true,
      alumnos,
      resumen: {
        total,
        activos,
        rezago,
        sin_progreso: sinProgreso,
        promedioGeneral,
        progresoPromedio,
        progreso_bajo: progresoBajo,
      },
    });
  } catch (error) {
    console.error("Error al obtener alumnos docentes:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener los alumnos.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const nombreCompleto = req.body.nombre_completo?.trim();
    const correo = req.body.correo?.trim().toLowerCase();
    const usuario = req.body.usuario?.trim().toLowerCase();
    const password = String(req.body.password || req.body.contrasena || "").trim();

    if (!nombreCompleto || !correo || !usuario || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: "Completa todos los campos.",
      });
    }

    if (!correo.includes("@")) {
      return res.status(400).json({
        ok: false,
        mensaje: "Escribe un correo válido.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    const existe = await pool.query(
      `
      SELECT id_usuario
      FROM public.registro
      WHERE LOWER(TRIM(correo)) = $1
         OR LOWER(TRIM(COALESCE(usuario, ''))) = $2
      LIMIT 1
      `,
      [correo, usuario]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: "Ya existe un alumno con ese correo o usuario.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const resultado = await pool.query(
      `
      INSERT INTO public.registro (
        nombre_completo,
        correo,
        usuario,
        password_hash,
        rol,
        estado,
        acepto_terminos
      )
      VALUES ($1, $2, $3, $4, 'estudiante', true, true)
      RETURNING id_usuario, nombre_completo, correo, usuario
      `,
      [nombreCompleto, correo, usuario, passwordHash]
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Alumno agregado correctamente.",
      alumno: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al agregar alumno:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo agregar el alumno.",
    });
  }
});

router.put("/:id_alumno", async (req, res) => {
  try {
    const idAlumno = Number(req.params.id_alumno);

    const nombreCompleto = req.body.nombre_completo?.trim();
    const correo = req.body.correo?.trim().toLowerCase();
    const usuario = req.body.usuario?.trim().toLowerCase();
    const password = String(req.body.password || req.body.contrasena || "").trim();

    if (!idAlumno) {
      return res.status(400).json({
        ok: false,
        mensaje: "El alumno no es válido.",
      });
    }

    if (!nombreCompleto || !correo || !usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "Completa nombre, correo y usuario.",
      });
    }

    if (!correo.includes("@")) {
      return res.status(400).json({
        ok: false,
        mensaje: "Escribe un correo válido.",
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    const existe = await pool.query(
      `
      SELECT id_usuario
      FROM public.registro
      WHERE (
          LOWER(TRIM(correo)) = $1
          OR LOWER(TRIM(COALESCE(usuario, ''))) = $2
        )
        AND id_usuario <> $3
      LIMIT 1
      `,
      [correo, usuario, idAlumno]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: "Ya existe otro usuario con ese correo o usuario.",
      });
    }

    let resultado;

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);

      resultado = await pool.query(
        `
        UPDATE public.registro
        SET
          nombre_completo = $1,
          correo = $2,
          usuario = $3,
          password_hash = $4,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_usuario = $5
          AND LOWER(COALESCE(rol, '')) = 'estudiante'
        RETURNING id_usuario, nombre_completo, correo, usuario
        `,
        [nombreCompleto, correo, usuario, passwordHash, idAlumno]
      );
    } else {
      resultado = await pool.query(
        `
        UPDATE public.registro
        SET
          nombre_completo = $1,
          correo = $2,
          usuario = $3,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_usuario = $4
          AND LOWER(COALESCE(rol, '')) = 'estudiante'
        RETURNING id_usuario, nombre_completo, correo, usuario
        `,
        [nombreCompleto, correo, usuario, idAlumno]
      );
    }

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Alumno no encontrado.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Alumno actualizado correctamente.",
      alumno: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al editar alumno:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo editar el alumno.",
    });
  }
});

router.delete("/:id_alumno", async (req, res) => {
  try {
    const idAlumno = Number(req.params.id_alumno);

    if (!idAlumno) {
      return res.status(400).json({
        ok: false,
        mensaje: "El alumno no es válido.",
      });
    }

    const resultado = await pool.query(
      `
      UPDATE public.registro
      SET
        estado = false,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_usuario = $1
        AND LOWER(COALESCE(rol, '')) = 'estudiante'
      RETURNING id_usuario
      `,
      [idAlumno]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Alumno no encontrado.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Alumno eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar alumno:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo eliminar el alumno.",
    });
  }
});

module.exports = router;
