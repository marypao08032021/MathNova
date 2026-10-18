import type {PedagogicalAnalysis} from './PedagogicalInsight';
export type MapStudent={id_usuario:string;nombre_completo:string};
export type MapEvidence={alumno:string;actividad:string;analisis?:PedagogicalAnalysis|null};
export type MapMember={id:string;nombre:string;intento:string;estado:'por_corregir'|'pendiente';repetido:boolean};
export type MapItem={key:string;id:string;pregunta:string;version:string;errores:number;pendientes:number;repetidos:number;alumnos:MapMember[]};
export function groupIssues(students:MapStudent[],evidence:MapEvidence[],activity:string){
 const roster=new Map(students.map(a=>[String(a.id_usuario),a]));
 const records=new Map(evidence.filter(r=>r.actividad===activity&&roster.has(String(r.alumno))).map(r=>[String(r.alumno),r]));
 const issues=new Map<string,MapItem>();let withDetail=0;
 for(const [student,row] of records){const analysis=row.analisis;if(!analysis?.items_disponibles)continue;withDetail++;
  for(const issue of analysis.incidencias){
   // No unir versiones o enunciados diferentes aunque compartan identificador.
   const key=JSON.stringify([analysis.version,issue.id,issue.pregunta]);
   let entry=issues.get(key);if(!entry){entry={key,id:issue.id,pregunta:issue.pregunta,version:analysis.version,errores:0,pendientes:0,repetidos:0,alumnos:[]};issues.set(key,entry)}
   if(entry.alumnos.some(a=>a.id===student))continue;
   const error=issue.estado==='por_corregir';entry.errores+=Number(error);entry.pendientes+=Number(!error);entry.repetidos+=Number(error&&issue.repetido);
   entry.alumnos.push({id:student,nombre:roster.get(student)!.nombre_completo,intento:analysis.reciente,estado:issue.estado,repetido:error&&issue.repetido});
  }
 }
 const items=[...issues.values()].sort((a,b)=>b.errores-a.errores||b.repetidos-a.repetidos||b.pendientes-a.pendientes||a.pregunta.localeCompare(b.pregunta,'es')||a.key.localeCompare(b.key));
 for(const item of items)item.alumnos.sort((a,b)=>a.nombre.localeCompare(b.nombre,'es')||a.id.localeCompare(b.id));
 return {items,con_detalle:withDetail,sin_detalle:roster.size-withDetail,seleccionados:roster.size};
}
// Todas las celdas se escapan, incluidas las que podrían activar fórmulas en una hoja de cálculo.
function cell(value:unknown){let text=String(value??'');if(/^[\s\uFEFF]*[=+\-@]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'}
export function issuesCsv(items:MapItem[],context:{grupo:string;actividad:string;consultado:string}){
 const rows:unknown[][]=[['Grupo','Actividad','Consulta','Versión','Reactivo','Enunciado','Errores actuales','Sin respuesta evaluable','Errores en varias sesiones','Alumnos con error','Alumnos sin respuesta evaluable','Alcance']];
 for(const item of items)rows.push([context.grupo,context.actividad,context.consultado,item.version,item.id,item.pregunta,item.errores,item.pendientes,item.repetidos,item.alumnos.filter(a=>a.estado==='por_corregir').map(a=>a.nombre).join('; '),item.alumnos.filter(a=>a.estado==='pendiente').map(a=>a.nombre).join('; '),'Último registro guardado; repetición en muestra de hasta 20 registros por alumno. No acredita dominio de PDA.']);
 return '\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n');
}
