import catalog from "./activityLearning.json";
export type Construction = "isosceles" | "rectangle" | "vertical" | "bisector" | "midpoint" | "mediatrix" | "median" | "altitude" | "diagonal";
export type DrawingAnswer = { x: number; y: number; x2: number; y2: number };
export const emptyDrawing = (): DrawingAnswer => ({ x: 0, y: 0, x2: 0, y2: 0 });
export type Question = { id: string; kind: "number" | "fraction" | "choice" | "algebra" | "construction" | "open"; prompt: string; answer?: number | string | number[]; options?: string[]; variable?: string; construction?: Construction; feedback: string; rubric?: string };
export type LearningActivity = { id: string; version: string; nativeCount: number; totalCount: number; model: string; explorationQuestion: string; questions: Question[] };
export type Answer = string | DrawingAnswer;
export const learningActivities = catalog as Record<string, LearningActivity>;
export function parseNumber(value: string): number | null {
  const pieces = value.trim().replace(/−/g, "-").replace(/,/g, ".").split("/");
  if (pieces.length > 2 || pieces.some(p => !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(p.trim()))) return null;
  const numbers = pieces.map(p => Number(p.trim()));
  if (numbers.length === 2 && numbers[1] === 0) return null;
  const result = numbers.length === 2 ? numbers[0] / numbers[1] : numbers[0];
  return Number.isFinite(result) ? result : null;
}
export function parseLinear(value: string, variable = "x"): [number, number] | null {
  let text = value.toLowerCase().replace(/\s/g, "").replace(/−/g, "-");
  text = text.replace(new RegExp(`^${variable === "x" ? "y" : "a(?:_?n)?"}=`), "");
  const terms = text.match(/[+-]?[^+-]+/g);
  if (!terms || terms.join("") !== text) return null;
  let coefficient = 0, constant = 0;
  for (let term of terms) {
    const sign = term.startsWith("-") ? -1 : 1;
    term = term.replace(/^[+-]/, "");
    if (term.endsWith(variable)) {
      const part = term.slice(0, -1).replace(/\*$/, ""); const number = part === "" ? 1 : parseNumber(part);
      if (number === null) return null; coefficient += sign * number;
    } else if (term.startsWith(variable + "*") && /^\d+(?:\.\d+)?$/.test(term.slice(2))) {
      coefficient += sign * Number(term.slice(2));
    } else { const number = parseNumber(term); if (number === null) return null; constant += sign * number; }
  }
  return [coefficient, constant];
}
export function validConstruction(mode: Construction, a: DrawingAnswer): boolean {
  if (Object.values(a).some(v => !Number.isFinite(v) || v < 0 || v > 10)) return false;
  const { x, y, x2, y2 } = a;
  switch (mode) {
    case "isosceles": return x === 5 && y > 1;
    case "rectangle": return x > 0 && y > 0 && x !== y;
    case "vertical": return x === 2 && y === 7;
    case "bisector": return x > 2 && y > 2 && x - 2 === y - 2;
    case "midpoint": return x === 4 && y === 2;
    case "mediatrix": return x === 5 && x2 === 5 && Math.min(y, y2) < 5 && Math.max(y, y2) > 5;
    case "median": return x === 5 && y === 1;
    case "altitude": return x === 3 && y === 1;
    case "diagonal": return x === 9 && y === 7;
  }
}
export function evaluateQuestion(q: Question, value: Answer | undefined): boolean | null {
  if (q.kind === "open") return null;
  if (value === undefined) return false;
  if (q.kind === "construction") return typeof value !== "string" && validConstruction(q.construction!, value);
  if (typeof value !== "string") return false;
  if (q.kind === "choice") return value === q.answer;
  if (q.kind === "fraction" && !/^[+-]?\d+\s*\/\s*[+-]?\d+$/.test(value.trim())) return false;
  if (q.kind === "number" || q.kind === "fraction") { const n = parseNumber(value); return n !== null && Math.abs(n - Number(q.answer)) < 1e-6; }
  const n = parseLinear(value, q.variable); const expected = q.answer as number[];
  return n !== null && n.every((v, i) => Math.abs(v - expected[i]) < 1e-6);
}
export function answered(q: Question, value: Answer | undefined): boolean {
  if (typeof value === "object") return q.kind === "construction";
  return typeof value === "string" && (q.kind === "open" ? value.trim().length >= 15 : value.trim().length > 0);
}
export function statistics(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b), n = sorted.length;
  const counts = new Map<number, number>(); values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
  const frequency = Math.max(...counts.values());
  return { mean: values.reduce((a, b) => a + b, 0) / n, median: n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2, modes: frequency > 1 ? [...counts].filter(([, c]) => c === frequency).map(([v]) => v).sort((a, b) => a - b) : [], range: sorted[n - 1] - sorted[0], sorted };
}

// La escuela puede servir MathNova por HTTP en su red local.
export function newAttemptId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
