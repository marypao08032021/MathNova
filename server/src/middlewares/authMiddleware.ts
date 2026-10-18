import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';

interface SessionUser {
  id_usuario: string | number; nombre_completo: string; correo: string;
  usuario: string | null; rol: string; estado: boolean; grado: string | null;
  escuela: string | null; avatar_url: string | null; fecha_registro: unknown;
}
type SessionRequest = Request & { usuario?: SessionUser; user?: SessionUser };
export const normalizarRol = (rol: unknown): string => {
  const value = String(rol ?? '').trim().toLowerCase();
  if (['docente_estudiante','docente-alumno','docente_alumno','maestro_estudiante','mixto'].includes(value)) return 'docente_estudiante';
  if (['docente','profesor','maestro'].includes(value)) return 'docente';
  if (['admin','administrador'].includes(value)) return 'admin';
  return 'estudiante';
};
export const verificarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) { res.status(503).json({ok:false,mensaje:'Autenticación no configurada.'}); return; }
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) { res.status(401).json({ok:false,mensaje:'Token no enviado'}); return; }
  let id: string;
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof decoded === 'string') throw new Error('Token inválido');
    // Tokens nuevos identifican su tabla. Los anteriores también se resuelven SOLO en registro.
    if (decoded.identity && decoded.identity !== 'registro') throw new Error('Identidad incompatible');
    id = String(decoded.id_usuario ?? '');
    if (!/^[1-9]\d*$/.test(id)) throw new Error('ID inválido');
  } catch { res.status(401).json({ok:false,mensaje:'Sesión inválida o expirada'}); return; }
  try {
    const result = await pool.query<SessionUser>(`SELECT id_usuario, nombre_completo, correo, usuario, rol, estado,
      grado, escuela, avatar_url, fecha_registro FROM public.registro WHERE id_usuario=$1`, [id]);
    const user = result.rows[0];
    if (!user) { res.status(401).json({ok:false,mensaje:'Usuario no encontrado'}); return; }
    if (!user.estado) { res.status(403).json({ok:false,mensaje:'Usuario inactivo'}); return; }
    user.rol = normalizarRol(user.rol);
    const session = req as SessionRequest; session.usuario = user; session.user = user;
    next();
  } catch { res.status(503).json({ok:false,mensaje:'No se pudo consultar la sesión en la base.'}); }
};
export const permitirRoles = (...allowed: string[]) => (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as SessionRequest).usuario ?? (req as SessionRequest).user;
  if (!user) { res.status(401).json({ok:false,mensaje:'Sesión requerida'}); return; }
  const role = normalizarRol(user.rol); const roles = allowed.map(normalizarRol);
  if (!roles.includes(role) && !(role==='docente_estudiante' && (roles.includes('docente') || roles.includes('estudiante')))) {
    res.status(403).json({ok:false,mensaje:'No tienes permisos para esta acción'}); return;
  }
  next();
};
