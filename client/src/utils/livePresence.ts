import {useEffect,useRef} from 'react';
import {useLocation} from 'react-router-dom';
import {getAuthToken,getSessionUser,hasAuthSession,isGuestSession} from './authSession';
import {isTesterSession} from './testerSession';
import {newAttemptId} from '../pedagogy/learningEngine';
import catalog from '../curriculum/aulaCatalog.json';
type Collector={code:string;cycle:string;read:()=>Record<string,unknown>};let collector:Collector|null=null;
export function useLiveEvidence(code:string,read:()=>Record<string,unknown>){const ref=useRef(read);ref.current=read;useEffect(()=>{const entry={code,cycle:newAttemptId(),read:()=>ref.current()};collector=entry;window.dispatchEvent(new Event('mathnova-live-evidence'));return()=>{if(collector===entry)collector=null}},[code]);}
export function usePresenceSender(){const {pathname}=useLocation();const tab=useRef(newAttemptId()),sequence=useRef(0),interaction=useRef(Date.now());
 useEffect(()=>{let dead=false,running=false,wanted=false,timer:ReturnType<typeof setTimeout>|undefined;
 const actor=String(getSessionUser()?.id_usuario||'');
 const eligible=()=>String(getSessionUser()?.id_usuario||'')===actor&&hasAuthSession()&&!isGuestSession()&&!isTesterSession()&&['estudiante','alumno','student'].includes(String(getSessionUser()?.rol||getSessionUser()?.role||''));
 const activity=catalog.find(a=>a.ruta.toLowerCase().replace(/\/+$/,'')===pathname.toLowerCase().replace(/\/+$/,''));
 const noteInteraction=()=>{interaction.current=Date.now()};
 async function send(leave=false){if(!eligible())return;const token=getAuthToken();const c=activity&&collector?.code===activity.codigo?collector:null;
 let answers:Record<string,unknown>|undefined;try{if(c&&!leave){const value=c.read();if(JSON.stringify(value).length<60000)answers=value}}catch{/* La señal de conexión no depende de capturar respuestas. */}
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
 try{await fetch('/api/seguimiento/presencia',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({pestana:tab.current,secuencia:++sequence.current,visible:document.visibilityState==='visible',inactivo:Math.min(86400,Math.max(0,(Date.now()-interaction.current)/1000)),actividad:activity?.codigo||null,recorrido:c?.cycle,respuestas:answers,salir:leave}),keepalive:leave,signal:controller.signal})}catch{/* La siguiente señal volverá a intentar; no interrumpe el trabajo del alumno. */}finally{clearTimeout(timeout)}
 }
 const tick=async()=>{if(dead)return;if(running){wanted=true;return}running=true;await send();running=false;if(!dead){timer=setTimeout(tick,wanted?500:10000);wanted=false}};
 const wake=()=>{if(dead)return;if(running){wanted=true;return}if(timer)clearTimeout(timer);timer=setTimeout(()=>{void tick()},500)};
 const resume=()=>{dead=false;wake()};
 const leave=()=>{dead=true;if(timer)clearTimeout(timer);void send(true)};
 document.addEventListener('pointerdown',noteInteraction,true);document.addEventListener('keydown',noteInteraction,true);document.addEventListener('visibilitychange',wake);window.addEventListener('online',wake);window.addEventListener('mathnova-live-evidence',wake);window.addEventListener('mathnova-before-logout',leave);window.addEventListener('pagehide',leave);window.addEventListener('pageshow',resume);void tick();
 return()=>{dead=true;if(timer)clearTimeout(timer);document.removeEventListener('pointerdown',noteInteraction,true);document.removeEventListener('keydown',noteInteraction,true);document.removeEventListener('visibilitychange',wake);window.removeEventListener('online',wake);window.removeEventListener('mathnova-live-evidence',wake);window.removeEventListener('mathnova-before-logout',leave);window.removeEventListener('pagehide',leave);window.removeEventListener('pageshow',resume)};
 },[pathname]);
}
