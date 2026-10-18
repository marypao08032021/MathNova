import ConstruccionMatematica from './ConstruccionMatematica';
import {geometryEvidenceScenes} from './geometryEvidenceScenes';
import catalog from '../pedagogy/missionLearning.json';
import type {DrawingAnswer,Question} from '../pedagogy/learningEngine';

export default function GeometryEvidencePreview({code,id,answer}:{code:string;id:string;answer:unknown}){
 const images=geometryEvidenceScenes[code]?.[id];
 if(images)return <div className="mn-history-scenes">{images.map((image,i)=><figure key={i}><img src={image.src} alt={image.alt}/>{images.length>1&&<figcaption>{image.alt}</figcaption>}</figure>)}</div>;
 if(!code.startsWith('mathgeometry-'))return null;
 const question=(catalog as Record<string,{questions:Question[]}>)[code]?.questions.find(q=>q.id===id);
 if(question?.kind!=='construction'||!answer||typeof answer!=='object')return null;
 const value=answer as DrawingAnswer;
 if(['x','y','x2','y2'].some(k=>!Number.isFinite(value[k as keyof DrawingAnswer])||value[k as keyof DrawingAnswer]<0||value[k as keyof DrawingAnswer]>10))return null;
 return <fieldset disabled className="mn-history-construction" aria-label="Trazo del intento seleccionado, solo lectura"><legend>Trazo registrado · solo lectura</legend><ConstruccionMatematica mode={question.construction!} value={value} onChange={()=>{}}/></fieldset>;
}
