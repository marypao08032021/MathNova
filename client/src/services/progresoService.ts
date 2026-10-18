import {closePilot} from "../utils/pilotEvidence";
const API_URL = "/api/progreso";

export type GuardarProgresoPayload = {
  id_usuario: number | string;
  mundo: string;
  tema?: string | null;
  actividad_codigo: string;
  actividad_titulo: string;

  respuestas:
    | Record<string, unknown>
    | unknown[];

  aciertos: number;
  total_preguntas: number;
  tiempo_segundos?: number;
  xp_base?: number;

  /*
   * Indica que el alumno terminó el recorrido
   * de la actividad, aunque no tenga 100%.
   */
  completada?: boolean;
};

export type GuardarProgresoSesionPayload = Omit<
  GuardarProgresoPayload,
  "id_usuario"
>;

export type ProgresoActividad = {
  id_progreso: number;
  id_usuario: number;

  mundo: string;
  tema: string | null;

  actividad_codigo: string;
  actividad_titulo: string;

  respuestas:
    | Record<string, unknown>
    | unknown[];

  aciertos: number;
  total_preguntas: number;
  precision: number;

  estrellas_obtenidas: number;
  xp_obtenido: number;

  intentos: number;
  completada: boolean;
  tiempo_segundos: number;

  fecha_inicio?: string | null;
  fecha_ultimo_intento: string;
};

export type ResumenAlumno = {
  estrellas_totales: number;
  estrellas_ganadas?: number;

  xp_total: number;

  actividades_completadas: number;
  lecciones_completadas?: number;
  actividades_intentadas: number;

  precision_promedio: number;
  promedio_general?: number;
  progreso_general?: number;

  tiempo_total_segundos: number;
  tiempo_estudio_segundos?: number;
  tiempo_estudio_minutos?: number;

  racha_actual?: number;
};

export type MundoResumen = {
  mundo: string;
  completadas: number;
  intentadas: number;
  estrellas: number;
  xp: number;
  precision: number;
};

export type RespuestaGuardarProgreso = {
  intento_piloto?: {id:string;tiempo_segundos:number;xp_obtenido:number;estrellas_obtenidas:number;evaluacion:{aciertos:number;total:number;precision:number;completada:boolean;items:{id:string;pregunta:string;respuesta:unknown;correcta:boolean|null;detalle?:{pregunta:string;respuesta:unknown;correcta:boolean|null}[]}[]}};
  ok: boolean;
  mensaje: string;
  progreso: ProgresoActividad;
};

export type RespuestaProgresoAlumno = {
  ok: boolean;
  total?: number;
  progreso: ProgresoActividad[];
};

export type RespuestaResumenAlumno = {
  ok: boolean;
  resumen: ResumenAlumno;
  mundos: MundoResumen[];
};

export type RespuestaProgresoActividad = {
  ok: boolean;
  progreso: ProgresoActividad | null;
};

type UsuarioSesion = {
  id?: number | string;
  id_usuario?: number | string;
  usuario_id?: number | string;
  id_alumno?: number | string;

  usuario?: UsuarioSesion;
  user?: UsuarioSesion;
};

const obtenerToken = (): string | null => {
  return (
    localStorage.getItem("mathnova_token") ||
    sessionStorage.getItem("mathnova_token") ||
    localStorage.getItem("mathnovaToken") ||
    sessionStorage.getItem("mathnovaToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

const decodificarUsuarioDesdeToken = (): UsuarioSesion | null => {
  const token = obtenerToken();

  if (!token) return null;

  const partes = token.split(".");

  if (partes.length < 2) return null;

  try {
    const payload = partes[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payloadConPadding =
      payload + "=".repeat((4 - (payload.length % 4)) % 4);

    return JSON.parse(atob(payloadConPadding)) as UsuarioSesion;
  } catch {
    return null;
  }
};

const obtenerIdDesdeUsuario = (usuario?: UsuarioSesion | null): number | null => {
  const id = Number(
    usuario?.id_usuario ??
      usuario?.id ??
      usuario?.usuario_id ??
      usuario?.id_alumno,
  );

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

const getAuthHeaders = (): HeadersInit => {
  const token = obtenerToken();

  return {
    "Content-Type": "application/json",
    Accept: "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const leerUsuarioGuardado = (): UsuarioSesion | null => {
  const claves = [
    "usuario",
    "mathnova_user",
    "user",
    "authUser",
    "auth_session",
    "session",
  ];

  for (const clave of claves) {
    const valores = [
      localStorage.getItem(clave),
      sessionStorage.getItem(clave),
    ];

    for (const valor of valores) {
      if (!valor) {
        continue;
      }

      try {
        const datos = JSON.parse(valor) as UsuarioSesion;
        const usuario = (datos.usuario && typeof datos.usuario === "object") ? datos.usuario : (datos.user && typeof datos.user === "object") ? datos.user : datos;

        if (obtenerIdDesdeUsuario(usuario)) {
          return usuario;
        }
      } catch {
        continue;
      }
    }
  }

  return null;
};

export const obtenerIdUsuarioAutenticado = (): number | null => {
  const candidatos = [
    leerUsuarioGuardado(),
    decodificarUsuarioDesdeToken(),
  ];

  for (const usuario of candidatos) {
    const id = obtenerIdDesdeUsuario(usuario);

    if (id) {
      return id;
    }
  }

  return null;
};

const manejarRespuesta = async <T>(
  response: Response,
): Promise<T> => {
  const texto = await response.text();

  let data: unknown = null;

  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      data = {
        mensaje: texto,
      };
    }
  }

  if (!response.ok) {
    const respuestaError = data as {
      mensaje?: string;
      detalle?: string;
    } | null;

    const mensaje =
      respuestaError?.detalle ||
      respuestaError?.mensaje ||
      `Error ${response.status} al consultar el progreso.`;

    throw new Error(mensaje);
  }

  return data as T;
};

const validarPayload = (
  payload: GuardarProgresoPayload,
): void => {
  const idUsuario = Number(payload.id_usuario);
  const aciertos = Number(payload.aciertos);
  const totalPreguntas = Number(payload.total_preguntas);

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    throw new Error(
      "No se encontró un id_usuario válido para guardar el progreso.",
    );
  }

  if (!payload.mundo.trim()) {
    throw new Error(
      "El mundo de la actividad es obligatorio.",
    );
  }

  if (!payload.actividad_codigo.trim()) {
    throw new Error(
      "El código de la actividad es obligatorio.",
    );
  }

  if (!payload.actividad_titulo.trim()) {
    throw new Error(
      "El título de la actividad es obligatorio.",
    );
  }

  if (
    !Number.isFinite(aciertos) ||
    aciertos < 0
  ) {
    throw new Error(
      "La cantidad de aciertos no es válida.",
    );
  }

  if (
    !Number.isFinite(totalPreguntas) ||
    totalPreguntas <= 0
  ) {
    throw new Error(
      "El total de preguntas debe ser mayor que cero.",
    );
  }

  if (aciertos > totalPreguntas) {
    throw new Error(
      "Los aciertos no pueden superar el total de preguntas.",
    );
  }
};

export const guardarProgresoActividad = async (
  payload: GuardarProgresoPayload,
): Promise<RespuestaGuardarProgreso> => {
  validarPayload(payload);

  return closePilot(payload, async payload => {
  const response = await fetch(
    `${API_URL}/actividad`,
    {
      method: "POST",
      headers: getAuthHeaders(),

      body: JSON.stringify({
        ...payload,

        id_usuario: Number(payload.id_usuario),
        aciertos: Number(payload.aciertos),
        total_preguntas: Number(
          payload.total_preguntas,
        ),

        tiempo_segundos: Math.max(
          0,
          Number(payload.tiempo_segundos ?? 0),
        ),

        xp_base: Math.max(
          0,
          Number(payload.xp_base ?? 50),
        ),

        completada:
          payload.completada ?? true,

        tema: payload.tema ?? null,
        respuestas: payload.respuestas ?? {},
      }),
    },
  );

  return manejarRespuesta<RespuestaGuardarProgreso>(response);
  });
};

/*
 * Esta función es la más cómoda para usar
 * desde las actividades.
 *
 * Obtiene automáticamente el id_usuario
 * que inició sesión.
 */
export const guardarProgresoUsuarioActual = async (
  payload: GuardarProgresoSesionPayload,
): Promise<RespuestaGuardarProgreso> => {
  const idUsuario =
    obtenerIdUsuarioAutenticado();

  if (!idUsuario) {
    throw new Error(
      "No se encontró el usuario autenticado. Inicia sesión nuevamente.",
    );
  }

  return guardarProgresoActividad({
    ...payload,
    id_usuario: idUsuario,
  });
};

export const obtenerProgresoAlumno = async (
  idUsuario: number | string,
): Promise<RespuestaProgresoAlumno> => {
  const idSeguro = encodeURIComponent(
    String(idUsuario),
  );

  const response = await fetch(
    `${API_URL}/alumno/${idSeguro}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  return manejarRespuesta<RespuestaProgresoAlumno>(
    response,
  );
};

export const obtenerResumenAlumno = async (
  idUsuario: number | string,
): Promise<RespuestaResumenAlumno> => {
  const idSeguro = encodeURIComponent(
    String(idUsuario),
  );

  const response = await fetch(
    `${API_URL}/resumen/${idSeguro}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  return manejarRespuesta<RespuestaResumenAlumno>(
    response,
  );
};

export const obtenerProgresoActividad = async (
  idUsuario: number | string,
  actividadCodigo: string,
): Promise<RespuestaProgresoActividad> => {
  const idSeguro = encodeURIComponent(
    String(idUsuario),
  );

  const codigoSeguro = encodeURIComponent(
    actividadCodigo,
  );

  const response = await fetch(
    `${API_URL}/actividad/${idSeguro}/${codigoSeguro}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  return manejarRespuesta<RespuestaProgresoActividad>(
    response,
  );
};
