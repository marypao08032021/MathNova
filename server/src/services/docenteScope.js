const {AsyncLocalStorage}=require('node:async_hooks');
const context=new AsyncLocalStorage();
function actor(){const u=context.getStore();if(!u)return null;if(u.rol==='admin')return 'admin';if(!/^[1-9]\d*$/.test(String(u.id_usuario)))return null;return String(u.id_usuario);}
function scopeStudent(alias='r'){if(!/^[a-z_][a-z0-9_]*$/.test(alias))throw Error('Alias inválido');const a=actor();return a==='admin'?'true':a?`EXISTS(SELECT 1 FROM public.grupo_alumnos mn_ga JOIN public.grupos mn_g ON mn_g.id_grupo=mn_ga.id_grupo WHERE mn_ga.estado=true AND mn_ga.id_alumno=${alias}.id_usuario AND mn_g.id_profesor=${a})`:'false';}
function scopeGroup(alias='g'){const a=actor();return a==='admin'?'true':a?`${alias}.id_profesor=${a}`:'false';}
module.exports={context,scopeStudent,scopeGroup};
