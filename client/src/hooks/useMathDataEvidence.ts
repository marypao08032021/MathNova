import {useLiveEvidence} from '../utils/livePresence';
import type {MissionReviewItem} from "../components/DetalleErroresDeMision";
import {useEffect,useRef,useState} from 'react';
import type {MissionExpansion} from './useMissionExpansion';
import usePilotEvidence from './usePilotEvidence';
import {resetPilotSession,retryPilot} from '../utils/pilotEvidence';
import {guardarProgresoUsuarioActual} from '../services/progresoService';
import type {RespuestaGuardarProgreso} from '../services/progresoService';
import {activityCurriculum} from '../curriculum/activityCurriculum';

export default function useMathDataEvidence(code:string,mission:MissionExpansion,native:()=>Record<string,unknown>){
 const pilot=usePilotEvidence(code),latest=useRef({mission,native,pilot});latest.current={mission,native,pilot};
 const feedback=useRef(false),hint=useRef(false),suppressed=useRef(-1),saving=useRef(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<RespuestaGuardarProgreso|null>(null);
 useEffect(()=>{const help=(event:MouseEvent)=>{const b=(event.target as Element)?.closest?.('button');if(/pista|ayuda|consejo/i.test([b?.textContent,b?.getAttribute('aria-label')].join(' ')))hint.current=true;};document.addEventListener('click',help,true);return()=>document.removeEventListener('click',help,true);},[code]);
 const evidence=(extra:Record<string,unknown>={})=>({...latest.current.native(),...extra,mission_expansion:latest.current.mission.evidence,piloto:{retroalimentacion_vista:feedback.current||latest.current.mission.correctOnly,pista_declarada:hint.current}});
 useLiveEvidence(code,evidence);
 const recordAll=(extra:Record<string,unknown>={})=>{const value=evidence(extra);void latest.current.pilot.record(value,value.piloto);feedback.current=true;};
 useEffect(()=>{if(mission.reviewSequence>0&&mission.reviewSequence!==suppressed.current)recordAll();},[code,mission.reviewSequence]);
 const accept=(value:RespuestaGuardarProgreso)=>{if(!value.ok||!value.intento_piloto)throw Error('El servidor no confirmó la evaluación de este intento. Conserva esta pestaña y reenvía el pendiente.');setReceipt(current=>current?.intento_piloto?.id===value.intento_piloto?.id?current:value);setError('');return value;};
 const run=async(action:()=>Promise<RespuestaGuardarProgreso|undefined>)=>{if(saving.current)return;saving.current=true;setBusy(true);setError('');try{return await action();}catch(e){setError((e as Error).message);throw e;}finally{saving.current=false;setBusy(false);}};
 return {...pilot,busy,error:error||pilot.error,receipt,evaluation:receipt?.intento_piloto?.evaluacion,recordAll,
  reviewItems:(items:MissionReviewItem[])=>items.map((item,i)=>{const current=receipt?.intento_piloto?.evaluacion.items[i];return current?{...item,answer:typeof current.respuesta==='object'?JSON.stringify(current.respuesta):String(current.respuesta??''),correct:current.correcta}:item;}),
  finish:(seconds:number,xp:number)=>run(async()=>{
   const m=latest.current.mission,value=evidence();suppressed.current=m.reviewSequence+1;m.review();
   if(!m.ready){recordAll();throw Error('Completa los retos de la bitácora antes de terminar la misión.');}
   feedback.current=true;const info=activityCurriculum[code];
   return accept(await guardarProgresoUsuarioActual({mundo:'MathData',tema:info.content,actividad_codigo:code,actividad_titulo:info.title,respuestas:value,aciertos:0,total_preguntas:m.total,tiempo_segundos:seconds,xp_base:xp,completada:false}));
  }),
  retry:async()=>{try{await run(async()=>{const value=await retryPilot(code);if(value)return accept(value as RespuestaGuardarProgreso);});}catch{/* El estado conserva el mensaje y el pendiente. */}},
  resetSession:()=>{resetPilotSession(code);feedback.current=false;hint.current=false;setReceipt(null);setError('');},
 };
}
