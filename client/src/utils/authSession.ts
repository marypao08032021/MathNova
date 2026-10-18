export const TOKEN_KEY = "token";
export const USER_KEY = "usuario";
export const GUEST_KEY = "modoInvitado";

const TOKEN_KEYS = [
  "token",
  "authToken",
  "mathnova_token",
  "mathnovaToken",
];

const USER_KEYS = [
  "usuario",
  "user",
  "mathnova_user",
  "mathnova_session",
  "authUser",
  "auth_session",
  "session",
];

const leerJSON = (valor: string | null) => {
  if (!valor) return null;

  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
};

const esObjeto = (valor: unknown): valor is Record<string, unknown> => {
  return typeof valor === "object" && valor !== null;
};

const extraerUsuario = (datos: unknown) => {
  if (!esObjeto(datos)) return null;

  const usuarioInterno = datos.usuario ?? datos.user;

  if (esObjeto(usuarioInterno)) {
    return usuarioInterno;
  }

  return datos;
};

const pareceUsuario = (valor: unknown) => {
  if (!esObjeto(valor)) return false;

  return [
    "id_usuario",
    "id",
    "usuario_id",
    "id_alumno",
    "rol",
    "role",
    "tipo_usuario",
    "correo",
    "email",
    "nombre_completo",
    "nombre",
    "usuario",
  ].some((clave) => valor[clave] !== undefined && valor[clave] !== null);
};

const decodificarUsuarioDesdeToken = () => {
  const token = getAuthToken();

  if (!token) return null;

  const partes = token.split(".");

  if (partes.length < 2) return null;

  try {
    const payload = partes[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payloadConPadding =
      payload + "=".repeat((4 - (payload.length % 4)) % 4);

    const datos = JSON.parse(atob(payloadConPadding));
    const usuario = extraerUsuario(datos);

    return pareceUsuario(usuario) ? usuario : null;
  } catch {
    return null;
  }
};

export function clearAuthSession() {
  window.dispatchEvent(new Event("mathnova-before-logout"));
  sessionStorage.removeItem("mathnova_tester_session");
  TOKEN_KEYS.forEach((clave) => {
    localStorage.removeItem(clave);
    sessionStorage.removeItem(clave);
  });

  USER_KEYS.forEach((clave) => {
    localStorage.removeItem(clave);
    sessionStorage.removeItem(clave);
  });

  localStorage.removeItem(GUEST_KEY);
  sessionStorage.removeItem(GUEST_KEY);
}

export function startGuestSession() {
  clearAuthSession();
  localStorage.setItem(GUEST_KEY, "true");
}

export function saveAuthSession(token: string, usuario: unknown) {
  sessionStorage.removeItem("mathnova_tester_session");
  localStorage.removeItem(GUEST_KEY);
  sessionStorage.removeItem(GUEST_KEY);

  const usuarioTexto = JSON.stringify(usuario ?? {});

  localStorage.setItem("token", token);
  localStorage.setItem("mathnova_token", token);

  localStorage.setItem("usuario", usuarioTexto);
  localStorage.setItem("mathnova_user", usuarioTexto);
}

export function getAuthToken() {
  for (const clave of TOKEN_KEYS) {
    const token =
      localStorage.getItem(clave) ||
      sessionStorage.getItem(clave);

    if (token) return token;
  }

  return null;
}

export function hasAuthSession() {
  return Boolean(getAuthToken());
}

export function isGuestSession() {
  return localStorage.getItem(GUEST_KEY) === "true" && !hasAuthSession();
}

export function getSessionUser() {
  for (const clave of USER_KEYS) {
    const valores = [
      localStorage.getItem(clave),
      sessionStorage.getItem(clave),
    ];

    for (const valor of valores) {
      const datos = leerJSON(valor);

      if (!datos) continue;

      const usuario = extraerUsuario(datos);

      if (pareceUsuario(usuario)) {
        return usuario;
      }
    }
  }

  return decodificarUsuarioDesdeToken();
}

export function getDisplayName() {
  if (isGuestSession()) return "Explorador";

  const usuario = getSessionUser();

  const nombre =
    usuario?.nombre_completo ||
    usuario?.nombreCompleto ||
    usuario?.nombre ||
    usuario?.usuario ||
    usuario?.correo ||
    "Alumno";

  return String(nombre).split(" ")[0];
}
