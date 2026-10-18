import { useId, useState } from "react";
import "../styles/learningPilot.css";

export function functionPoints(k: number, b: number) {
  return [-2, -1, 0, 1, 2].map((x) => ({ x, y: k * x + b }));
}

export default function ExploradorFunciones() {
  const id = useId();
  const [k, setK] = useState(3);
  const [b, setB] = useState(0);
  const points = functionPoints(k, b);
  const equation = `y = ${k}x${b > 0 ? ` + ${b}` : b < 0 ? ` − ${Math.abs(b)}` : ""}`;
  const svgPoints = points.map(({ x, y }) => `${150 + x * 55},${110 - y * 9}`).join(" ");
  return (
    <section className="mn-explorer" aria-labelledby={`${id}-heading`}>
      <div className="mn-explorer-heading"><div><span className="mn-eyebrow">Antes de calibrar</span><h2 id={`${id}-heading`}>Explora cómo cambia la recta</h2></div><span className="mn-equation">{equation}</span></div>
      <p>Predice qué ocurrirá al cambiar la constante. Después compara la tabla y la gráfica.</p>
      <div className="mn-explorer-controls">
        <label htmlFor={`${id}-k`}>Constante k: <strong>{k}</strong><input id={`${id}-k`} type="range" min="-4" max="4" step="1" value={k} onChange={(event) => setK(Number(event.target.value))} /></label>
        <label htmlFor={`${id}-b`}>Valor inicial b<select id={`${id}-b`} value={b} onChange={(event) => setB(Number(event.target.value))}><option value="0">0 · y = kx</option><option value="2">2 · y = kx + 2</option></select></label>
      </div>
      <div className="mn-explorer-representations">
        <svg viewBox="0 0 300 220" role="img" aria-labelledby={`${id}-graph-title ${id}-graph-desc`}>
          <title id={`${id}-graph-title`}>Gráfica de {equation}</title><desc id={`${id}-graph-desc`}>Los valores exactos están en la tabla contigua. Eje x de menos dos a dos; eje y de menos diez a diez.</desc>
          {[-2, -1, 0, 1, 2].map((x) => <g key={`x${x}`}><line x1={150 + x * 55} y1="20" x2={150 + x * 55} y2="200" stroke="#dbe5ee" /><text x={150 + x * 55} y="216" textAnchor="middle">{x}</text></g>)}
          {[-10, -5, 0, 5, 10].map((y) => <g key={`y${y}`}><line x1="40" y1={110 - y * 9} x2="260" y2={110 - y * 9} stroke="#dbe5ee" /><text x="32" y={114 - y * 9} textAnchor="end">{y}</text></g>)}
          <line x1="40" y1="110" x2="275" y2="110" stroke="#50647b" /><line x1="150" y1="15" x2="150" y2="200" stroke="#50647b" /><text x="280" y="114">x</text><text x="155" y="15">y</text>
          <polyline points={svgPoints} fill="none" stroke="#295fc0" strokeWidth="3" />
          {points.map(({ x, y }) => <circle key={x} cx={150 + x * 55} cy={110 - y * 9} r="4" fill="#295fc0" />)}
        </svg>
        <table><caption>Valores de {equation}</caption><thead><tr><th scope="col">x</th><th scope="col">y</th></tr></thead><tbody>{points.map(({ x, y }) => <tr key={x}><th scope="row">{x}</th><td>{y}</td></tr>)}</tbody></table>
      </div>
      <p className="mn-explorer-observation" role="status">{b === 0 ? `Cuando x = 0, y = 0. El modelo tiene la forma y = kx.${k === 0 ? " Con k = 0, todos los valores de y son cero." : k > 0 ? " La constante es positiva: al aumentar x, aumenta y." : " La constante es negativa: al aumentar x, disminuye y."}` : "Cuando x = 0, y = 2. Aunque la gráfica es una recta, este modelo no es proporcional: tiene un valor inicial distinto de cero."}</p>
      <p className="mn-explorer-question">Para conversar o escribir en tu libreta: ¿qué cambia entre y = −2x y y = −2x + 2? Comprueba tu explicación con dos valores de x.</p>
      <button type="button" onClick={() => { setK(3); setB(0); }}>Restablecer exploración</button>
    </section>
  );
}
