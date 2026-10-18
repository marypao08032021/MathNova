const router=require('express').Router(),jwt=require('jsonwebtoken');
const {verificarToken,permitirRoles}=require('../middlewares/authMiddleware');
const {create}=require('../services/testerSession');
router.post('/entrar',verificarToken,permitirRoles('docente','admin'),(req,res)=>{try{const s=create(req.usuario);const token=jwt.sign({id_usuario:String(req.usuario.id_usuario),identity:'registro',mode:'tester',tester_session:s.id},process.env.JWT_SECRET,{algorithm:'HS256',expiresIn:'2h'});res.set('Cache-Control','no-store').json({ok:true,token,exp:s.exp,id:s.id})}catch(e){res.status(409).json({ok:false,mensaje:e.message})}});
module.exports=router;
