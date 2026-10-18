const s=require('./seguimientoService');
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
function texto(v,max){if(typeof v!=='string'||!v.trim()||v.trim().length>max)throw s.error(400,'Completa la necesidad, la acción o la observación dentro del límite indicado.');return v.trim()}
function actividad(v){const code=s.codigo(v);if(!s.codigos.has(code))throw s.error(400,'Actividad no reconocida.');return code}
async function list(user,g,a,c){const code=actividad(c);await s.miembro(user,g,a);const rows=(await s.pool.query(`SELECT * FROM public.mathnova_intervenciones WHERE grupo=$1 AND alumno=$2 AND actividad=$3 ORDER BY creado DESC,id LIMIT 100`,[g,a,code])).rows;
 const candidates=(await s.pool.query(`SELECT id,tipo,creado,evaluacion->'aciertos' AS aciertos,evaluacion->'total' AS total
 FROM public.mathnova_intentos_piloto WHERE alumno=$1 AND actividad=$2 ORDER BY orden DESC LIMIT 30`,[a,code])).rows;
 return {ok:true,intervenciones:rows,candidatos:candidates,limite:100};}
async function create(user,b){const code=actividad(b.actividad),need=texto(b.necesidad,2000),action=texto(b.accion,2000),entry=s.catalogo.find(a=>a.codigo===code);
 if(!uuid(b.id)||!uuid(b.inicial)||!Number.isInteger(b.pda)||!entry.pda[b.pda])throw s.error(400,'Selecciona un intento y un PDA válido.');
 const db=await s.pool.connect();try{await db.query('BEGIN');await s.miembro(user,b.grupo,b.alumno,db);
 const e=(await db.query('SELECT id FROM public.mathnova_intentos_piloto WHERE id=$1 AND alumno=$2 AND actividad=$3',[b.inicial,b.alumno,code])).rows[0];if(!e)throw s.error(404,'El intento inicial no corresponde al alumno y actividad.');
 const values=[b.id,b.grupo,b.alumno,code,user.id_usuario,user.nombre_completo||'Docente',entry.contenido,entry.pda[b.pda],b.inicial,need,action];
 const r=await db.query(`INSERT INTO public.mathnova_intervenciones(id,grupo,alumno,actividad,docente,nombre_docente,contenido,pda,inicial,necesidad,accion)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(id) DO NOTHING RETURNING *`,values);
 const row=r.rows[0]||(await db.query('SELECT * FROM public.mathnova_intervenciones WHERE id=$1',[b.id])).rows[0];
 if(String(row.grupo)!==String(b.grupo)||String(row.alumno)!==String(b.alumno)||row.actividad!==code||String(row.docente)!==String(user.id_usuario)||row.inicial!==b.inicial||row.necesidad!==need||row.accion!==action||row.pda!==entry.pda[b.pda])throw s.error(409,'Ese identificador corresponde a otra intervención.');
 await db.query('COMMIT');return {ok:true,intervencion:row};
 }catch(e){await db.query('ROLLBACK');throw e}finally{db.release()}}
async function close(user,id,b){if(!uuid(id)||!uuid(b.posterior)||!['avance_observado','dificultad_persistente','evidencia_insuficiente'].includes(b.resultado))throw s.error(400,'Selecciona evidencia posterior y resultado de la revisión.');const observation=texto(b.observacion,3000),db=await s.pool.connect();
 try{await db.query('BEGIN');const row=(await db.query('SELECT * FROM public.mathnova_intervenciones WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!row)throw s.error(404,'La intervención no existe.');await s.miembro(user,row.grupo,row.alumno,db);
 if(row.revisado){if(row.posterior!==b.posterior||row.observacion!==observation||row.resultado!==b.resultado)throw s.error(409,'La intervención ya fue revisada. Actualiza la lista.');await db.query('COMMIT');return {ok:true,intervencion:row}}
 const ev=(await db.query(`SELECT p.id FROM public.mathnova_intentos_piloto p JOIN public.mathnova_intentos_piloto i ON i.id=$1 JOIN public.mathnova_intervenciones v ON v.id=$5
 WHERE p.id=$2 AND p.alumno=$3 AND p.actividad=$4 AND p.orden>i.orden AND p.creado>v.creado`,[row.inicial,b.posterior,row.alumno,row.actividad,row.id])).rows[0];
 if(!ev)throw s.error(409,'Selecciona un intento del mismo alumno y actividad, guardado después de registrar esta intervención.');
 const updated=(await db.query(`UPDATE public.mathnova_intervenciones SET posterior=$2,observacion=$3,resultado=$4,revisado=now(),revisado_por=$5 WHERE id=$1 RETURNING *`,[id,b.posterior,observation,b.resultado,user.id_usuario])).rows[0];await db.query('COMMIT');return {ok:true,intervencion:updated};
 }catch(e){await db.query('ROLLBACK');throw e}finally{db.release()}}
module.exports={list,create,close};
