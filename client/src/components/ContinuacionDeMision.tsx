import CierreDeMision from "./CierreDeMision";
import RetosDeMision from "./RetosDeMision";
import DetalleErroresDeMision, {type MissionReviewItem} from "./DetalleErroresDeMision";
import {useState} from "react";
import type {MissionExpansion} from "../hooks/useMissionExpansion";
export default function ContinuacionDeMision({expansion,onComplete,onRestart}:{expansion:MissionExpansion;onComplete:()=>void;onRestart:()=>void}) {
 const [show,setShow]=useState(false);
 const correct=(item?:MissionReviewItem)=>{setShow(false);expansion.beginCorrection(item);};
 return <section className="mn-continuation"><RetosDeMision expansion={expansion}/><p role="status">{expansion.nativeFinished?"Los retos originales están correctos y se conservan.":"Completa y comprueba los retos originales antes de cerrar la misión."}</p><CierreDeMision disabled={!expansion.nativeFinished} onFinish={()=>{expansion.review();if(expansion.ready&&expansion.allCorrect)onComplete();else setShow(true);}}/>{show&&<DetalleErroresDeMision items={expansion.items} onCorrect={correct} onRestart={()=>{setShow(false);onRestart();}}/>}</section>;
}
