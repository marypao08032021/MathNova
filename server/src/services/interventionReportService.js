const s=require('./seguimientoService');
const outcomes={avance_observado:'Avance observado',dificultad_persistente:'La dificultad persiste',evidencia_insuficiente:'Evidencia insuficiente para concluir'};
function cell(value){let text=value==null?'':value instanceof Date?value.toISOString():String(value);if(/^[\s\uFEFF]*[=+\-@]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"'}
function toCsv(rows,group,date){const columns=['Grupo','Consulta UTC','Alumno','Actividad','Contenido','PDA de referencia (puede ser síntesis)','Estado de la intervención','Necesidad observada','Acción docente','Registrada UTC','Docente que registró','Intento inicial','Aciertos iniciales','Total inicial','Intento posterior','Aciertos posteriores','Total posterior','Valoración docente','Observación de revisión','Revisada UTC','Identificador de la intervención','Código de actividad'];return '\uFEFF'+[columns,...rows.map(r=>[group,date,r.nombre_completo,r.titulo,r.contenido,r.pda,r.revisado?'Revisada':'Pendiente de revisión',r.necesidad,r.accion,r.creado,r.nombre_docente,r.inicial,r.aciertos_iniciales,r.total_inicial,r.posterior,r.aciertos_posteriores,r.total_posterior,outcomes[r.resultado]||'',r.observacion,r.revisado,r.id,r.actividad])].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n'}
async function report(user,group,query){
 for(const key of ['estado','alumno','actividad','pagina','formato'])if(query[key]!==undefined&&typeof query[key]!=='string')throw s.error(400,'Parámetro de consulta inválido.');
 const estado=query.estado||'pendientes';if(!['todas','pendientes','revisadas'].includes(estado))throw s.error(400,'Filtro de estado inválido.');
 const alumno=query.alumno?s.id(query.alumno):null,actividad=query.actividad?s.codigo(query.actividad):null;
 if(actividad&&!s.codigos.has(actividad))throw s.error(400,'Actividad no reconocida.');
 const page=Number(query.pagina||1);if(!Number.isSafeInteger(page)||page<1||page>1000000)throw s.error(400,'Página inválida.');
 const html=query.formato==='html',csv=query.formato==='csv',complete=html||csv;if(html&&!alumno)throw s.error(400,'Selecciona un alumno para el informe individual.');if(query.formato&&!['csv','html'].includes(query.formato))throw s.error(400,'Formato inválido.');
 await s.grupo(user,group);const db=await s.pool.connect();
 try{await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');const g=await s.grupo(user,group,db);if(html)await s.miembro(user,group,alumno,db);
 const source=`FROM public.mathnova_intervenciones v JOIN public.registro r ON r.id_usuario=v.alumno`;
 const filter=` WHERE v.grupo=$1 AND r.estado=true AND EXISTS(SELECT 1 FROM public.grupo_alumnos ga WHERE ga.id_grupo=v.grupo AND ga.id_alumno=v.alumno AND ga.estado=true)
 AND ($2::bigint IS NULL OR v.alumno=$2) AND ($3::text IS NULL OR v.actividad=$3)`;
 const where=source+filter;
 const params=[g.id_grupo,alumno,actividad];const stats=(await db.query(`SELECT count(*)::int AS todas,count(*) FILTER(WHERE v.revisado IS NULL)::int AS pendientes,count(*) FILTER(WHERE v.revisado IS NOT NULL)::int AS revisadas ${where}`,params)).rows[0];
 const total=stats[estado];const pagina=Math.min(page,Math.max(1,Math.ceil(total/50)));
 const rows=(await db.query(`SELECT v.*,r.nombre_completo,
 i.evaluacion->'aciertos' AS aciertos_iniciales,i.evaluacion->'total' AS total_inicial,
 p.evaluacion->'aciertos' AS aciertos_posteriores,p.evaluacion->'total' AS total_posterior
 ${source} LEFT JOIN public.mathnova_intentos_piloto i ON i.id=v.inicial
 LEFT JOIN public.mathnova_intentos_piloto p ON p.id=v.posterior ${filter} AND ($4::text='todas' OR ($4='pendientes' AND v.revisado IS NULL) OR ($4='revisadas' AND v.revisado IS NOT NULL))
 ORDER BY v.creado ASC,v.id ASC ${complete?'':'LIMIT 50 OFFSET $5'}`,[...params,estado,...(complete?[]:[(pagina-1)*50])])).rows.map(r=>({...r,titulo:s.catalogo.find(a=>a.codigo===r.actividad)?.titulo||r.actividad}));
 const alumnos=csv?[]:(await db.query(`SELECT DISTINCT r.id_usuario,r.nombre_completo FROM public.grupo_alumnos ga JOIN public.registro r ON r.id_usuario=ga.id_alumno WHERE ga.id_grupo=$1 AND ga.estado=true AND r.estado=true ORDER BY r.nombre_completo,r.id_usuario`,[g.id_grupo])).rows;
 await db.query('COMMIT');const consultado=new Date().toISOString();return html?{html:require('./individualReport')(rows,g,alumnos.find(a=>String(a.id_usuario)===String(alumno)),consultado),alumno}:csv?{csv:toCsv(rows,g.nombre_grupo,consultado),grupo:g.id_grupo}:{ok:true,grupo:g,alumnos,catalogo:s.catalogo,intervenciones:rows,resumen:stats,total,pagina,paginas:Math.max(1,Math.ceil(total/50)),consultado};
 }catch(e){await db.query('ROLLBACK').catch(()=>{});throw e}finally{db.release()}}
module.exports={report,toCsv};
