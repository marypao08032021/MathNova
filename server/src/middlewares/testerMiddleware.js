const jwt=require('jsonwebtoken');const {verificarToken}=require('./authMiddleware');const tester=require('../services/testerSession');
const activityPath=/^\/(proporcionalidad|rampas|tripulacion|holograma|sensor|nucleo|oraculo|progreso-general)(\/|$)/;
module.exports=async function testerMiddleware(req,res,next){
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];if(!token)return next();let claims;
 try{claims=jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256']})}catch{if(jwt.decode(token)?.mode==='tester')return res.status(401).json({ok:false,mensaje:'Sesión tester inválida o expirada.'});return next()}
 if(typeof claims==='string'||claims.mode!=='tester')return next();
 await verificarToken(req,res,()=>{
  if(!['docente','docente_estudiante','admin'].includes(req.usuario.rol))return res.status(403).json({ok:false,mensaje:'El modo tester requiere una cuenta docente.'});
  const s=tester.get(claims.tester_session,req.usuario.id_usuario);if(!s)return res.status(401).json({ok:false,mensaje:'La sesión de prueba terminó. Vuelve al dashboard docente.'});
  res.set('Cache-Control','no-store');
  if(req.method==='POST'&&req.path==='/tester/salir'){tester.end(s.id);return res.json({ok:true})}
  if(tester.generic(req,res,s)!==false)return;
  if(!activityPath.test(req.path))return res.status(403).json({ok:false,mensaje:'Esta función no está disponible en modo estudiante tester.'});
  if(req.body&&typeof req.body==='object'){if('id_estudiante'in req.body)req.body.id_estudiante=Number(s.user.id_usuario);if('id_usuario'in req.body)req.body.id_usuario=Number(s.user.id_usuario)}
  tester.context.run(s,next);
 });
};
