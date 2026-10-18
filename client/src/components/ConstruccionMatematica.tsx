import { useId, useRef, useState } from "react";
import type { Construction, DrawingAnswer } from "../pedagogy/learningEngine";
export default function ConstruccionMatematica({ mode, value, onChange }: { mode: Construction; value: DrawingAnswer; onChange: (value: DrawingAnswer) => void }) {
  const [endpoint,setEndpoint]=useState(1);const active=useRef(1);
  const select=(n:number)=>{active.current=n;setEndpoint(n)};
  const place=(event:React.PointerEvent<SVGSVGElement>)=>{if(event.currentTarget.closest('fieldset')?.disabled)return;const matrix=event.currentTarget.getScreenCTM();if(!matrix)return;const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());const x=Math.max(0,Math.min(10,Math.round((p.x-25)/30))),y=Math.max(0,Math.min(10,Math.round((325-p.y)/30)));onChange(active.current===2&&mode==='mediatrix'?{...value,x2:x,y2:y}:{...value,x,y})};
  const id = useId(); const sx = (x: number) => 25 + x * 30, sy = (y: number) => 325 - y * 30;
  const point = (x: number, y: number, label: string) => <g key={label}><circle cx={sx(x)} cy={sy(y)} r="5" fill="#264c7a" /><text x={sx(x) + 7} y={sy(y) - 7}>{label}</text></g>;
  const line = (x: number, y: number, x2: number, y2: number, color = "#2465ce") => <line x1={sx(x)} y1={sy(y)} x2={sx(x2)} y2={sy(y2)} stroke={color} strokeWidth="3" />;
  let original, drawing;
  if (["isosceles", "median", "altitude"].includes(mode)) {
    const c = mode === "altitude" ? [3, 7] : [5, 8];
    original = <>{line(1, 1, 9, 1)}{mode !== "isosceles" && <>{line(1, 1, c[0], c[1])}{line(9, 1, c[0], c[1])}{point(c[0], c[1], "C")}</>}{point(1, 1, "A")}{point(9, 1, "B")}</>;
    drawing = mode === "isosceles" ? <>{line(1, 1, value.x, value.y, "#d36b14")}{line(9, 1, value.x, value.y, "#d36b14")}</> : line(c[0], c[1], value.x, value.y, "#d36b14");
  } else if (mode === "rectangle") {
    drawing = <rect x={sx(0)} y={sy(value.y)} width={value.x * 30} height={value.y * 30} fill="#e7f0ff" stroke="#d36b14" strokeWidth="3" />;
  } else if (mode === "midpoint") { original = <>{line(0, 0, 8, 4)}{point(0, 0, "A")}{point(8, 4, "B")}</>;
  } else if (mode === "mediatrix") {
    original = <>{line(2, 5, 8, 5)}{point(2, 5, "A")}{point(8, 5, "B")}</>; drawing = line(value.x, value.y, value.x2, value.y2, "#d36b14");
  } else if (mode === "diagonal") {
    original = <><rect x={sx(1)} y={sy(7)} width="240" height="180" fill="none" stroke="#264c7a" strokeWidth="2" />{point(1, 1, "A")}{point(9, 1, "B")}{point(9, 7, "C")}{point(1, 7, "D")}</>; drawing = line(1, 1, value.x, value.y, "#d36b14");
  } else { const p = mode === "vertical" ? [2, 1] : [2, 2]; original = <>{point(p[0], p[1], "P")}{mode === "bisector" && <>{line(2, 2, 9, 2)}{line(2, 2, 2, 9)}</>}</>; drawing = line(p[0], p[1], value.x, value.y, "#d36b14"); }
  return <div className="pda-construction"><p>Regla digital: arrastra los puntos naranjas o usa las coordenadas. Cada división vale una unidad. El trazo naranja es tu construcción.</p>
    <svg viewBox="0 0 350 350" role="img" aria-label={`Construcción ${mode}; punto seleccionado (${value.x}, ${value.y})`} style={{touchAction:'none'}} onPointerDown={event=>{const n=(event.target as Element).closest('[data-endpoint]')?.getAttribute('data-endpoint');if(n)select(Number(n));event.currentTarget.setPointerCapture(event.pointerId);place(event)}} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))place(event)}} onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}}>
      {Array.from({ length: 11 }, (_, i) => <g key={i}><line x1={sx(i)} y1="25" x2={sx(i)} y2="325" stroke="#dbe5f1" /><line x1="25" y1={sy(i)} x2="325" y2={sy(i)} stroke="#dbe5f1" /><text x={sx(i) - 3} y="344">{i}</text><text x="3" y={sy(i) + 4}>{i}</text></g>)}
      {original}{drawing}<g data-endpoint="1" style={{cursor:'grab'}}><circle cx={sx(value.x)} cy={sy(value.y)} r="12" fill="#d36b14"/>{point(value.x,value.y,"Extremo 1")}</g>{mode==='mediatrix'&&<g data-endpoint="2" style={{cursor:'grab'}}><circle cx={sx(value.x2)} cy={sy(value.y2)} r="12" fill="#d36b14"/>{point(value.x2,value.y2,"Extremo 2")}</g>}
    </svg>
    {mode==='mediatrix'&&<div className="pda-controls">{[1,2].map(n=><button type="button" key={n} aria-pressed={endpoint===n} onClick={()=>select(n)}>Mover extremo {n}</button>)}</div>}<div className="pda-controls">{(["x", "y", ...(mode === "mediatrix" ? ["x2", "y2"] : [])] as (keyof DrawingAnswer)[]).map(key => <label key={key} htmlFor={`${id}-${key}`}>{mode === "rectangle" ? key === "x" ? "Ancho" : "Alto" : key.toUpperCase()}<input id={`${id}-${key}`} type="number" min="0" max="10" step="1" value={value[key]} onChange={event => onChange({ ...value, [key]: Number(event.target.value) })} /></label>)}</div>
  </div>;
}
