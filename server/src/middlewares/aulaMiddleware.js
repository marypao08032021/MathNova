const {verificarToken}=require('./authMiddleware');const s=require('../services/aulaService');
const paths={proporcionalidad:'mathdata-generador-energia',rampas:'mathdata-rampas-lanzamiento',tripulacion:'mathdata-encuesta-tripulacion',holograma:'mathdata-holograma-reportes',sensor:'mathdata-sensor-frecuencias',nucleo:'mathdata-nucleo-decisiones',oraculo:'mathdata-oraculo-estacion'};
module.exports=function(req,res,next){
 const part=req.path.split('/')[1];const legacy=req.method==='POST'&&req.path==='/alumno/progreso';if(!legacy&&!paths[part]&&!['progreso','progreso-general','sync'].includes(part))return next();
 if(require('../services/testerSession').context.getStore())return next();
 verificarToken(req,res,async()=>{try{
  const user=req.usuario;const ids=[req.body?.id_usuario,req.body?.id_estudiante];
  const segments=req.path.split('/').filter(Boolean);
  if(req.method==='GET'){
   if(part==='progreso-general')ids.push(segments[1]);
   else if(part==='progreso')ids.push(segments[2]);
   else if(segments[1]==='progreso')ids.push(segments[2]);
  }
  if(ids.some(v=>v!=null&&String(v)!==String(user.id_usuario)))throw s.error(403,'Solo puedes consultar o guardar tu propio progreso.');
  if(part==='sync'||legacy)throw s.error(403,'La sincronización heredada no está habilitada en el aula. Usa las actividades autorizadas.');
  const code=paths[part]||(req.method==='POST'?req.body?.actividad_codigo:null);
  if(code)await s.comprobar(user,code);
  else if(req.method!=='GET')throw s.error(400,'Indica una actividad válida.');
  res.set('Cache-Control','no-store');next();
 }catch(e){res.status(e.status||503).json({ok:false,mensaje:e.status?e.message:'No se pudieron comprobar los permisos del aula.'})}});
};
