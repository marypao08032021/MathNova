import type { MissionReviewItem } from "../components/DetalleErroresDeMision";
import { useState } from "react";
import catalog from "../pedagogy/missionLearning.json";
import { answered, evaluateQuestion } from "../pedagogy/learningEngine";
import type { Answer, Question } from "../pedagogy/learningEngine";

type Mission = { id: string; scene: string; title: string; intro: string; nativeCount: number; totalCount: number; questions: Question[]; reflection?: {prompt:string;rubric:string} };
const missions = catalog as Record<string, Mission>;
export default function useMissionExpansion(activityId: string) {
  const mission = missions[activityId];
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [explanation,setExplanation]=useState("");
  const [correctOnly, setCorrectOnly] = useState(false);
  const [nativeFinished, setNativeFinished] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [reviewSequence,setReviewSequence]=useState(0);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{correct:number;total:number;seconds:number;xp:number}|null>(null);
  const readyCount = mission.questions.filter(q => answered(q, answers[q.id])).length;
  const correctCount = mission.questions.filter(q => evaluateQuestion(q, answers[q.id]) === true).length;
  return {
    mission, answers, reviewSequence, explanation, setExplanation, reviewed, index, readyCount, correctCount, result, correctOnly, nativeFinished,
    allCorrect: correctCount === mission.questions.length,
    finishNative: () => setNativeFinished(true),
    items: mission.questions.map((q,i):MissionReviewItem => ({id:q.id,title:`Reto ${mission.nativeCount+i+1}: ${q.prompt}`,answer:typeof answers[q.id] === "object" ? JSON.stringify(answers[q.id]) : String(answers[q.id] ?? ""),correct:answered(q,answers[q.id]) ? evaluateQuestion(q,answers[q.id]) : null,hint:q.feedback,target:`[data-mission="${mission.id}"]`})),
    beginCorrection: (item?:MissionReviewItem) => { setCorrectOnly(true); setReviewed(true); const selected=item ? mission.questions.findIndex(q=>q.id===item.id) : mission.questions.findIndex(q=>evaluateQuestion(q,answers[q.id])!==true); if(selected>=0)setIndex(selected); requestAnimationFrame(()=>{ const target=document.querySelector<HTMLElement>(item?.target || `[data-mission="${mission.id}"]`); if(target){target.scrollIntoView({behavior:"smooth",block:"center"});if(target.matches("input,button,select,textarea"))target.focus({preventScroll:true});} }); },
    recordResult: (summary: {correct:number;seconds:number;xp:number}) => setResult({...summary,total:mission.totalCount}),
    total: mission.totalCount,
    ready: readyCount === mission.questions.length,
    setIndex,
    setAnswer: (id: string, value: Answer) => { setAnswers(current => correctOnly && evaluateQuestion(mission.questions.find(q=>q.id===id)!,current[id])===true ? current : ({ ...current, [id]: value })); if(!correctOnly)setReviewed(false); },
    review: () => {setReviewed(true);setReviewSequence(v=>v+1);},
    reset: () => { setExplanation(""); setCorrectOnly(false); setNativeFinished(false); setAnswers({}); setReviewed(false); setIndex(0); setResult(null); },
    evidence: { version: "mission-v2", answers, automatic_count: mission.questions.length, native_count: mission.nativeCount, correction_after_feedback: correctOnly, explanation, pending_teacher_review: Boolean(mission.reflection && explanation.trim()), reflection_rubric: mission.reflection?.rubric },
  };
}
export type MissionExpansion = ReturnType<typeof useMissionExpansion>;
