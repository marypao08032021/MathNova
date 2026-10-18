import {useCallback,useEffect,useState} from 'react';
import {getAuthToken} from '../utils/authSession';
import {isTesterSession} from '../utils/testerSession';
import catalogo from '../curriculum/aulaCatalog.json';
export type AulaActividad=typeof catalogo[number]&{permitida:boolean;motivo:string};
export default function useAulaAccess(enabled=true){
 const token=getAuthToken(),tester=isTesterSession(),identity=String(token||'')+tester;
 const [state,setState]=useState<{identity:string;actividades:AulaActividad[];loading:boolean;error:string}>({identity:'',actividades:[],loading:true,error:''});
 const [version,setVersion]=useState(0);const refresh=useCallback(()=>setVersion(v=>v+1),[]);
 useEffect(()=>{
  if(!enabled||tester||!token)return;
  let alive=true,controller:AbortController|null=null;
  const load=async()=>{controller?.abort();const current=new AbortController();controller=current;
   try{const r=await fetch('/api/aula/acceso',{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:current.signal});const d=await r.json();if(!r.ok)throw Error(d.mensaje||'No se pudieron comprobar los permisos.');if(alive&&!current.signal.aborted)setState({identity,actividades:d.actividades,loading:false,error:''});}
   catch(e){if(alive&&!current.signal.aborted)setState({identity,actividades:[],loading:false,error:e instanceof Error?e.message:'No hay conexión con el servidor del aula.'});}
  };void load();const interval=window.setInterval(load,15000);window.addEventListener('focus',load);window.addEventListener('mathnova-permisos-change',load);
  return()=>{alive=false;controller?.abort();clearInterval(interval);window.removeEventListener('focus',load);window.removeEventListener('mathnova-permisos-change',load)};
 },[enabled,token,tester,identity,version]);
 const actividades: AulaActividad[]=tester?catalogo.map(a=>({...a,permitida:true,motivo:'Modo estudiante tester'})):state.identity===identity?state.actividades:[];
 return {actividades,loading:Boolean(enabled&&token&&!tester&&(state.identity!==identity||state.loading)),error:state.identity===identity?state.error:'',refresh,allowed:(code:string)=>actividades.some(a=>a.codigo===code&&a.permitida)};
}
