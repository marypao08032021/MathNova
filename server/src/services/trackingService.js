const s=require('./seguimientoService');
const pedagogical=require('./pedagogicalAnalysis');
// Solo se transfieren resúmenes; las respuestas completas se consultan en el historial autorizado.
async function resumen(user,group,student=null){
 const focused=student===null?null:s.id(student);
 const g=await s.grupo(user,group);
 const db=await s.pool.connect();
 try{
  await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  // Revalidar la propiedad dentro de la misma instantánea que las matrículas y evidencias.
  await s.grupo(user,group,db);
  if(focused)await s.miembro(user,group,focused,db);
  const alumnos=(await db.query(`SELECT DISTINCT r.id_usuario,r.nombre_completo FROM public.grupo_alumnos ga
   JOIN public.registro r ON r.id_usuario=ga.id_alumno
   WHERE ga.id_grupo=$1 AND ga.estado=true AND r.estado=true AND ($2::bigint IS NULL OR r.id_usuario=$2) ORDER BY r.nombre_completo,r.id_usuario`,[g.id_grupo,focused])).rows;
  const ids=alumnos.map(a=>a.id_usuario);
  const rows=ids.length?(await db.query(`WITH ranked AS (
   SELECT alumno,actividad,id,tipo,creado,orden,
    jsonb_build_object('id',id,'tipo',tipo,'fecha',creado,'aciertos',evaluacion->'aciertos',
      'total',evaluacion->'total','precision',evaluacion->'precision','completada',evaluacion->'completada',
      'pista_declarada',evaluacion->'pista_declarada','retroalimentacion_vista',evaluacion->'retroalimentacion_vista') AS dato,
    row_number() OVER(PARTITION BY alumno,actividad ORDER BY orden) AS primero,
    row_number() OVER(PARTITION BY alumno,actividad ORDER BY orden DESC) AS ultimo
   FROM public.mathnova_intentos_piloto WHERE alumno=ANY($1::bigint[])
  ) SELECT alumno,actividad,count(*)::int AS registros,
    count(*) FILTER(WHERE tipo='cierre')::int AS cierres,
    (jsonb_agg(dato) FILTER(WHERE primero=1))->0 AS inicial,
    (jsonb_agg(dato) FILTER(WHERE ultimo=1))->0 AS reciente
   FROM ranked GROUP BY alumno,actividad`,[ids])).rows:[];
  const progreso=ids.length?(await db.query(`SELECT id_usuario,actividad_codigo,aciertos,total_preguntas,precision,completada,fecha_ultimo_intento
   FROM public.actividad_progreso WHERE id_usuario=ANY($1::bigint[]) ORDER BY fecha_ultimo_intento DESC,id_progreso DESC`,[ids])).rows:[];
  const revisiones=ids.length?(await db.query(`SELECT alumno,actividad,version,actualizado,publicado_en,
   (publicado IS NULL OR contenido IS DISTINCT FROM publicado OR actualizado>publicado_en) AS borrador_pendiente,
   publicado->'calificacion' AS calificacion,publicado IS NOT NULL AS publicada
   FROM public.mathnova_revisiones WHERE grupo=$1 AND alumno=ANY($2::bigint[])`,[g.id_grupo,ids])).rows:[];
  const recent=ids.length?(await db.query(`WITH numbered AS (
   SELECT alumno,actividad,id,sesion,version,creado,evaluacion,orden,
    row_number() OVER(PARTITION BY alumno,actividad ORDER BY orden DESC) AS position
   FROM public.mathnova_intentos_piloto WHERE alumno=ANY($1::bigint[])
  ) SELECT alumno,actividad,id,sesion,version,creado,evaluacion FROM numbered
   WHERE position<=$2 ORDER BY alumno,actividad,orden DESC`,[ids,pedagogical.LIMIT])).rows:[];
  let informe;
  if(focused){
   const alumno=(await db.query('SELECT nombre_completo,grado,escuela,fecha_registro FROM public.registro WHERE id_usuario=$1',[focused])).rows[0];
   const valoraciones=(await db.query(`SELECT actividad,nombre_docente,publicado_en,
    publicado->'retroalimentacion' AS retroalimentacion,publicado->'calificacion' AS calificacion,
    publicado->'rubrica' AS rubrica,publicado->'evidencia'->'id_progreso' AS evidencia_id,
    publicado->'evidencia'->'aciertos' AS aciertos,publicado->'evidencia'->'total_preguntas' AS total,
    publicado->'evidencia'->'fecha_ultimo_intento' AS fecha_evidencia
    FROM public.mathnova_revisiones WHERE grupo=$1 AND alumno=$2 AND publicado IS NOT NULL`,[g.id_grupo,focused])).rows;
   const intervenciones=(await db.query(`SELECT v.*,
    i.evaluacion->'aciertos' AS aciertos_iniciales,i.evaluacion->'total' AS total_inicial,
    p.evaluacion->'aciertos' AS aciertos_posteriores,p.evaluacion->'total' AS total_posterior
    FROM public.mathnova_intervenciones v
    LEFT JOIN public.mathnova_intentos_piloto i ON i.id=v.inicial AND i.alumno=v.alumno AND i.actividad=v.actividad
    LEFT JOIN public.mathnova_intentos_piloto p ON p.id=v.posterior AND p.alumno=v.alumno AND p.actividad=v.actividad
    WHERE v.grupo=$1 AND v.alumno=$2 ORDER BY v.creado,v.id`,[g.id_grupo,focused])).rows;
   informe={alumno,valoraciones,intervenciones};
  }
  await db.query('COMMIT');
  const entries=new Map();const key=(a,c)=>String(a)+':'+c;
  for(const r of rows)if(s.codigos.has(r.actividad))entries.set(key(r.alumno,r.actividad),{...r,alumno:String(r.alumno)});
  // Los datos anteriores conservan su carácter de mejor resultado, sin inventar intentos originales.
  for(const p of progreso){const code=s.codigo(p.actividad_codigo);if(!s.codigos.has(code))continue;const k=key(p.id_usuario,code);let e=entries.get(k);
   if(!e){e={alumno:String(p.id_usuario),actividad:code,registros:0,cierres:0,inicial:null,reciente:null};entries.set(k,e)}
   if(!e.resumen_anterior)e.resumen_anterior={aciertos:p.aciertos,total:p.total_preguntas,precision:p.precision,completada:p.completada,fecha:p.fecha_ultimo_intento};
  }
  for(const r of revisiones){const k=key(r.alumno,r.actividad);if(!s.codigos.has(r.actividad))continue;
   if(!entries.has(k))entries.set(k,{alumno:String(r.alumno),actividad:r.actividad,registros:0,cierres:0,inicial:null,reciente:null});
   entries.get(k).revision={publicada:r.publicada,calificacion:r.calificacion,publicado_en:r.publicado_en,
    borrador_pendiente:!!r.borrador_pendiente};
  }
  const samples=new Map();for(const row of recent){const k=key(row.alumno,row.actividad);if(!samples.has(k))samples.set(k,[]);samples.get(k).push(row)}
  for(const [k,e] of entries)e.analisis=pedagogical.analyze(samples.get(k)||[]);
  return {ok:true,grupo:g,alumnos,...(informe?{informe}:{}),catalogo:s.catalogo,seguimiento:[...entries.values()],consultado:new Date().toISOString()};
 }catch(e){await db.query('ROLLBACK').catch(()=>{});throw e}finally{db.release()}
}
module.exports={resumen};
