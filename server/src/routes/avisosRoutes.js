const router=require('express').Router();const {verificarToken}=require('../middlewares/authMiddleware');const s=require('../services/aulaService');const crypto=require('node:crypto');
router.use(verificarToken);router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next()});
const route=fn=>async(req,res)=>{try{await fn(req,res)}catch(e){res.status(e.status||503).json({ok:false,mensaje:e.status?e.message:'No se pudieron consultar los avisos. Revisa la conexión del servidor.'})}};
router.get('/pendientes',route(async(req,res)=>{
 if(req.usuario.rol!=='estudiante')return res.json({ok:true,avisos:[]});
 await s.pool.query('INSERT INTO public.mathnova_presencia(id_usuario) VALUES($1) ON CONFLICT(id_usuario) DO UPDATE SET ultima_conexion=now()',[req.usuario.id_usuario]);
 const r=await s.pool.query(`SELECT a.id,a.titulo,a.mensaje,a.nombre_emisor,a.creado FROM public.mathnova_aviso_destinos d JOIN public.mathnova_avisos a ON a.id=d.aviso WHERE d.alumno=$1 AND d.enterado IS NULL ORDER BY a.id LIMIT 50`,[req.usuario.id_usuario]);res.json({ok:true,avisos:r.rows});
}));
router.post('/:aviso/enterado',route(async(req,res)=>{
 if(req.usuario.rol!=='estudiante')throw s.error(403,'Solo el alumno destinatario puede confirmar el aviso.');
 const r=await s.pool.query('UPDATE public.mathnova_aviso_destinos SET enterado=COALESCE(enterado,now()) WHERE aviso=$1 AND alumno=$2 RETURNING enterado',[s.id(req.params.aviso),req.usuario.id_usuario]);if(!r.rows.length)throw s.error(404,'Este aviso no está dirigido a tu cuenta.');res.json({ok:true,enterado:r.rows[0].enterado});
}));
router.use((req,res,next)=>{try{s.docente(req.usuario);next()}catch(e){res.status(e.status).json({ok:false,mensaje:e.message})}});
router.get('/conectados',route(async(req,res)=>{
 const r=await s.pool.query(`SELECT DISTINCT r.id_usuario,r.nombre_completo,g.id_grupo,g.nombre_grupo,p.ultima_conexion FROM public.registro r JOIN public.grupo_alumnos ga ON ga.id_alumno=r.id_usuario AND ga.estado=true JOIN public.grupos g ON g.id_grupo=ga.id_grupo LEFT JOIN public.mathnova_presencia p ON p.id_usuario=r.id_usuario WHERE r.estado=true AND lower(r.rol) IN ('alumno','estudiante','student','usuario') AND ($1::boolean OR g.id_profesor=$2) ORDER BY g.nombre_grupo,r.nombre_completo`,[req.usuario.rol==='admin',req.usuario.id_usuario]);res.json({ok:true,alumnos:r.rows.map(a=>({...a,conectado:!!a.ultima_conexion&&(Date.now()-new Date(a.ultima_conexion).getTime()<90000)}))});
}));
router.get('/enviados',route(async(req,res)=>{
 const r=await s.pool.query(`SELECT a.id,a.titulo,a.mensaje,a.creado,COUNT(d.alumno)::int AS destinatarios,COUNT(d.enterado)::int AS enterados FROM public.mathnova_avisos a JOIN public.mathnova_aviso_destinos d ON d.aviso=a.id WHERE ($1::boolean OR a.emisor=$2) GROUP BY a.id ORDER BY a.id DESC LIMIT 100`,[req.usuario.rol==='admin',req.usuario.id_usuario]);res.json({ok:true,avisos:r.rows});
}));
router.get('/:aviso/respuestas',route(async(req,res)=>{
 const id=s.id(req.params.aviso);const a=await s.pool.query('SELECT emisor FROM public.mathnova_avisos WHERE id=$1',[id]);if(!a.rows.length)throw s.error(404,'El aviso no existe.');if(req.usuario.rol!=='admin'&&String(a.rows[0].emisor)!==String(req.usuario.id_usuario))throw s.error(403,'Este aviso pertenece a otro docente.');
 const r=await s.pool.query('SELECT r.id_usuario,r.nombre_completo,d.enterado FROM public.mathnova_aviso_destinos d JOIN public.registro r ON r.id_usuario=d.alumno WHERE d.aviso=$1 ORDER BY r.nombre_completo',[id]);res.json({ok:true,alumnos:r.rows});
}));
router.post('/',route(async(req,res)=>{
 const titulo=typeof req.body.titulo==='string'?req.body.titulo.trim():'';const mensaje=typeof req.body.mensaje==='string'?req.body.mensaje.trim():'';const solicitud=String(req.body.solicitud||'');
 if(!titulo||titulo.length>80||!mensaje||mensaje.length>1000||!/^[-a-zA-Z0-9]{8,80}$/.test(solicitud))throw s.error(400,'Escribe un título (máximo 80 caracteres) y mensaje (máximo 1000).');
 const group=s.id(req.body.grupo);const alumno=req.body.alumno==null||req.body.alumno===''?null:s.id(req.body.alumno);const huella=crypto.createHash('sha256').update(JSON.stringify({titulo,mensaje,group,alumno})).digest('hex');
 const db=await s.pool.connect();try{await db.query('BEGIN');await s.grupo(req.usuario,group,db);
 const prior=await db.query('SELECT id,huella FROM public.mathnova_avisos WHERE emisor=$1 AND solicitud=$2',[req.usuario.id_usuario,solicitud]);
 if(prior.rows.length){if(prior.rows[0].huella!==huella)throw s.error(409,'La solicitud ya corresponde a otro aviso.');await db.query('COMMIT');return res.json({ok:true,id:prior.rows[0].id,mensaje:'El aviso ya fue enviado.'})}
 const recipients=await db.query(`SELECT DISTINCT r.id_usuario FROM public.grupo_alumnos ga JOIN public.registro r ON r.id_usuario=ga.id_alumno JOIN public.mathnova_presencia p ON p.id_usuario=r.id_usuario WHERE ga.id_grupo=$1 AND ga.estado=true AND r.estado=true AND lower(r.rol) IN ('alumno','estudiante','student','usuario') AND ($2::bigint IS NULL OR r.id_usuario=$2) AND p.ultima_conexion>now()-interval '90 seconds'`,[group,alumno]);
 if(!recipients.rows.length)throw s.error(409,'No hay alumnos conectados entre los destinatarios seleccionados. Actualiza la lista.');
 const a=await db.query(`INSERT INTO public.mathnova_avisos(emisor,nombre_emisor,titulo,mensaje,solicitud,huella) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(emisor,solicitud) DO NOTHING RETURNING id`,[req.usuario.id_usuario,req.usuario.nombre_completo||'Docente',titulo,mensaje,solicitud,huella]);
 let id=a.rows[0]?.id;if(!id){const retry=await db.query('SELECT id,huella FROM public.mathnova_avisos WHERE emisor=$1 AND solicitud=$2',[req.usuario.id_usuario,solicitud]);if(retry.rows[0].huella!==huella)throw s.error(409,'La solicitud ya corresponde a otro aviso.');id=retry.rows[0].id}else for(const r of recipients.rows)await db.query('INSERT INTO public.mathnova_aviso_destinos(aviso,alumno) VALUES($1,$2)',[id,r.id_usuario]);
 await db.query('COMMIT');res.json({ok:true,id,destinatarios:recipients.rows.length,mensaje:'Aviso enviado. Puedes consultar quién pulsó Enterado.'});
 }catch(e){await db.query('ROLLBACK');throw e}finally{db.release()}
}));module.exports=router;
