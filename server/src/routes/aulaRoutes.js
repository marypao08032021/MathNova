const router=require('express').Router();
const {verificarToken}=require('../middlewares/authMiddleware');
const s=require('../services/aulaService');
router.use(verificarToken);router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next()});
const route=fn=>async(req,res)=>{try{await fn(req,res)}catch(e){res.status(e.status||503).json({ok:false,mensaje:e.status?e.message:'No se pudo consultar el aula. Comprueba PostgreSQL y aplica la migración del aula.'})}};
router.get('/acceso',route(async(req,res)=>res.json({ok:true,actividades:await s.permisos(req.usuario)})));
router.use((req,res,next)=>{try{s.docente(req.usuario);next()}catch(e){res.status(e.status).json({ok:false,mensaje:e.message})}});
router.get('/grupos',route(async(req,res)=>{const r=await s.pool.query(`SELECT g.id_grupo,g.nombre_grupo,COUNT(DISTINCT ga.id_alumno) FILTER(WHERE ga.estado=true)::int AS total_alumnos
 FROM public.grupos g LEFT JOIN public.grupo_alumnos ga ON ga.id_grupo=g.id_grupo
 WHERE $1::boolean OR g.id_profesor=$2 GROUP BY g.id_grupo ORDER BY g.nombre_grupo`,[req.usuario.rol==='admin',req.usuario.id_usuario]);res.json({ok:true,grupos:r.rows,catalogo:s.catalogo})}));
router.get('/grupos/:grupo',route(async(req,res)=>{
 const g=await s.grupo(req.usuario,req.params.grupo);
 const [alumnos,permisos,excepciones,progreso]=await Promise.all([
 s.pool.query(`SELECT DISTINCT r.id_usuario,r.nombre_completo,r.usuario FROM public.grupo_alumnos ga JOIN public.registro r ON r.id_usuario=ga.id_alumno WHERE ga.id_grupo=$1 AND ga.estado=true AND r.estado=true ORDER BY r.nombre_completo`,[g.id_grupo]),
 s.pool.query('SELECT actividad_codigo,habilitada FROM public.mathnova_acceso_grupo WHERE id_grupo=$1',[g.id_grupo]),
 s.pool.query(`SELECT i.id_alumno,i.actividad_codigo,i.habilitada FROM public.mathnova_acceso_alumno i JOIN public.grupo_alumnos ga ON ga.id_grupo=i.id_grupo AND ga.id_alumno=i.id_alumno WHERE i.id_grupo=$1 AND ga.estado=true`,[g.id_grupo]),
 s.pool.query(`SELECT p.id_usuario,p.actividad_codigo,p.aciertos,p.total_preguntas,p.precision,p.completada,p.intentos,p.tiempo_segundos,p.fecha_ultimo_intento,p.respuestas
 FROM public.actividad_progreso p WHERE EXISTS(SELECT 1 FROM public.grupo_alumnos ga WHERE ga.id_grupo=$1 AND ga.id_alumno=p.id_usuario AND ga.estado=true)`,[g.id_grupo])]);
 res.json({ok:true,grupo:g,alumnos:alumnos.rows,permisos:permisos.rows,excepciones:excepciones.rows,progreso:progreso.rows.map(p=>({...p,actividad_codigo:s.codigo(p.actividad_codigo)}))});
}));
router.put('/grupos/:grupo/permisos',route(async(req,res)=>{
 const db=await s.pool.connect();try{
 await db.query('BEGIN');const g=await s.grupo(req.usuario,req.params.grupo,db);
 const codes=Array.isArray(req.body.actividades)?[...new Set(req.body.actividades.map(s.codigo))]:[];
 if(!codes.length||codes.length>24||codes.some(c=>!s.codigos.has(c)))throw s.error(400,'Selecciona actividades válidas.');
 const alumno=req.body.id_alumno==null?null:s.id(req.body.id_alumno);const state=req.body.habilitada;
 if(typeof state!=='boolean'&&!(alumno&&state===null))throw s.error(400,'El permiso debe ser habilitar, bloquear o heredar para un alumno.');
 if(alumno){const r=await db.query('SELECT 1 FROM public.grupo_alumnos WHERE id_grupo=$1 AND id_alumno=$2 AND estado=true FOR UPDATE',[g.id_grupo,alumno]);if(!r.rows.length)throw s.error(400,'El alumno no pertenece a este grupo.');}
 if(!alumno&&state===false)await db.query('DELETE FROM public.mathnova_acceso_alumno WHERE id_grupo=$1 AND actividad_codigo=ANY($2::text[]) AND habilitada=true',[g.id_grupo,codes]);
 for(const code of codes){
 if(alumno&&state===null)await db.query('DELETE FROM public.mathnova_acceso_alumno WHERE id_grupo=$1 AND id_alumno=$2 AND actividad_codigo=$3',[g.id_grupo,alumno,code]);
 else if(alumno)await db.query(`INSERT INTO public.mathnova_acceso_alumno(id_grupo,id_alumno,actividad_codigo,habilitada,actor) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id_grupo,id_alumno,actividad_codigo) DO UPDATE SET habilitada=EXCLUDED.habilitada,actor=EXCLUDED.actor,actualizado=now()`,[g.id_grupo,alumno,code,state,req.usuario.id_usuario]);
 else await db.query(`INSERT INTO public.mathnova_acceso_grupo(id_grupo,actividad_codigo,habilitada,actor) VALUES($1,$2,$3,$4) ON CONFLICT(id_grupo,actividad_codigo) DO UPDATE SET habilitada=EXCLUDED.habilitada,actor=EXCLUDED.actor,actualizado=now()`,[g.id_grupo,code,state,req.usuario.id_usuario]);
 }
 await db.query(`INSERT INTO public.mathnova_aula_auditoria(actor,id_grupo,id_alumno,actividades,habilitada) VALUES($1,$2,$3,$4::jsonb,$5)`,[req.usuario.id_usuario,g.id_grupo,alumno,JSON.stringify(codes),state]);
 await db.query('COMMIT');res.json({ok:true,mensaje:'Permisos actualizados. El progreso anterior se conserva.'});
 }catch(e){await db.query('ROLLBACK');throw e}finally{db.release()}
}));
module.exports=router;
