import {useLiveEvidence} from '../utils/livePresence';
import {useEffect,useRef} from 'react';
import type {MissionExpansion} from './useMissionExpansion';
import usePilotEvidence from './usePilotEvidence';
import {resetPilotSession} from '../utils/pilotEvidence';

/** Conserva el envío previo a mostrar la retroalimentación; los cierres se guardan por progresoService. */
export default function useMathNumbersEvidence(code:string,mission:MissionExpansion,native:()=>Record<string,unknown>){
 const pilot=usePilotEvidence(code),latest=useRef({mission,native,pilot});latest.current={mission,native,pilot};
 const hintUsed=useRef(false),feedbackSeen=useRef(false),suppressed=useRef(-1);
 useEffect(()=>{const hint=(event:MouseEvent)=>{const button=(event.target as Element)?.closest?.('button');if(button?.getAttribute('aria-label')?.startsWith('Abrir pista'))hintUsed.current=true;};document.addEventListener('click',hint,true);return()=>document.removeEventListener('click',hint,true);},[code]);
 const evidence=()=>({...latest.current.native(),mission_expansion:latest.current.mission.evidence,piloto:{pista_declarada:hintUsed.current,retroalimentacion_vista:feedbackSeen.current||latest.current.mission.correctOnly}});
 useLiveEvidence(code,evidence);
 useEffect(()=>{if(mission.reviewSequence===0||mission.reviewSequence===suppressed.current)return;
 const snapshot=evidence();void latest.current.pilot.record(snapshot,snapshot.piloto);feedbackSeen.current=true;
 },[code,mission.reviewSequence]);
 return {...pilot,reviewForClose:()=>{const snapshot=evidence();suppressed.current=latest.current.mission.reviewSequence+1;latest.current.mission.review();feedbackSeen.current=true;return snapshot;},resetSession:()=>{resetPilotSession(code);hintUsed.current=false;feedbackSeen.current=false;}};
}
