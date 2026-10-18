import {useLiveEvidence} from '../utils/livePresence';
import {useEffect,useRef} from 'react';
import type {MissionExpansion} from './useMissionExpansion';
import usePilotEvidence from './usePilotEvidence';
import {resetPilotSession} from '../utils/pilotEvidence';

/** Captura cada comprobación antes de mostrar su resultado, sin modificar la navegación original. */
export default function useGeometryEvidence(code:string,mission:MissionExpansion,native:()=>Record<string,unknown>){
  const pilot=usePilotEvidence(code);
  const nativeAnswers=useRef<Record<string,unknown>>({});
  const hintUsed=useRef(false),feedbackSeen=useRef(false);
  const latest=useRef({mission,native,pilot});
  latest.current={mission,native,pilot};

  useEffect(()=>{
    const help=(event:MouseEvent)=>{
      const button=(event.target as Element)?.closest?.('button');
      const text=[button?.getAttribute('aria-label'),button?.textContent].filter(Boolean).join(' ');
      if(/pista|ayuda|consejo/i.test(text))hintUsed.current=true;
    };
    document.addEventListener('click',help,true);
    return()=>document.removeEventListener('click',help,true);
  },[code]);

  const flags=()=>({pista_declarada:hintUsed.current,retroalimentacion_vista:feedbackSeen.current||latest.current.mission.correctOnly});
  const evidence=(extra:Record<string,unknown>={})=>({
    ...latest.current.native(),...extra,
    piloto_nativas:{...nativeAnswers.current},
    mission_expansion:latest.current.mission.evidence,
    piloto:flags(),
  });
 useLiveEvidence(code,evidence);
  const recordAll=(extra:Record<string,unknown>={})=>{
    const snapshot=evidence(extra);
    void latest.current.pilot.record(snapshot,snapshot.piloto);
    feedbackSeen.current=true;
  };

  useEffect(()=>{
    if(mission.reviewSequence===0)return;
    // Una entrega completa ya se registra mediante useAutoProgreso.
    if(!mission.ready||!mission.allCorrect)recordAll();
  },[code,mission.reviewSequence]);

  return {...pilot,evidence,recordAll,
    recordNative:(index:number,value:unknown)=>{
      nativeAnswers.current['native-'+index]=value;
      recordAll();
    },
    resetSession:()=>{
      nativeAnswers.current={};hintUsed.current=false;feedbackSeen.current=false;
      resetPilotSession(code);
    },
  };
}
