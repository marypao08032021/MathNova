const {AsyncLocalStorage}=require('node:async_hooks');
const crypto=require('node:crypto');
const context=new AsyncLocalStorage(),sessions=new Map();
const lifetime=2*60*60*1000;
function prune(){for(const[id,s]of sessions)if(s.exp<Date.now())sessions.delete(id)}
function create(user){prune();for(const[id,s]of sessions)if(String(s.user.id_usuario)===String(user.id_usuario))sessions.delete(id);if(sessions.size>=128)throw Error('Hay demasiadas sesiones de prueba activas.');const id=crypto.randomUUID(),session={id,user:{...user},exp:Date.now()+lifetime,models:new Map(),progress:new Map(),counter:0};sessions.set(id,session);return session}
function get(id,actor){prune();const s=sessions.get(id);return s&&String(s.user.id_usuario)===String(actor)?s:null}
function end(id){sessions.delete(id)}
function installModels(models){for(const name of ['ProporcionalidadInversa','ActividadRampas','ActividadTripulacion','ActividadHolograma','ActividadSensor','ActividadNucleo','ActividadOraculo']){
 const model=models[name];if(!model||model.mathnovaTesterInstalled)continue;
 for(const method of ['findOne','create']){const original=model[method];model[method]=async function(...args){const s=context.getStore();if(!s)return original.apply(this,args);if(method==='findOne')return s.models.get(name)||null;const values={...args[0],id_estudiante:Number(s.user.id_usuario)};const pk=model.primaryKeyAttribute;if(pk&&values[pk]==null)values[pk]=++s.counter;const instance=model.build(values);instance.update=async updates=>{instance.set(updates);return instance};instance.save=async()=>instance;instance.destroy=async()=>{s.models.delete(name)};s.models.set(name,instance);return instance};}
 for(const method of ['findAll','findByPk','update','destroy','count','bulkCreate','upsert']){const original=model[method];if(typeof original!=='function')continue;model[method]=function(...args){if(context.getStore())throw Error('Operación no disponible en el entorno de prueba.');return original.apply(this,args)}}
 Object.defineProperty(model,'mathnovaTesterInstalled',{value:true});
}}
function summary(s){const rows=[...s.progress.values()],complete=rows.filter(r=>r.completada).length;return {estrellas_totales:0,estrellas_ganadas:0,xp_total:0,actividades_completadas:complete,lecciones_completadas:complete,actividades_intentadas:rows.length,precision_promedio:rows.length?rows.reduce((a,r)=>a+r.precision,0)/rows.length:0,promedio_general:0,progreso_general:0,tiempo_total_segundos:0,tiempo_estudio_segundos:0,tiempo_estudio_minutos:0,racha_actual:0}}
function generic(req,res,s){const path=req.path,body=req.body||{};
 if(req.method==='POST'&&path==='/progreso/actividad'){
 let attempt=null;const pilot=require('./pilotService');if(pilot.catalog[body.actividad_codigo]){try{const prepared=pilot.prepare({...body,respuestas:{...body.respuestas,piloto:{...body.respuestas?.piloto,id:crypto.randomUUID(),sesion:s.id,version:pilot.catalog[body.actividad_codigo].version}}},'cierre');body.aciertos=prepared.evaluation.aciertos;body.total_preguntas=prepared.evaluation.total;body.completada=prepared.evaluation.completada;attempt={id:prepared.p.id,evaluacion:prepared.evaluation,tiempo_segundos:Number(body.tiempo_segundos)||0,xp_obtenido:0,estrellas_obtenidas:0};}catch(e){return res.status(400).json({ok:false,mensaje:e.message});}}
 const total=Number(body.total_preguntas),correct=Number(body.aciertos);
 if(!body.actividad_codigo||!body.actividad_titulo||!body.mundo||!Number.isInteger(total)||total<1||!Number.isInteger(correct)||correct<0||correct>total)return res.status(400).json({ok:false,mensaje:'Revisa la evidencia y el número de respuestas.'});
 if(!s.progress.has(body.actividad_codigo)&&s.progress.size>=32)return res.status(400).json({ok:false,mensaje:'La sesión ya tiene demasiadas actividades.'});
 const old=s.progress.get(body.actividad_codigo),row={...body,id_progreso:old?.id_progreso||++s.counter,id_usuario:Number(s.user.id_usuario),precision:Math.round(correct/total*10000)/100,estrellas_obtenidas:0,xp_obtenido:0,intentos:(old?.intentos||0)+1,completada:body.completada===true,fecha_ultimo_intento:new Date().toISOString()};s.progress.set(body.actividad_codigo,row);return res.json({ok:true,modo_tester:true,mensaje:'Resultado de prueba; no se guardó en la base.',progreso:row,recompensas_nuevas:0,...(attempt?{intento_piloto:attempt}:{})});}
 if(req.method==='GET'&&path.startsWith('/progreso/actividad/'))return res.json({ok:true,modo_tester:true,progreso:s.progress.get(decodeURIComponent(path.split('/').at(-1)))||null});
 if(req.method==='GET'&&path.startsWith('/progreso/alumno/'))return res.json({ok:true,modo_tester:true,progreso:[...s.progress.values()],total:s.progress.size});
 if(req.method==='GET'&&path.startsWith('/progreso/resumen/'))return res.json({ok:true,modo_tester:true,resumen:summary(s),mundos:[]});
 if(req.method==='GET'&&path.includes('/progreso/metas'))return res.json({ok:true,modo_tester:true,metas:{},recompensas_nuevas:0});
 if(req.method==='GET'&&path==='/alumno/perfil')return res.json({ok:true,modo_tester:true,perfil:{...s.user,nombreCompleto:s.user.nombre_completo},resumen:summary(s),actividadesRecientes:[...s.progress.values()]});
 if(req.method==='GET'&&path==='/alumno/estadisticas')return res.json({ok:true,modo_tester:true,resumen:summary(s),estadisticas:summary(s),mundos:[],actividades:[],actividadSemanal:[],actividadesRecientes:[...s.progress.values()]});
 if(req.method==='POST'&&path==='/alumno/progreso')return res.json({ok:true,modo_tester:true,mensaje:'Resultado de prueba; no se guardó en la base.'});
 return false;
}
module.exports={context,create,get,end,installModels,generic};
