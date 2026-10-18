const router=require('express').Router();const pool=require('../db');const jwt=require('jsonwebtoken');const {verificarToken,permitirRoles}=require('../middlewares/authMiddleware');const {metadata,tableFor,keysFor,where,quote,safeRow,planDeletion}=require('../services/superAdminService');
router.use(verificarToken,permitirRoles('admin'));
const actor=req=>String(req.usuario.id_usuario);
const failure=(res,e)=>res.status(409).json({ok:false,mensaje:e.code==='23503'?'Revisa los registros relacionados y sus identificadores; la operación afecta una relación de la base de datos.':e.code==='23505'?'Ese valor ya está registrado.':e.code==='40001'?'Los datos cambiaron; vuelve a revisar la operación.':e.code==='23502'?'Completa todos los campos obligatorios.':e.code==='22P02'?'Revisa los tipos de datos de los campos.':e.code==='23514'?'El valor no está permitido; revisa el estado, tipo o URL.':e.code==='22001'?'Un campo excede la longitud permitida.':e.code?'No se pudo completar la operación; no se modificaron los datos.':e.message});


router.get('/configuracion',async(req,res)=>{try{const r=await pool.query('SELECT institucion,ciclo FROM public.mathnova_configuracion WHERE id=1');res.json({ok:true,configuracion:r.rows[0]||{institucion:'MathNova',ciclo:''}})}catch(e){failure(res,e)}});
router.put('/configuracion',async(req,res)=>{let db;try{const institucion=String(req.body.institucion||'').trim(),ciclo=String(req.body.ciclo||'').trim();if(!institucion||institucion.length>160||!ciclo||ciclo.length>40)throw Error('Revisa la institución y el ciclo escolar.');db=await pool.connect();await db.query('BEGIN');await db.query('UPDATE public.mathnova_configuracion SET institucion=$1,ciclo=$2 WHERE id=1',[institucion,ciclo]);await db.query(`INSERT INTO public.mathnova_admin_auditoria(actor,accion,detalle) VALUES($1,'configuracion',$2::jsonb)`,[actor(req),JSON.stringify({institucion,ciclo})]);await db.query('COMMIT');res.json({ok:true,mensaje:'Configuración guardada.'})}catch(e){if(db)await db.query('ROLLBACK');failure(res,e)}finally{db?.release()}});

router.get('/resumen',async(req,res)=>{try{
 const m=await metadata(pool),totales=[];
 for(const t of m.tables.filter(t=>t.pk.length&&!['mathnova_admin_auditoria','mathnova_configuracion'].includes(t.table_name))){const r=await pool.query(`SELECT COUNT(*)::int AS total FROM public.${quote(t.table_name)}`);totales.push({tabla:t.table_name,total:r.rows[0].total});}
 const usuarios=(await pool.query(`SELECT rol,estado,COUNT(*)::int AS total FROM public.registro GROUP BY rol,estado ORDER BY rol,estado`)).rows;
 res.json({ok:true,totales,usuarios,fecha:new Date().toISOString()});
}catch(e){failure(res,e)}});
router.get('/estructura/:table',async(req,res)=>{try{
 const m=await metadata(pool),t=tableFor(m,req.params.table);
 const cols=(await pool.query(`SELECT column_name,data_type,is_nullable,column_default,is_generated,is_identity,character_maximum_length FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,[t.table_name])).rows;
 res.json({ok:true,pk:t.pk,columnas:cols.filter(c=>!/password|contrasena|token|secret|clave/i.test(c.column_name)),relaciones:m.fks.filter(f=>f.child===t.table_name&&f.child_schema==='public')});
}catch(e){failure(res,e)}});
router.get('/exportar/:table',async(req,res)=>{try{
 const m=await metadata(pool),t=tableFor(m,req.params.table),q=String(req.query.q||'').trim().slice(0,200);
 const r=await pool.query(`SELECT * FROM public.${quote(t.table_name)} ${q?'WHERE strpos(lower(row_to_json('+quote(t.table_name)+')::text),lower($1))>0':''} ORDER BY ${t.pk.map(quote).join(',')} LIMIT 100001`,q?[q]:[]);
 if(r.rows.length>100000)throw Error('El reporte supera 100000 registros; utiliza una búsqueda más específica.');
 const rows=r.rows.map(safeRow),cols=(await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,[t.table_name])).rows.map(c=>c.column_name).filter(k=>!/password|contrasena|token|secret|clave/i.test(k));
 const cell=v=>{let s=v==null?'':typeof v==='object'?JSON.stringify(v):String(v);if(/^(\s*[=+@\-]|[\t\r\n])/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 res.type('text/csv').attachment(t.table_name+'.csv').send('\uFEFF'+[cols,...rows.map(row=>cols.map(c=>row[c]))].map(row=>row.map(cell).join(',')).join('\r\n'));
}catch(e){failure(res,e)}});
router.post('/registro/:table',async(req,res)=>{let db;try{
 db=await pool.connect();await db.query('BEGIN');const m=await metadata(db),t=tableFor(m,req.params.table);
 if(['registro','roles','login'].includes(t.table_name))throw Error('Crea las cuentas en el formulario de usuarios. Los roles y accesos se generan por el sistema.');
 const cols=(await db.query(`SELECT column_name,column_default,is_generated,is_identity FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,[t.table_name])).rows;
 const data=req.body.campos;if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Datos de registro inválidos.');const fields=Object.keys(data);
 if(!fields.length||fields.length>60||fields.some(k=>/password|contrasena|token|secret|clave/i.test(k)||!cols.some(c=>c.column_name===k&&c.is_generated==='NEVER'&&c.is_identity!=='ALWAYS')||t.pk.includes(k)&&cols.find(c=>c.column_name===k).column_default))throw Error('Campos no disponibles para creación.');
 const r=await db.query(`INSERT INTO public.${quote(t.table_name)} (${fields.map(quote).join(',')}) VALUES(${fields.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`,fields.map(k=>data[k]));
 await db.query(`INSERT INTO public.mathnova_admin_auditoria(actor,accion,detalle) VALUES($1,'crear_registro',$2::jsonb)`,[actor(req),JSON.stringify({table:t.table_name,key:Object.fromEntries(t.pk.map(k=>[k,r.rows[0][k]]))})]);await db.query('COMMIT');res.status(201).json({ok:true,registro:safeRow(r.rows[0])});
}catch(e){if(db)await db.query('ROLLBACK');failure(res,e)}finally{db?.release()}});

router.get('/tablas',async(req,res)=>{try{const m=await metadata(pool);res.json({ok:true,tablas:m.tables.filter(t=>t.pk.length&&!['mathnova_admin_auditoria','mathnova_configuracion'].includes(t.table_name))});}catch(e){failure(res,e)}});
router.get('/registros/:table',async(req,res)=>{try{const m=await metadata(pool),t=tableFor(m,req.params.table);const page=Math.max(0,Math.min(100000,Math.trunc(Number(req.query.page)||0))),q=String(req.query.q||'').trim().slice(0,200);const condition=q?'WHERE strpos(lower(row_to_json('+quote(t.table_name)+')::text),lower($1))>0':'';const params=q?[q]:[];const total=Number((await pool.query(`SELECT COUNT(*) AS n FROM public.${quote(t.table_name)} ${condition}`,params)).rows[0].n);const rows=(await pool.query(`SELECT * FROM public.${quote(t.table_name)} ${condition} ORDER BY ${t.pk.map(quote).join(',')} LIMIT 50 OFFSET $${params.length+1}`,[...params,page*50])).rows;res.json({ok:true,pk:t.pk,total,registros:rows.map(safeRow)});}catch(e){failure(res,e)}});
router.post('/revisar-eliminacion',async(req,res)=>{let db;try{db=await pool.connect();await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');const p=await planDeletion(db,await metadata(db),req.body.table,req.body.key,actor(req));const token=jwt.sign({kind:'delete-preview',sub:actor(req),table:req.body.table,key:req.body.key,hash:p.hash},process.env.JWT_SECRET,{expiresIn:'5m',algorithm:'HS256'});await db.query('COMMIT');res.json({ok:true,resumen:p.summary,total:p.nodes.length,token});}catch(e){if(db)await db.query('ROLLBACK');failure(res,e)}finally{db?.release()}});
router.post('/eliminar',async(req,res)=>{let db;try{
 if(req.body.confirmacion!=='ELIMINAR')throw Error('Escribe ELIMINAR para confirmar.');let claims;try{claims=jwt.verify(req.body.token,process.env.JWT_SECRET,{algorithms:['HS256']});}catch{throw Error('La revisión expiró; vuelve a revisar la eliminación.');}if(claims.kind!=='delete-preview'||claims.sub!==actor(req))throw Error('Revisión incompatible con esta sesión.');
 db=await pool.connect();await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');await db.query('SET LOCAL lock_timeout=\'5s\'');const m=await metadata(db);
 // Las tablas involucradas se bloquean en orden para verificar y borrar el mismo conjunto.
 const first=await planDeletion(db,m,claims.table,claims.key,actor(req));const names=[...new Set(['registro',...first.nodes.map(n=>n.table)])].sort();for(const name of names)await db.query(`LOCK TABLE public.${quote(name)} IN SHARE ROW EXCLUSIVE MODE`);
 const p=await planDeletion(db,m,claims.table,claims.key,actor(req));if(p.hash!==claims.hash)throw Error('Los datos cambiaron desde la revisión; vuelve a revisarlos.');
 for(const n of p.nodes){const t=tableFor(m,n.table);await db.query(`DELETE FROM public.${quote(n.table)} WHERE ${where(t.pk)}`,keysFor(t,n.key));}
 await db.query(`INSERT INTO public.mathnova_admin_auditoria(actor,accion,detalle) VALUES($1,'eliminar',$2::jsonb)`,[actor(req),JSON.stringify({table:claims.table,key:claims.key,resumen:p.summary})]);await db.query('COMMIT');res.json({ok:true,mensaje:'Registros eliminados.',total:p.nodes.length});
 }catch(e){if(db)await db.query('ROLLBACK');failure(res,e)}finally{db?.release()}});
router.patch('/registro/:table',async(req,res)=>{let db;try{db=await pool.connect();await db.query('BEGIN');const m=await metadata(db),t=tableFor(m,req.params.table),key=req.body.key,values=keysFor(t,key);if(['registro','roles','login'].includes(t.table_name))throw Error('Edita usuarios y docentes desde sus formularios de gestión.');const columns=(await db.query(`SELECT column_name,is_generated FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,[t.table_name])).rows;const fields=Object.keys(req.body.cambios||{});if(!fields.length||fields.length>40||fields.some(k=>t.pk.includes(k)||/password|contrasena|token|secret|clave/i.test(k)||!columns.some(c=>c.column_name===k&&c.is_generated==='NEVER')))throw Error('Campos no editables.');const params=fields.map(k=>req.body.cambios[k]);const updated=await db.query(`UPDATE public.${quote(t.table_name)} SET ${fields.map((k,i)=>quote(k)+'=$'+(i+1)).join(',')} WHERE ${t.pk.map((k,i)=>quote(k)+'=$'+(params.length+i+1)).join(' AND ')} RETURNING *`,[...params,...values]);if(!updated.rowCount)throw Error('Registro no encontrado.');await db.query(`INSERT INTO public.mathnova_admin_auditoria(actor,accion,detalle) VALUES($1,'editar',$2::jsonb)`,[actor(req),JSON.stringify({table:t.table_name,key,campos:fields})]);await db.query('COMMIT');res.json({ok:true,registro:safeRow(updated.rows[0])});}catch(e){if(db)await db.query('ROLLBACK');failure(res,e)}finally{db?.release()}});

router.post('/usuario/:id/password-temporal',async(req,res)=>{let db;try{
 const id=String(req.params.id);if(!/^[1-9]\d*$/.test(id)||req.body.confirmacion!=='RESTABLECER')throw Error('Confirma RESTABLECER para generar una contraseña nueva.');
 db=await pool.connect();await db.query('BEGIN');const user=(await db.query('SELECT id_usuario,nombre_completo,rol FROM public.registro WHERE id_usuario=$1 FOR UPDATE',[id])).rows[0];if(!user)throw Error('Usuario no encontrado.');
 const password=require('node:crypto').randomBytes(9).toString('base64url')+'7!';const hash=await require('bcryptjs').hash(password,12);
 await db.query('UPDATE public.registro SET password_hash=$1,fecha_actualizacion=NOW() WHERE id_usuario=$2',[hash,id]);
 await db.query(`INSERT INTO public.mathnova_admin_auditoria(actor,accion,detalle) VALUES($1,'restablecer_password',$2::jsonb)`,[actor(req),JSON.stringify({id_usuario:id})]);await db.query('COMMIT');res.set('Cache-Control','no-store').json({ok:true,nombre:user.nombre_completo,password,mensaje:'Contraseña restablecida. Comparte la nueva contraseña con el usuario.'});
}catch(e){if(db)await db.query('ROLLBACK');failure(res,e)}finally{db?.release()}});

router.post('/usuario',async(req,res)=>{let db;try{
 const bcrypt=require('bcryptjs');const b=req.body||{},id=b.id_usuario?String(b.id_usuario):null;const name=String(b.nombre_completo||'').trim(),email=String(b.correo||'').trim().toLowerCase(),username=String(b.usuario||'').trim().toLowerCase()||null,role=b.rol,password=b.password;
 if(id&&!/^[1-9]\d*$/.test(id))throw Error('Identificador de usuario inválido.');
 if(!name||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>120||(username&&username.length>60)||!['admin','docente','estudiante'].includes(role)||typeof b.estado!=='boolean')throw Error('Revisa los datos y el rol del usuario.');
 if((!id&&!password)||(password&&(typeof password!=='string'||password.length<8||Buffer.byteLength(password)>72)))throw Error('La contraseña nueva debe tener al menos ocho caracteres y máximo 72 bytes.');
 db=await pool.connect();await db.query('BEGIN');await db.query('LOCK TABLE public.registro IN SHARE ROW EXCLUSIVE MODE');
 if(id===actor(req)&&(role!=='admin'||!b.estado))throw Error('No puedes desactivar ni quitar permisos a tu propia cuenta.');
 const old=id?(await db.query('SELECT * FROM public.registro WHERE id_usuario=$1',[id])).rows[0]:null;if(id&&!old)throw Error('Usuario no encontrado.');
 if(old&&['admin','administrador'].includes(old.rol)&&old.estado&&(role!=='admin'||!b.estado)){const n=Number((await db.query("SELECT COUNT(*) AS n FROM public.registro WHERE rol IN ('admin','administrador') AND estado=true")).rows[0].n);if(n<=1)throw Error('Debe conservarse un administrador activo.');}
 const duplicate=(await db.query('SELECT 1 FROM public.registro WHERE (lower(trim(correo))=$1 OR ($2::text IS NOT NULL AND lower(trim(usuario))=$2)) AND ($3::bigint IS NULL OR id_usuario<>$3) LIMIT 1',[email,username,id])).rows.length;if(duplicate)throw Error('El correo o usuario ya está registrado.');
 const hash=password?await bcrypt.hash(password,12):old.password_hash,roleId={docente:1,estudiante:2,admin:3}[role];
 const result=id?await db.query('UPDATE public.registro SET nombre_completo=$1,correo=$2,usuario=$3,password_hash=$4,rol=$5,role_id=$6,estado=$7,fecha_actualizacion=NOW() WHERE id_usuario=$8 RETURNING *',[name,email,username,hash,role,roleId,b.estado,id]):await db.query('INSERT INTO public.registro(nombre_completo,correo,usuario,password_hash,rol,role_id,estado,acepto_terminos) VALUES($1,$2,$3,$4,$5,$6,$7,true) RETURNING *',[name,email,username,hash,role,roleId,b.estado]);
 await db.query("INSERT INTO public.mathnova_admin_auditoria(actor,accion,detalle) VALUES($1,$2,$3::jsonb)",[actor(req),id?'editar_usuario':'crear_usuario',JSON.stringify({id_usuario:result.rows[0].id_usuario,rol:role})]);await db.query('COMMIT');res.json({ok:true,usuario:safeRow(result.rows[0])});
 }catch(e){if(db)await db.query('ROLLBACK');failure(res,e)}finally{db?.release()}});
module.exports=router;
