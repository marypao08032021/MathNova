export interface RampasAnswers {
  pendiente_ascenso: string; pendiente_descenso: string;
  ecuacion_ascenso: string; ecuacion_descenso: string;
  bitacora_pendiente_ascenso: string; bitacora_pendiente_descenso: string;
  bitacora_ecuacion_ascenso: string; bitacora_ecuacion_descenso: string;
}
const clean = (value: string) => String(value ?? '').toLowerCase().replace(/[−–]/g,'-').replace(/\s/g,'');
function coefficient(value: string): number | null {
  const match = clean(value).match(/^(?:y=)?([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\*?x)?$/);
  return match ? Number(match[1]) : null;
}
function slope(value: string, expected: number): boolean {
  const normalized=clean(value);
  const aliases=expected>0?['positiva','positivo','+']:['negativa','negativo','-'];
  if(aliases.includes(normalized))return true;
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) && Number(normalized)===expected;
}
export function evaluateRampas(a: RampasAnswers) {
  const ascenso = clean(a.pendiente_ascenso)==='positiva' && coefficient(a.ecuacion_ascenso)===3 && slope(a.bitacora_pendiente_ascenso,3) && coefficient(a.bitacora_ecuacion_ascenso)===3;
  // Arriba la interfaz ya imprime y = - [ ] x: ese campo recibe 2.
  const descenso = clean(a.pendiente_descenso)==='negativa' && coefficient(a.ecuacion_descenso)===2 && slope(a.bitacora_pendiente_descenso,-2) && coefficient(a.bitacora_ecuacion_descenso)===-2;
  const errorSigno = coefficient(a.bitacora_pendiente_descenso)===2 || coefficient(a.bitacora_ecuacion_descenso)===2;
  return {correcto:ascenso&&descenso,aciertos:Number(ascenso)+Number(descenso),error_signo_descenso:errorSigno};
}
