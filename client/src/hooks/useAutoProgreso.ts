import {guardarProgresoActividad} from "../services/progresoService";
import {pilotCodes} from "../utils/pilotEvidence";
import { useEffect, useRef, useState } from "react";
import {
  getSessionUser,
  hasAuthSession,
  isGuestSession,
} from "../utils/authSession";

type RegistroDesconocido = Record<string, unknown>;

export type AutoProgresoOptions = {
  completada: boolean;
  codigo: string;
  mundo: string;
  titulo: string;
  tema?: string;
  aciertos: number;
  totalPreguntas: number;
  tiempoSegundos: number;
  xpBase?: number;
  respuestas?: unknown;
  habilitado?: boolean;
};

export type EstadoAutoProgreso = {
  guardando: boolean;
  guardado: boolean;
  error: string | null;
};

const API_URL_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "/api";

const PROGRESO_ACTIVIDAD_URL = API_URL_BASE.endsWith("/api")
  ? `${API_URL_BASE}/progreso/actividad`
  : `${API_URL_BASE}/api/progreso/actividad`;

const CLAVES_SESION = [
  "auth_session",
  "usuario",
  "user",
  "session_user",
  "sessionUser",
  "mathnova_user",
  "authUser",
];

const CLAVES_ID = [
  "id_usuario",
  "idUsuario",
  "usuario_id",
  "user_id",
  "userId",
  "id",
];

const CLAVES_ANIDADAS = [
  "usuario",
  "user",
  "data",
  "session",
  "auth",
  "perfil",
  "account",
];

function esRegistro(valor: unknown): valor is RegistroDesconocido {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function convertirId(valor: unknown): number {
  const id = Number(valor);

  return Number.isInteger(id) && id > 0 ? id : 0;
}

function obtenerIdDeObjeto(
  valor: unknown,
  profundidad = 0,
): number {
  if (!esRegistro(valor) || profundidad > 3) {
    return 0;
  }

  /*
   * Primero busca los nombres de id más específicos.
   */
  for (const clave of CLAVES_ID) {
    const id = convertirId(valor[clave]);

    if (id > 0) {
      return id;
    }
  }

  /*
   * Después revisa estructuras comunes como:
   * { usuario: {...} }, { user: {...} }, { data: {...} }.
   */
  for (const clave of CLAVES_ANIDADAS) {
    const id = obtenerIdDeObjeto(
      valor[clave],
      profundidad + 1,
    );

    if (id > 0) {
      return id;
    }
  }

  return 0;
}

function leerJsonLocalStorage(clave: string): unknown {
  try {
    const valor = localStorage.getItem(clave);

    if (!valor) {
      return null;
    }

    return JSON.parse(valor);
  } catch {
    return null;
  }
}

function obtenerIdUsuario(): number {
  const candidatos: unknown[] = [
    getSessionUser(),
  ];

  for (const clave of CLAVES_SESION) {
    candidatos.push(leerJsonLocalStorage(clave));
  }

  for (const candidato of candidatos) {
    const id = obtenerIdDeObjeto(candidato);

    if (id > 0) {
      return id;
    }
  }

  return 0;
}

export function useAutoProgreso({
  completada,
  codigo,
  mundo,
  titulo,
  tema = "",
  aciertos,
  totalPreguntas,
  tiempoSegundos,
  xpBase = 120,
  respuestas = {},
  habilitado = true,
}: AutoProgresoOptions): EstadoAutoProgreso {
  const guardadoRef = useRef(false);
  const guardandoRef = useRef(false);

  /*
   * Conserva siempre los datos más recientes, pero evita cancelar
   * la petición por renders de audio, animaciones o temporizadores.
   */
  const datosRef = useRef({
    codigo,
    mundo,
    titulo,
    tema,
    aciertos,
    totalPreguntas,
    tiempoSegundos,
    xpBase,
    respuestas,
  });

  datosRef.current = {
    codigo,
    mundo,
    titulo,
    tema,
    aciertos,
    totalPreguntas,
    tiempoSegundos,
    xpBase,
    respuestas,
  };

  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /*
     * Al reiniciar la actividad, permite registrar otro intento.
     */
    if (!completada) {
      guardadoRef.current = false;
      guardandoRef.current = false;
      setGuardado(false);
      setGuardando(false);
      setError(null);
      return;
    }

    if (
      !habilitado ||
      guardadoRef.current ||
      guardandoRef.current
    ) {
      return;
    }

    if (isGuestSession() && !hasAuthSession()) {
      console.warn(
        "[useAutoProgreso] Sesión de invitado: no se guardó el progreso.",
      );
      return;
    }

    const idUsuario = obtenerIdUsuario();

    if (!idUsuario) {
      const mensaje =
        "No se encontró un id_usuario válido en la sesión.";

      console.error(`[useAutoProgreso] ${mensaje}`);
      setError(mensaje);
      return;
    }

    const datos = datosRef.current;

    const payload = {
      id_usuario: idUsuario,
      mundo: datos.mundo.trim(),
      tema: datos.tema.trim() || null,
      actividad_codigo: datos.codigo.trim(),
      actividad_titulo: datos.titulo.trim(),
      respuestas: (datos.respuestas ?? {}) as Record<string,unknown> | unknown[],
      aciertos: Math.max(
        0,
        Number(datos.aciertos) || 0,
      ),
      total_preguntas: Math.max(
        0,
        Number(datos.totalPreguntas) || 0,
      ),
      tiempo_segundos: Math.max(
        0,
        Math.round(Number(datos.tiempoSegundos) || 0),
      ),
      xp_base: Math.max(
        0,
        Math.round(Number(datos.xpBase) || 0),
      ),
      completada: true,
    };

    const guardarProgreso = async () => {
      guardandoRef.current = true;
      setGuardando(true);
      setGuardado(false);
      setError(null);

      console.log(
        `[useAutoProgreso] Enviando progreso: ${payload.actividad_codigo}`,
        payload,
      );

      try {
        if(pilotCodes.has(payload.actividad_codigo)) { await guardarProgresoActividad(payload);guardadoRef.current=true;setGuardado(true);return; }
        const response = await fetch(
          PROGRESO_ACTIVIDAD_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          },
        );

        const textoRespuesta = await response.text();

        let resultado: any = null;

        try {
          resultado = textoRespuesta
            ? JSON.parse(textoRespuesta)
            : null;
        } catch {
          resultado = null;
        }

        if (!response.ok) {
          const detalle =
            resultado?.detalle ||
            resultado?.mensaje ||
            resultado?.message ||
            textoRespuesta ||
            `Error HTTP ${response.status}`;

          throw new Error(detalle);
        }

        guardadoRef.current = true;
        setGuardado(true);

        console.log(
          `[useAutoProgreso] Progreso guardado: ${payload.actividad_codigo}`,
          resultado,
        );
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo guardar el progreso.";

        console.error(
          `[useAutoProgreso] Error al guardar "${payload.actividad_codigo}":`,
          errorDesconocido,
        );

        setError(mensaje);
      } finally {
        guardandoRef.current = false;
        setGuardando(false);
      }
    };

    void guardarProgreso();
  }, [completada, habilitado]);

  return {
    guardando,
    guardado,
    error,
  };
}
