const pool=require('../db');
const catalogo=require('../config/aulaCatalog');
const codigos=new Set(catalogo.map(a=>a.codigo));
const alias={
 'mathdata-proporcionalidad-inversa':'mathdata-generador-energia','generador-energia-inversa':'mathdata-generador-energia',
 'proporcionalidad-inversa':'mathdata-generador-energia','mathgeometry-rampas':'mathdata-rampas-lanzamiento',
 'rampas-de-lanzamiento':'mathdata-rampas-lanzamiento','rampas-lanzamiento':'mathdata-rampas-lanzamiento',
 'mathdata-tripulacion':'mathdata-encuesta-tripulacion','mathdata-holograma':'mathdata-holograma-reportes'
};
for(const a of catalogo)alias[a.codigo.replace(/^mathnumbers-/,'')]=a.codigo;
function codigo(value){const key=String(value||'').trim().toLowerCase();return alias[key]||key;}
function error(status,mensaje){return Object.assign(new Error(mensaje),{status});}
function id(value){const text=String(value??'');if(!/^[1-9]\d*$/.test(text))throw error(400,'Identificador inválido.');return text;}
function docente(user){if(!['docente','docente_estudiante','admin'].includes(user.rol))throw error(403,'Esta acción requiere una cuenta docente.');}
async function grupo(user,value,db=pool){docente(user);const gid=id(value);const r=await db.query('SELECT id_grupo,nombre_grupo,id_profesor FROM public.grupos WHERE id_grupo=$1',[gid]);const g=r.rows[0];if(!g)throw error(404,'El grupo no existe.');if(user.rol!=='admin'&&String(g.id_profesor)!==String(user.id_usuario))throw error(403,'El grupo pertenece a otro docente.');return g;}
async function permisos(user,db=pool){
 if(user.rol==='admin')return catalogo.map(a=>({...a,permitida:true,motivo:'Superusuario'}));
 if(user.rol!=='estudiante')return catalogo.map(a=>({...a,permitida:false,motivo:'Usa el modo estudiante tester desde el dashboard docente.'}));
 const r=await db.query(`SELECT ga.id_grupo,g.nombre_grupo,p.actividad_codigo,p.habilitada,
  i.actividad_codigo AS individual_codigo,i.habilitada AS individual_habilitada
 FROM public.grupo_alumnos ga JOIN public.grupos g ON g.id_grupo=ga.id_grupo
 LEFT JOIN public.mathnova_acceso_grupo p ON p.id_grupo=ga.id_grupo
 LEFT JOIN public.mathnova_acceso_alumno i ON i.id_grupo=ga.id_grupo AND i.id_alumno=ga.id_alumno
  AND i.actividad_codigo=p.actividad_codigo
 WHERE ga.id_alumno=$1 AND ga.estado=true`,[user.id_usuario]);
 // La consulta independiente incluye excepciones que no tienen permiso grupal previo.
 const ir=await db.query(`SELECT i.actividad_codigo,i.habilitada FROM public.mathnova_acceso_alumno i
 JOIN public.grupo_alumnos ga ON ga.id_grupo=i.id_grupo AND ga.id_alumno=i.id_alumno AND ga.estado=true
 WHERE i.id_alumno=$1`,[user.id_usuario]);
 return catalogo.map(a=>{
  const personal=ir.rows.filter(v=>v.actividad_codigo===a.codigo);
  const denegada=personal.some(v=>v.habilitada===false);
  const permitida=r.rows.length>0&&!denegada&&(personal.some(v=>v.habilitada===true)||r.rows.some(v=>v.actividad_codigo===a.codigo&&v.habilitada===true));
  return {...a,permitida,motivo:permitida?'Habilitada por tu docente':!r.rows.length?'Tu docente debe agregarte a un grupo.':denegada?'Tu docente bloqueó esta actividad para ti.':'Tu docente aún no habilita esta actividad.'};
 });
}
async function comprobar(user,value){const code=codigo(value);if(!codigos.has(code))throw error(400,'Actividad no reconocida.');const found=(await permisos(user)).find(a=>a.codigo===code);if(!found.permitida)throw error(403,found.motivo);return code;}
module.exports={pool,catalogo,codigos,codigo,error,id,docente,grupo,permisos,comprobar};
