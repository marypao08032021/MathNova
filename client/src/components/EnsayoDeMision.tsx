import { useState } from "react";
import type { PointerEvent } from "react";
import "../styles/missionExperience.css";

export default function EnsayoDeMision({ activityId }: { activityId: string }) {
  const kind = activityId.replace("mathnumbers-", "");
  const [pieces, setPieces] = useState<number[]>([]);
  const [position, setPosition] = useState(0);
  const [order, setOrder] = useState(false);
  const [operation, setOperation] = useState<"+" | "×" | "−">("+");
  const [length, setLength] = useState(3);
  const [boxes, setBoxes] = useState(2);
  const [value, setValue] = useState(3);
  const [figure, setFigure] = useState(1);
  const [opened, setOpened] = useState(true);
  const scene: Record<string, [string, string]> = {
    "cofre-bienvenida": ["Suma · Energía del cofre", "Presiona las piezas para cargar la batería. Compara la fracción iluminada y el decimal."],
    "radar-supervivencia": ["Suma · Rescate de prueba", "Mueve la nave con los propulsores. Cada pulsación cambia su coordenada en 0.5. Busca la señal roja en −1.5."],
    "ascensor-bunker": ["Suma · Ascensor de entrenamiento", "Presiona los botones para subir y bajar la cápsula. El nivel cero es la entrada; los niveles negativos están debajo."],
    "escuadron-tactico": ["Suma · Panel de entrenamiento", "Intercambia el orden de ejecución y compara. El panel original usa 18 − 3 × 4: la multiplicación tiene prioridad."],
    "espejos-boveda": ["Suma · Espejo de prueba", "Voltea los cristales e intercambia 4 y −2. Prueba distintas operaciones: ¿cuáles conservan su resultado?"],
    "puente-prioridades": ["Suma · Puente de entrenamiento", "Estira el tramo verde desde su extremo o usa los botones. Cada módulo mide 2 unidades; la plataforma inicial mide 3."],
    "enigma-variables": ["Suma · Carga de entrenamiento", "Coloca y retira cajas de energía x. Cambia cuánto vale cada caja y observa la reserva fija de 3."],
    "simulador-codigos": ["Suma · Construcción de módulos", "Ensambla el siguiente cuadrado de la estructura. Comparte un lado con el anterior: cada paso añade tres palitos."],
  };
  const [title, intro] = scene[kind];
  const propulsion = (delta: number) => setPosition(p => Math.max(-3, Math.min(3, p + delta)));
  const result = (a: number, b: number) => operation === "+" ? a + b : operation === "×" ? a * b : a - b;
  const stretch = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = event.currentTarget.parentElement!.getBoundingClientRect();
    setLength(Math.max(1, Math.min(6, Math.round((event.clientX - rect.left) / rect.width * 6))));
  };
  return <section className="mn-rehearsal" data-rehearsal={kind} aria-label={title}>
    <header><h2>{title}</h2><button type="button" aria-expanded={opened} onClick={() => setOpened(v => !v)}>{opened ? "Ocultar ensayo" : "Probar antes de la misión"}</button></header>
    {opened && <><p>{intro}</p><div className="mn-rehearsal-stage">
      {kind === "cofre-bienvenida" && <><div className="mn-energy-pieces">{Array.from({ length: 8 }, (_, i) => <button type="button" key={i} aria-label={`Pieza de batería ${i + 1}`} aria-pressed={pieces.includes(i)} onClick={() => setPieces(p => p.includes(i) ? p.filter(v => v !== i) : [...p, i])}>{pieces.includes(i) ? "⚡" : "◇"}</button>)}</div><output aria-live="polite">{pieces.length}/8 de batería = {pieces.length / 8}</output><button type="button" onClick={() => setPieces([])}>Vaciar batería</button></>}
      {kind === "radar-supervivencia" && <><div className="mn-radar-track"><span className="mn-rescue" style={{ left: "25%" }}>Señal −1.5</span><span className="mn-ship" style={{ left: `${(position + 3) / 6 * 100}%` }}>▲</span></div><div className="mn-stage-controls"><button type="button" onClick={() => propulsion(-.5)} disabled={position <= -3}>Propulsor izquierdo</button><button type="button" onClick={() => propulsion(.5)} disabled={position >= 3}>Propulsor derecho</button><button type="button" onClick={() => setPosition(0)}>Volver al cero</button></div><output aria-live="polite">Nave: {position}. {position === -1.5 ? "¡Señal localizada!" : `Distancia a la señal: ${Math.abs(position + 1.5)}.`}</output></>}
      {kind === "ascensor-bunker" && <><div className="mn-lift-shaft">{[3, 2, 1, 0, -1, -2, -3].map(floor => <div key={floor}><span>Nivel {floor}</span><b className={position === floor ? "mn-lift-active" : ""}>{position === floor ? "▣ Cápsula" : "·"}</b></div>)}</div><div className="mn-stage-controls"><button type="button" onClick={() => propulsion(1)} disabled={position >= 3}>↑ Subir un nivel</button><button type="button" onClick={() => propulsion(-1)} disabled={position <= -3}>↓ Bajar un nivel</button></div><output aria-live="polite">Cápsula en el nivel {position}: {position < 0 ? "debajo" : position > 0 ? "encima" : "en"} la entrada.</output></>}
      {kind === "escuadron-tactico" && <><div className="mn-command-blocks"><b>{order ? "1. Restar 18 − 3" : "1. Multiplicar 3 × 4"}</b><span>→</span><b>{order ? "2. Multiplicar por 4" : "2. Restar a 18"}</b></div><button type="button" onClick={() => setOrder(v => !v)}>Intercambiar órdenes</button><output aria-live="polite">{order ? "(18 − 3) × 4 = 60. Al cambiar la prioridad, resolviste otra expresión." : "18 − (3 × 4) = 6. Este orden respeta la expresión del panel."}</output></>}
      {kind === "espejos-boveda" && <><div className="mn-mirror-pair"><b>{order ? "−2" : "4"}</b><strong>{operation}</strong><b>{order ? "4" : "−2"}</b></div><div className="mn-stage-controls"><button type="button" onClick={() => setOrder(v => !v)}>Voltear cristales</button>{(["+", "×", "−"] as const).map(op => <button type="button" key={op} aria-pressed={operation === op} onClick={() => setOperation(op)}>{op === "+" ? "Suma" : op === "×" ? "Multiplicación" : "Resta"}</button>)}</div><output aria-live="polite">Referencia 4 {operation} (−2) = {result(4, -2)}. Espejo actual: {result(order ? -2 : 4, order ? 4 : -2)}. {order ? result(4, -2) === result(-2, 4) ? "La energía se conserva." : "La resta no conserva el valor al intercambiar los números." : "Voltea los cristales para comparar."}</output></>}
      {kind === "puente-prioridades" && <><div className="mn-bridge-track"><div className="mn-bridge-plank" style={{ width: `${length / 6 * 100}%` }}>{Array.from({ length }, (_, i) => <span key={i}>2</span>)}</div><button type="button" className="mn-stretch-handle" style={{ left: `${length / 6 * 100}%` }} aria-label="Estirar tramo del puente" onPointerDown={event => event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={stretch} onPointerUp={event => event.currentTarget.releasePointerCapture(event.pointerId)} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); setLength(v => Math.min(6, v + 1)); } if (event.key === "ArrowLeft") { event.preventDefault(); setLength(v => Math.max(1, v - 1)); } }}>↔</button></div><div className="mn-stage-controls"><button type="button" disabled={length <= 1} onClick={() => setLength(v => v - 1)}>Retirar módulo</button><button type="button" disabled={length >= 6} onClick={() => setLength(v => v + 1)}>Añadir módulo</button></div><output aria-live="polite">3 + 2 × {length} = {3 + 2 * length} unidades. La multiplicación calcula primero los módulos.</output></>}
      {kind === "enigma-variables" && <><div className="mn-cargo-boxes">{Array.from({ length: boxes }, (_, i) => <button type="button" key={i} aria-label={`Retirar caja ${i + 1}`} onClick={() => setBoxes(v => v - 1)}>x = {value}</button>)}<b>Reserva: 3</b></div><div className="mn-stage-controls"><button type="button" disabled={boxes >= 5} onClick={() => setBoxes(v => v + 1)}>Colocar caja</button><button type="button" disabled={boxes <= 0} onClick={() => setBoxes(v => v - 1)}>Retirar caja</button><label>Valor de x <select value={value} onChange={event => setValue(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map(n => <option key={n}>{n}</option>)}</select></label></div><output aria-live="polite">{boxes}x + 3 = {boxes * value + 3} unidades cuando x = {value}.</output></>}
      {kind === "simulador-codigos" && <><svg viewBox="0 0 390 95" role="img" aria-label={`${figure} cuadrados unidos, ${3 * figure + 1} palitos`}>{Array.from({ length: figure }, (_, i) => <g key={i} stroke="currentColor" strokeWidth="5"><line x1={10 + i * 60} y1="15" x2={70 + i * 60} y2="15" /><line x1={10 + i * 60} y1="75" x2={70 + i * 60} y2="75" /><line x1={10 + i * 60} y1="15" x2={10 + i * 60} y2="75" /></g>)}<line x1={10 + figure * 60} y1="15" x2={10 + figure * 60} y2="75" stroke="currentColor" strokeWidth="5" /></svg><div className="mn-stage-controls"><button type="button" disabled={figure >= 6} onClick={() => setFigure(v => v + 1)}>Ensamblar siguiente módulo</button><button type="button" disabled={figure <= 1} onClick={() => setFigure(v => v - 1)}>Desmontar último módulo</button></div><output aria-live="polite">Figura {figure}: 3 × {figure} + 1 = {3 * figure + 1} palitos.</output></>}
    </div><small>Ensayo sin puntuación. Después resuelve los retos de esta misión.</small></>}
  </section>;
}
