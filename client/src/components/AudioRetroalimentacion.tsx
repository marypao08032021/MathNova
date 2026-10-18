import {useEffect,useRef,useState} from 'react';
import '../styles/feedbackAudio.css';
export default function AudioRetroalimentacion({text}:{text?:string}){
 const ref=useRef<HTMLButtonElement>(null),[status,setStatus]=useState('');
 useEffect(()=>()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel()},[]);
 const play=()=>{
  if(!('speechSynthesis' in window)){setStatus('Este navegador no ofrece lectura en voz alta. La retroalimentación sigue disponible en texto.');return;}
  const container=ref.current?.closest('[role="dialog"],.res-modal-card')||ref.current?.parentElement?.parentElement;
  const content=text||[...new Set(Array.from(container?.querySelectorAll('h1,h2,h3,p')||[]).map(n=>n.textContent?.trim()).filter(Boolean))].join('. ');
  if(!content){setStatus('Consulta el texto de la retroalimentación.');return;}
  const localVoice=window.speechSynthesis.getVoices().find(voice=>voice.localService&&voice.lang.toLowerCase().startsWith('es'));
  if(!localVoice){setStatus('No hay una voz local en español disponible. Usa el audio del personaje o lee la retroalimentación.');return;}
  document.querySelectorAll<HTMLMediaElement>('audio').forEach(audio=>audio.pause());window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(content);utterance.voice=localVoice;utterance.lang=localVoice.lang;utterance.rate=.95;utterance.onerror=()=>setStatus('No se pudo iniciar la lectura. Puedes volver a intentarlo o leer el texto.');utterance.onend=()=>setStatus('');window.speechSynthesis.speak(utterance);setStatus('Leyendo retroalimentación…');
 };
 return <div className="mn-feedback-audio"><button type="button" ref={ref} onClick={play}>Escuchar texto de retroalimentación</button><button type="button" onClick={()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel();setStatus('')}}>Detener lectura</button>{status&&<small role="status">{status}</small>}</div>;
}
