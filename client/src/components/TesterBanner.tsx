import {useEffect,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {getTesterSession,stopTesterSession} from '../utils/testerSession';
import './TesterBanner.css';
export default function TesterBanner(){
 const navigate=useNavigate(),location=useLocation(),banner=useRef<HTMLElement>(null);
 const[session,setSession]=useState(getTesterSession),[busy,setBusy]=useState(false);
 useEffect(()=>{const update=()=>setSession(getTesterSession());window.addEventListener('mathnova-tester-change',update);const timer=window.setInterval(update,30000);return()=>{window.removeEventListener('mathnova-tester-change',update);clearInterval(timer)}},[]);
 const stored=sessionStorage.getItem('mathnova_tester_session'),visible=Boolean(session||stored);
 useEffect(()=>{
  if(!visible||!banner.current)return;
  const adjust=()=>{
   document.documentElement.style.setProperty('--mn-tester-height',`${banner.current?.getBoundingClientRect().height||0}px`);
   document.querySelectorAll<HTMLElement>('aside[class*="sidebar"],button[class*="hamburger"]').forEach(element=>{if(getComputedStyle(element).position==='fixed')element.dataset.testerOffset='true';else delete element.dataset.testerOffset});
  };
  const observer=new ResizeObserver(adjust);observer.observe(banner.current);const frame=requestAnimationFrame(adjust);window.addEventListener('resize',adjust);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',adjust);document.documentElement.style.removeProperty('--mn-tester-height');document.querySelectorAll<HTMLElement>('[data-tester-offset]').forEach(element=>delete element.dataset.testerOffset)};
 },[visible,location.pathname]);
 if(!visible)return null;
 return <aside ref={banner} className="mn-tester-banner" aria-label="Modo estudiante tester"><div><strong>Modo estudiante · Tester</strong><span>{session?'Sesión de prueba del docente. Los resultados no se guardan como calificaciones.':'La sesión de prueba terminó.'}</span></div><button disabled={busy} onClick={()=>{setBusy(true);stopTesterSession().catch(()=>{}).finally(()=>{setBusy(false);navigate('/dashboard-docente',{replace:true})})}}>{busy?'Volviendo…':'Volver al docente'}</button></aside>;
}
