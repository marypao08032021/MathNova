// Analiza únicamente registros guardados. Nunca infiere dominio de PDA ni atención.
const LIMIT=20;
function analyze(rows){
 if(!rows.length)return null;
 const latest=rows[0],version=latest.version;
 const compatible=rows.filter(r=>r.version===version);
 // Una sesión cuenta una sola vez, con su último estado guardado.
 const sessions=new Map();for(const row of compatible)if(!sessions.has(row.sesion))sessions.set(row.sesion,row);
 const items=Array.isArray(latest.evaluacion?.items)?latest.evaluacion.items:[];
 const issues=items.filter(i=>i.correcta!==true).map(item=>{
  const failed=[...sessions.values()].filter(r=>(r.evaluacion?.items||[]).some(i=>i.id===item.id&&i.correcta===false));
  return {id:item.id,pregunta:item.pregunta,estado:item.correcta===false?'por_corregir':'pendiente',sesiones_con_error:failed.length,repetido:item.correcta===false&&failed.length>=2};
 });
 const first=compatible.at(-1),earlier=compatible.slice(1);
 const recovered=items.filter(i=>i.correcta===true&&earlier.some(r=>(r.evaluacion?.items||[]).some(x=>x.id===i.id&&x.correcta===false))).length;
 return {limite:LIMIT,registros:rows.length,version,sesiones:sessions.size,reciente:latest.id,inicial_muestra:first.id,fecha_inicial:first.creado,
  recuperados:recovered,incidencias:issues,items_disponibles:items.length>0};
}
module.exports={analyze,LIMIT};
