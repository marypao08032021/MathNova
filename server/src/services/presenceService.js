const s=require('./seguimientoService'),pilot=require('./pilotService'),{randomUUID}=require('node:crypto');
const sessions=new Map(),TTL=45000;const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
function prune(now){for(const [key,row]of sessions)if(now-row.at>TTL)sessions.delete(key)}
async function beat(user,b,now=Date.now()){
 if(user.rol!=='estudiante')throw s.error(403,'La presencia real corresponde a cuentas de alumno.');
 if(!uuid(b.pestana)||!Number.isSafeInteger(b.secuencia)||b.secuencia<1||typeof b.visible!=='boolean'||!Number.isFinite(b.inactivo)||b.inactivo<0||b.inactivo>86400)throw s.error(400,'Señal de presencia inválida.');
 if(b.respuestas!==undefined&&(!b.respuestas||typeof b.respuestas!=='object'||Array.isArray(b.respuestas)))throw s.error(400,'Datos de avance inválidos.');
 const code=b.actividad==null?null:s.codigo(b.actividad);if(code&&!s.codigos.has(code))throw s.error(400,'Actividad no reconocida.');
 if(b.respuestas&&(!code||!uuid(b.recorrido)))throw s.error(400,'La señal de avance requiere actividad y recorrido.');
 prune(now);const key=String(user.id_usuario)+':'+b.pestana,prior=sessions.get(key);
 if(prior&&b.secuencia<=prior.seq)return {ok:true,ignorada:true};
 if(b.salir===true){sessions.set(key,{actor:String(user.id_usuario),seq:b.secuencia,at:now,closed:true});return {ok:true}}
 let blocked=false,progress=null,baseline=null;
 if(code){try{await s.comprobar(user,code)}catch(e){if(e.status!==403)throw e;blocked=true}}
 if(!blocked&&code&&b.respuestas){
  const prepared=pilot.prepare({actividad_codigo:code,respuestas:{...b.respuestas,piloto:{id:randomUUID(),sesion:b.recorrido,version:pilot.catalog[code].version}}});
  const hashes=prepared.evaluation.items.map(i=>s.fingerprint(i.respuesta));
  baseline=prior?.code===code&&prior?.cycle===b.recorrido&&prior.baseline?prior.baseline:hashes;
  const changed=hashes.filter((h,i)=>h!==baseline[i]).length;
  progress={modificados:changed,total:hashes.length,aciertos_provisionales:prepared.evaluation.aciertos};
 }
 // Las solicitudes pueden terminar fuera de orden mientras se comprueban los permisos.
 const current=sessions.get(key);if(current&&current.seq>=b.secuencia)return {ok:true,ignorada:true};
 const same=[...sessions.entries()].filter(([,r])=>r.actor===String(user.id_usuario));if(!current&&same.length>=4){same.sort((a,b)=>a[1].at-b[1].at);sessions.delete(same[0][0])}
 if(!current&&sessions.size>=5000)throw s.error(503,'El monitor alcanzó su capacidad de conexiones.');
 sessions.set(key,{actor:String(user.id_usuario),seq:b.secuencia,at:now,visible:b.visible,inactivo:b.inactivo,code,cycle:b.recorrido||null,baseline,progress,blocked});
 return {ok:true};
}
async function list(user,group,now=Date.now()){
 const g=await s.grupo(user,group);prune(now);
 const roster=(await s.pool.query(`SELECT DISTINCT r.id_usuario,r.nombre_completo,r.avatar_url FROM public.grupo_alumnos ga JOIN public.registro r ON r.id_usuario=ga.id_alumno WHERE ga.id_grupo=$1 AND ga.estado=true AND r.estado=true ORDER BY r.nombre_completo,r.id_usuario`,[g.id_grupo])).rows;
 const ids=roster.map(a=>a.id_usuario);const recent=ids.length?(await s.pool.query(`SELECT DISTINCT ON (alumno,actividad) alumno,actividad,id,tipo,creado,evaluacion->'aciertos' AS aciertos,evaluacion->'total' AS total,evaluacion->'completada' AS completada FROM public.mathnova_intentos_piloto WHERE alumno=ANY($1::bigint[]) ORDER BY alumno,actividad,orden DESC`,[ids])).rows:[];
 const alumnos=roster.map(a=>{const all=[...sessions.values()].filter(r=>r.actor===String(a.id_usuario)&&!r.closed&&now-r.at<=TTL).sort((a,b)=>Number(b.visible)-Number(a.visible)||b.at-a.at);const row=all[0],entry=row&&s.catalogo.find(a=>a.codigo===row.code),saved=row?.code?recent.find(r=>String(r.alumno)===String(a.id_usuario)&&r.actividad===row.code):null;
 return {...a,en_linea:!!row,pestanas:all.length,visible:row?.visible||false,inactivo_segundos:row?Math.floor(row.inactivo+(now-row.at)/1000):null,ultima_senal:row?new Date(row.at).toISOString():null,actividad:entry?{codigo:entry.codigo,titulo:entry.titulo,mundo:entry.mundo}:null,bloqueada:row?.blocked||false,avance:row?.progress||null,guardado:saved?{id:saved.id,tipo:saved.tipo,fecha:saved.creado,aciertos:saved.aciertos,total:saved.total,completada:saved.completada}:null};});
 return {ok:true,grupo:g,alumnos,consultado:new Date(now).toISOString(),vigencia_segundos:TTL/1000};
}
module.exports={beat,list};
