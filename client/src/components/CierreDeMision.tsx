import "../styles/missionClosing.css";
export default function CierreDeMision({onFinish,disabled=false,busy=false,message}:{onFinish:()=>void;disabled?:boolean;busy?:boolean;message?:string}) {
 return <footer className="mn-mission-closing" aria-label="Cierre de la misión"><div><strong>¿Terminaste todos los retos?</strong><p>{message||"Revisa tus respuestas y entrega la misión. Si hay errores, podrás corregirlos conservando tus aciertos."}</p></div><button type="button" disabled={disabled||busy} aria-busy={busy} onClick={onFinish}>{busy?"Guardando…":"Terminar misión"}</button></footer>;
}
