import { evaluateRampas } from './rampasValidation';
import { ActividadRampas } from '../models';

export interface VerificarRequest {
  id_estudiante: number;
  pendiente_ascenso: string;
  pendiente_descenso: string;
  ecuacion_ascenso: string;
  ecuacion_descenso: string;
  bitacora_pendiente_ascenso: string;
  bitacora_ecuacion_ascenso: string;
  bitacora_pendiente_descenso: string;
  bitacora_ecuacion_descenso: string;
  tiempo_total?: number;
}

export interface VerificarResponse {
  correcto: boolean;
  aciertos: number;
  mensaje: string;
  intentos: number;
  error_signo_descenso?: boolean;
  completada?: boolean;
  xp_obtenido?: number;
}

export interface ReiniciarResponse {
  mensaje: string;
}

class RampasService {
  // Valores correctos según el documento de especificación:
  // Rampa 1 (ascenso): y = 3x, pendiente positiva
  // Rampa 2 (descenso): y = -2x, pendiente negativa
  private readonly PENDIENTE_ASCENSO_CORRECTA = 'positiva';
  private readonly PENDIENTE_DESCENSO_CORRECTA = 'negativa';
  private readonly VALOR_ASCENSO = '3';
  private readonly VALOR_DESCENSO = '2';

  async verificarRespuestas(data: VerificarRequest): Promise<VerificarResponse> {
    const { id_estudiante, tiempo_total, ...respuestas } = data;

    let progreso = await ActividadRampas.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      progreso = await ActividadRampas.create({
        id_estudiante,
        pendiente_ascenso: null,
        pendiente_descenso: null,
        ecuacion_ascenso: null,
        ecuacion_descenso: null,
        bitacora_pendiente_ascenso: null,
        bitacora_ecuacion_ascenso: null,
        bitacora_pendiente_descenso: null,
        bitacora_ecuacion_descenso: null,
        error_signo_descenso: false,
        intentos_verificacion: 0,
        completada: false,
        resultado_correcto: null,
        tiempo_total: 0,
        xp_obtenido: 0,
        historial_intentos: [],
      });
    }

    const evaluacion = evaluateRampas(respuestas);
    const esCorrecto = evaluacion.correcto;
    const errorSigno = evaluacion.error_signo_descenso;

    const intentoActual = progreso.intentos_verificacion + 1;

    // Clonamos el arreglo (no mutamos la referencia original) para que
    // Sequelize detecte el cambio y lo guarde en la base de datos.
    const historial = [...(progreso.historial_intentos as any[])];
    historial.push({
      fecha: new Date().toISOString(),
      correcto: esCorrecto,
      error_signo_descenso: errorSigno,
      respuestas,
    });

    const actualizacion: Record<string, unknown> = {
      pendiente_ascenso: respuestas.pendiente_ascenso,
      pendiente_descenso: respuestas.pendiente_descenso,
      ecuacion_ascenso: respuestas.ecuacion_ascenso,
      ecuacion_descenso: respuestas.ecuacion_descenso,
      bitacora_pendiente_ascenso: respuestas.bitacora_pendiente_ascenso,
      bitacora_ecuacion_ascenso: respuestas.bitacora_ecuacion_ascenso,
      bitacora_pendiente_descenso: respuestas.bitacora_pendiente_descenso,
      bitacora_ecuacion_descenso: respuestas.bitacora_ecuacion_descenso,
      error_signo_descenso: errorSigno,
      intentos_verificacion: intentoActual,
      resultado_correcto: esCorrecto,
      historial_intentos: historial,
    };

    if (esCorrecto) {
      actualizacion.completada = true;
      actualizacion.xp_obtenido = 100;
      if (typeof tiempo_total === 'number') {
        actualizacion.tiempo_total = tiempo_total;
      }
    }

    await progreso.update(actualizacion);

    if (esCorrecto) {
      return {
        correcto: true,
        aciertos: evaluacion.aciertos,
        mensaje: '¡Misión cumplida! Calibraste las dos rampas correctamente.',
        intentos: intentoActual,
        completada: true,
        xp_obtenido: 100,
      };
    }

    return {
      correcto: false,
      aciertos: evaluacion.aciertos,
      mensaje: errorSigno
        ? 'El valor numérico es correcto, pero falta el signo negativo. La nave baja, la pendiente es negativa.'
        : 'Algo no cuadra todavía. Revisa la tabla de cada rampa y vuelve a intentarlo.',
      intentos: intentoActual,
      error_signo_descenso: errorSigno,
    };
  }

  async obtenerProgreso(id_estudiante: number) {
    const progreso = await ActividadRampas.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return null;
    }

    return {
      pendiente_ascenso: progreso.pendiente_ascenso,
      pendiente_descenso: progreso.pendiente_descenso,
      ecuacion_ascenso: progreso.ecuacion_ascenso,
      ecuacion_descenso: progreso.ecuacion_descenso,
      bitacora_pendiente_ascenso: progreso.bitacora_pendiente_ascenso,
      bitacora_ecuacion_ascenso: progreso.bitacora_ecuacion_ascenso,
      bitacora_pendiente_descenso: progreso.bitacora_pendiente_descenso,
      bitacora_ecuacion_descenso: progreso.bitacora_ecuacion_descenso,
      completada: progreso.completada,
      resultado_correcto: progreso.resultado_correcto,
      intentos_verificacion: progreso.intentos_verificacion,
      xp_obtenido: progreso.xp_obtenido,
    };
  }

  // Reinicia los campos de trabajo, pero conserva intentos_verificacion e
  // historial_intentos como registro acumulado permanente para el docente.
  async reiniciarActividad(id_estudiante: number): Promise<ReiniciarResponse | null> {
    const progreso = await ActividadRampas.findOne({
      where: { id_estudiante },
    });

    if (!progreso) {
      return null;
    }

    await progreso.update({
      pendiente_ascenso: null,
      pendiente_descenso: null,
      ecuacion_ascenso: null,
      ecuacion_descenso: null,
      bitacora_pendiente_ascenso: null,
      bitacora_ecuacion_ascenso: null,
      bitacora_pendiente_descenso: null,
      bitacora_ecuacion_descenso: null,
      error_signo_descenso: false,
      completada: false,
      resultado_correcto: null,
      tiempo_total: 0,
      xp_obtenido: 0,
    });

    return {
      mensaje: 'Actividad reiniciada, puedes intentarlo de nuevo.',
    };
  }
}

export default new RampasService();