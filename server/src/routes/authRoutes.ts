import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { normalizarRol } from '../middlewares/authMiddleware';

const router = Router();
const text = (value: unknown) => typeof value === 'string' ? value : '';
router.post('/register', async (req, res) => {
  const body = req.body ?? {};
  const nombre = text(body.nombre_completo ?? body.nombreCompleto).trim();
  const correo = text(body.correo ?? body.email).trim().toLowerCase();
  const usuario = text(body.usuario).trim().toLowerCase() || null;
  const password = text(body.password ?? body.contrasena);
  const confirm = text(body.confirmarPassword ?? body.confirmar_password);
  if (!nombre || nombre.length>120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length>120 || (usuario && usuario.length>60)) {
    res.status(400).json({ok:false,mensaje:'Revisa nombre, correo y usuario.'}); return;
  }
  if (password.length<6 || Buffer.byteLength(password,'utf8')>72 || password!==confirm) {
    res.status(400).json({ok:false,mensaje:'La contraseña debe coincidir con la confirmación, tener mínimo 6 caracteres y máximo 72 bytes.'}); return;
  }
  if (body.acepto_terminos!==true) { res.status(400).json({ok:false,mensaje:'Debes aceptar los términos.'}); return; }
  try {
    const exists = await pool.query(`SELECT 1 FROM public.registro WHERE lower(trim(correo))=$1
      OR ($2::text IS NOT NULL AND lower(trim(usuario))=$2) LIMIT 1`, [correo,usuario]);
    if (exists.rowCount) { res.status(409).json({ok:false,mensaje:'El correo o usuario ya está registrado.'}); return; }
    const hash = await bcrypt.hash(password,10);
    // Alta pública exclusivamente de estudiante; no se confía en rol/role_id enviados.
    const result = await pool.query(`INSERT INTO public.registro
      (nombre_completo,correo,usuario,password_hash,role_id,rol,estado,acepto_terminos)
      VALUES ($1,$2,$3,$4,2,'estudiante',true,true)
      RETURNING id_usuario,nombre_completo,correo,usuario,rol,role_id,estado,fecha_registro`,[nombre,correo,usuario,hash]);
    res.status(201).json({ok:true,mensaje:'Usuario registrado correctamente.',usuario:result.rows[0]});
  } catch (error) {
    if ((error as {code?:string}).code==='23505') { res.status(409).json({ok:false,mensaje:'El correo o usuario ya está registrado.'}); return; }
    res.status(503).json({ok:false,mensaje:'No se pudo registrar al usuario en la base.'});
  }
});
router.post('/login', async (req, res) => {
  const body = req.body ?? {};
  const identifier = text(body.correoUsuario ?? body.correo ?? body.email ?? body.usuario).trim().toLowerCase();
  const password = text(body.password ?? body.contrasena);
  if (!identifier || !password || Buffer.byteLength(password,'utf8')>72) { res.status(400).json({ok:false,mensaje:'Correo/usuario y contraseña son obligatorios.'}); return; }
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) { res.status(503).json({ok:false,mensaje:'Autenticación no configurada.'}); return; }
  try {
    const result = await pool.query(`SELECT id_usuario,nombre_completo,correo,usuario,password_hash,rol,role_id,estado
      FROM public.registro WHERE lower(trim(correo))=$1 OR lower(trim(usuario))=$1
      ORDER BY CASE WHEN lower(trim(correo))=$1 THEN 0 ELSE 1 END LIMIT 1`,[identifier]);
    const user = result.rows[0];
    if (!user || !/^\$2[aby]\$/.test(user.password_hash) || !await bcrypt.compare(password,user.password_hash)) {
      res.status(401).json({ok:false,mensaje:'Credenciales incorrectas.'}); return;
    }
    if (!user.estado) { res.status(403).json({ok:false,mensaje:'La cuenta está desactivada.'}); return; }
    const rol = normalizarRol(user.rol);
    const token = jwt.sign({id_usuario:user.id_usuario,correo:user.correo,rol,identity:'registro'},secret,{algorithm:'HS256',expiresIn:'7d'});
    try { await pool.query(`INSERT INTO public.login (id_usuario,correo,ip,user_agent,exito) VALUES ($1,$2,$3,$4,true)`,[user.id_usuario,user.correo,req.ip,req.headers['user-agent'] ?? null]); }
    catch { console.warn('No se pudo guardar el evento de acceso.'); }
    const {password_hash: _hash,...profile} = user;
    res.json({ok:true,success:true,mensaje:'Inicio de sesión correcto.',token,usuario:{...profile,rol}});
  } catch { res.status(503).json({ok:false,mensaje:'No se pudo consultar la base para iniciar sesión.'}); }
});
export default router;
