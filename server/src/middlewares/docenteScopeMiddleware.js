const {verificarToken}=require('./authMiddleware');const s=require('../services/aulaService');const {context}=require('../services/docenteScope');
module.exports=(req,res,next)=>verificarToken(req,res,async()=>{try{
 s.docente(req.usuario);
 const match=req.path.match(/^\/alumnos\/(\d+)(?:\/|$)/);
 if(match&&req.usuario.rol!=='admin'){
  if(req.method==='DELETE')throw s.error(403,'Para retirar un alumno usa su grupo. La desactivación de cuentas corresponde al superusuario.');
  const r=await s.pool.query(`SELECT 1 FROM public.grupo_alumnos ga JOIN public.grupos g ON g.id_grupo=ga.id_grupo WHERE ga.id_alumno=$1 AND ga.estado=true AND g.id_profesor=$2`,[match[1],req.usuario.id_usuario]);
  if(!r.rows.length)throw s.error(403,'Este alumno no pertenece a tus grupos.');
 }
 if(req.query.grupo)await s.grupo(req.usuario,req.query.grupo);
 context.run(req.usuario,next);
 }catch(e){res.status(e.status||503).json({ok:false,mensaje:e.status?e.message:'No se pudo comprobar el acceso docente.'})}});
