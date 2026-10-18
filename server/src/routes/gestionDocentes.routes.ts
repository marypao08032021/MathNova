import { Router, Request, Response } from "express";

const bcrypt = require("bcryptjs");
const pool = require("../db") as {
  query: <T = any>(sql: string, params?: unknown[]) => Promise<{
    rows: T[];
    rowCount?: number;
  }>;
};

import { verificarToken, permitirRoles } from "../middlewares/authMiddleware";
import { timingSafeEqual } from "node:crypto";
const router = Router();
router.use(verificarToken, permitirRoles("admin", "docente"));


function obtenerIniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "DO";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

function validarId(valor: unknown) {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function normalizarEstado(valor: unknown) {
  if (typeof valor === "boolean") return valor;

  const texto = String(valor || "").trim().toLowerCase();

  if (["activo", "true", "1", "si", "sí"].includes(texto)) return true;
  if (["inactivo", "false", "0", "no"].includes(texto)) return false;

  return true;
}

function obtenerClaveAcceso(body: any) {
  return String(
    body?.clave_acceso ||
      body?.claveAcceso ||
      body?.clave_docente ||
      body?.claveDocente ||
      "",
  ).trim();
}

function claveAccesoValida(body: any) {
  const expected = process.env.DOCENTE_ACCESS_PASSWORD?.trim();
  if (!expected) return false;
  const supplied = Buffer.from(obtenerClaveAcceso(body));
  const configured = Buffer.from(expected);
  return supplied.length === configured.length && timingSafeEqual(supplied, configured);
}

function formatearFecha(fecha: unknown) {
  if (!fecha) return "Sin fecha";

  const fechaObjeto = new Date(String(fecha));

  if (Number.isNaN(fechaObjeto.getTime())) return "Sin fecha";

  return fechaObjeto.toLocaleDateString("es-MX");
}

function mapearDocente(docente: any) {
  return {
    id: Number(docente.id_usuario),
    idUsuario: String(docente.id_usuario),
    nombre: docente.nombre_completo,
    correo: docente.correo,
    usuario: docente.usuario || "",
    rol: "Docente",
    estado: docente.estado === false ? "Inactivo" : "Activo",
    estadoBooleano: docente.estado !== false,
    fechaRegistro: formatearFecha(docente.fecha_registro),
    iniciales: obtenerIniciales(docente.nombre_completo),
    totalGrupos: Number(docente.total_grupos || 0),
  };
}

async function validarDuplicado(
  correo: string,
  usuario: string,
  idIgnorado: number | null = null,
) {
  const resultado = await pool.query(
    `
    SELECT
      id_usuario,
      correo,
      usuario,
      rol,
      LOWER(TRIM(correo)) = LOWER(TRIM($1)) AS correo_duplicado,
      LOWER(TRIM(COALESCE(usuario, ''))) = LOWER(TRIM($2)) AS usuario_duplicado
    FROM public.registro
    WHERE (
      LOWER(TRIM(correo)) = LOWER(TRIM($1))
      OR LOWER(TRIM(COALESCE(usuario, ''))) = LOWER(TRIM($2))
    )
    AND ($3::bigint IS NULL OR id_usuario <> $3::bigint)
    ORDER BY
      CASE
        WHEN LOWER(TRIM(correo)) = LOWER(TRIM($1)) THEN 0
        ELSE 1
      END,
      id_usuario DESC
    LIMIT 1
    `,
    [correo, usuario, idIgnorado],
  );

  return resultado.rows[0] || null;
}

async function buscarDuplicadoPorValores(
  correo: string,
  usuario: string,
  idIgnorado: number | null = null,
) {
  try {
    return await validarDuplicado(correo, usuario, idIgnorado);
  } catch {
    return null;
  }
}

function mensajeDuplicado(duplicado: any) {
  const rol = duplicado?.rol || "otro rol";

  if (duplicado?.correo_duplicado && duplicado?.usuario_duplicado) {
    return `Ese correo y usuario ya están registrados en la tabla registro como ${rol}.`;
  }

  if (duplicado?.correo_duplicado) {
    return `Ese correo ya está registrado en la tabla registro como ${rol}.`;
  }

  if (duplicado?.usuario_duplicado) {
    return `Ese usuario ya está registrado en la tabla registro como ${rol}.`;
  }

  return "El correo o usuario ya está registrado.";
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const resultado = await pool.query(
      `
      SELECT
        r.id_usuario,
        r.nombre_completo,
        r.correo,
        r.usuario,
        r.rol,
        r.estado,
        r.fecha_registro,
        COUNT(g.id_grupo)::int AS total_grupos
      FROM public.registro r
      LEFT JOIN public.grupos g
        ON g.id_profesor = r.id_usuario
      WHERE LOWER(COALESCE(r.rol, '')) = 'docente'
      GROUP BY
        r.id_usuario,
        r.nombre_completo,
        r.correo,
        r.usuario,
        r.rol,
        r.estado,
        r.fecha_registro
      ORDER BY r.fecha_registro DESC, r.id_usuario DESC
      `,
    );

    const docentes = resultado.rows.map(mapearDocente);
    const activos = docentes.filter((docente) => docente.estado === "Activo").length;
    const inactivos = docentes.length - activos;
    const gruposAsignados = docentes.reduce(
      (total, docente) => total + Number(docente.totalGrupos || 0),
      0,
    );

    return res.json({
      ok: true,
      docentes,
      resumen: {
        total: docentes.length,
        activos,
        inactivos,
        grupos_asignados: gruposAsignados,
      },
    });
  } catch (error) {
    console.error("Error al obtener docentes:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudieron obtener los docentes.",
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    if (!claveAccesoValida(req.body)) {
      return res.status(403).json({
        ok: false,
        mensaje: "La clave de acceso para gestionar docentes no es correcta.",
      });
    }

    const nombre = String(req.body.nombre_completo || req.body.nombre || "").trim();
    const correo = String(req.body.correo || "").trim().toLowerCase();
    const usuario = String(req.body.usuario || "").trim().toLowerCase();
    const password = String(req.body.password || req.body.contrasena || "").trim();
    const estado = normalizarEstado(req.body.estado);

    if (!nombre || !correo || !usuario || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: "Completa nombre, correo, usuario y contraseña.",
      });
    }

    if (!correo.includes("@")) {
      return res.status(400).json({
        ok: false,
        mensaje: "Ingresa un correo válido.",
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        ok: false,
        mensaje: "La contraseña debe tener mínimo 8 caracteres y máximo 72 bytes.",
      });
    }

    const duplicado = await validarDuplicado(correo, usuario);

    if (duplicado) {
      return res.status(409).json({
        ok: false,
        mensaje: mensajeDuplicado(duplicado),
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const resultado = await pool.query(
      `
      INSERT INTO public.registro
        (nombre_completo, correo, usuario, password_hash, rol, role_id, estado, acepto_terminos)
      VALUES
        ($1, $2, $3, $4, 'docente', 1, $5, true)
      RETURNING id_usuario, nombre_completo, correo, usuario, rol, estado, fecha_registro
      `,
      [nombre, correo, usuario, passwordHash, estado],
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Docente registrado correctamente.",
      docente: mapearDocente({ ...resultado.rows[0], total_grupos: 0 }),
    });
  } catch (error: any) {
    console.error("Error al crear docente:", error);

    if (error?.code === "23505") {
      const nombreCorreo = error?.constraint || "";
      const duplicado = await buscarDuplicadoPorValores(
        String(req.body.correo || "").trim().toLowerCase(),
        String(req.body.usuario || "").trim().toLowerCase(),
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          duplicado
            ? mensajeDuplicado(duplicado)
            : nombreCorreo.includes("correo")
              ? "Ese correo ya está registrado en la tabla registro."
              : nombreCorreo.includes("usuario")
                ? "Ese usuario ya está registrado en la tabla registro."
                : "El correo o usuario ya está registrado.",
      });
    }

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo registrar el docente.",
    });
  }
});

router.put("/:idDocente", async (req: Request, res: Response) => {
  try {
    if (!claveAccesoValida(req.body)) {
      return res.status(403).json({
        ok: false,
        mensaje: "La clave de acceso para gestionar docentes no es correcta.",
      });
    }

    const idDocente =
      validarId(req.params.idDocente) ||
      validarId(req.body.id_usuario) ||
      validarId(req.body.idUsuario);
    const nombre = String(req.body.nombre_completo || req.body.nombre || "").trim();
    const correo = String(req.body.correo || "").trim().toLowerCase();
    const usuario = String(req.body.usuario || "").trim().toLowerCase();
    const password = String(req.body.password || req.body.contrasena || "").trim();
    const estado = normalizarEstado(req.body.estado);

    if (!idDocente) {
      return res.status(400).json({
        ok: false,
        mensaje: "El docente no es válido.",
      });
    }

    if (!nombre || !correo || !usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "Completa nombre, correo y usuario.",
      });
    }

    if (!correo.includes("@")) {
      return res.status(400).json({
        ok: false,
        mensaje: "Ingresa un correo válido.",
      });
    }

    if (password && password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        ok: false,
        mensaje: "La nueva contraseña debe tener mínimo 8 caracteres y máximo 72 bytes.",
      });
    }

    const duplicado = await validarDuplicado(correo, usuario, idDocente);

    if (duplicado) {
      return res.status(409).json({
        ok: false,
        mensaje: mensajeDuplicado(duplicado),
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
          estado = $5,
          rol = 'docente', role_id = 1,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_usuario = $6
          AND LOWER(COALESCE(rol, '')) = 'docente'
        RETURNING id_usuario, nombre_completo, correo, usuario, rol, estado, fecha_registro
        `,
        [nombre, correo, usuario, passwordHash, estado, idDocente],
      );
    } else {
      resultado = await pool.query(
        `
        UPDATE public.registro
        SET
          nombre_completo = $1,
          correo = $2,
          usuario = $3,
          estado = $4,
          rol = 'docente', role_id = 1,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_usuario = $5
          AND LOWER(COALESCE(rol, '')) = 'docente'
        RETURNING id_usuario, nombre_completo, correo, usuario, rol, estado, fecha_registro
        `,
        [nombre, correo, usuario, estado, idDocente],
      );
    }

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró el docente.",
      });
    }

    const gruposResultado = await pool.query(
      `SELECT COUNT(*)::int AS total_grupos FROM public.grupos WHERE id_profesor = $1`,
      [idDocente],
    );

    return res.json({
      ok: true,
      mensaje: "Docente actualizado correctamente.",
      docente: mapearDocente({
        ...resultado.rows[0],
        total_grupos: gruposResultado.rows[0]?.total_grupos || 0,
      }),
    });
  } catch (error: any) {
    console.error("Error al actualizar docente:", error);

    if (error?.code === "23505") {
      const idDocente = validarId(req.params.idDocente);
      const nombreConstraint = error?.constraint || "";
      const duplicado = await buscarDuplicadoPorValores(
        String(req.body.correo || "").trim().toLowerCase(),
        String(req.body.usuario || "").trim().toLowerCase(),
        idDocente,
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          duplicado
            ? mensajeDuplicado(duplicado)
            : nombreConstraint.includes("correo")
              ? "Ese correo ya está registrado en la tabla registro."
              : nombreConstraint.includes("usuario")
                ? "Ese usuario ya está registrado en la tabla registro."
                : "El correo o usuario ya está registrado.",
      });
    }

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo actualizar el docente.",
    });
  }
});

router.patch("/:idDocente/estado", async (req: Request, res: Response) => {
  try {
    const idDocente = validarId(req.params.idDocente);
    const estado = normalizarEstado(req.body.estado);

    if (!idDocente) {
      return res.status(400).json({
        ok: false,
        mensaje: "El docente no es válido.",
      });
    }

    const resultado = await pool.query(
      `
      UPDATE public.registro
      SET estado = $1,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_usuario = $2
        AND LOWER(COALESCE(rol, '')) = 'docente'
      RETURNING id_usuario, nombre_completo, correo, usuario, rol, estado, fecha_registro
      `,
      [estado, idDocente],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró el docente.",
      });
    }

    const gruposResultado = await pool.query(
      `SELECT COUNT(*)::int AS total_grupos FROM public.grupos WHERE id_profesor = $1`,
      [idDocente],
    );

    return res.json({
      ok: true,
      mensaje: estado ? "Docente activado." : "Docente desactivado.",
      docente: mapearDocente({
        ...resultado.rows[0],
        total_grupos: gruposResultado.rows[0]?.total_grupos || 0,
      }),
    });
  } catch (error) {
    console.error("Error al cambiar estado del docente:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo cambiar el estado del docente.",
    });
  }
});

router.delete("/:idDocente", async (req: Request, res: Response) => {
  try {
    const idDocente = validarId(req.params.idDocente);

    if (!idDocente) {
      return res.status(400).json({
        ok: false,
        mensaje: "El docente no es válido.",
      });
    }

    const resultado = await pool.query(
      `
      UPDATE public.registro
      SET estado = false,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_usuario = $1
        AND LOWER(COALESCE(rol, '')) = 'docente'
      RETURNING id_usuario, nombre_completo, correo, usuario, rol, estado, fecha_registro
      `,
      [idDocente],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró el docente.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Docente desactivado correctamente.",
      docente: mapearDocente({ ...resultado.rows[0], total_grupos: 0 }),
    });
  } catch (error) {
    console.error("Error al desactivar docente:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "No se pudo desactivar el docente.",
    });
  }
});

export default router;


