import catalogoAula from "../curriculum/aulaCatalog.json";
import AulaActivityGate from "../components/AulaActivityGate";
import {isTesterSession} from "../utils/testerSession";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  hasAuthSession,
  isGuestSession,
  getSessionUser
} from "../utils/authSession";

type RequireAuthProps = {
  children: ReactNode;
  rolesPermitidos?: string[];
  permitirInvitado?: boolean;
};

type SessionUser = {
  rol?: string;
  role?: string;
  tipo_usuario?: string;
  role_id?: number | string;
  roleId?: number | string;
  id_rol?: number | string;
};

const normalizarRol = (rol?: string, roleId?: number | string) => {
  const valor = String(rol || "").toLowerCase().trim();
  const idRol = Number(roleId);

  if (
    [
      "docente_estudiante",
      "docente-estudiante",
      "docente-alumno",
      "docente_alumno",
      "maestro_estudiante",
      "maestro-estudiante",
      "mixto"
    ].includes(valor)
  ) {
    return "docente_estudiante";
  }

  if (["alumno", "student", "usuario", "estudiante"].includes(valor)) {
    return "estudiante";
  }

  if (["admin", "administrador"].includes(valor)) {
    return "admin";
  }

  if (["docente", "profesor", "maestro"].includes(valor)) {
    return "docente";
  }

  if (idRol === 1) return "docente";
  if (idRol === 2) return "estudiante";
  if (idRol === 3) return "admin";
  if (idRol === 4) return "docente_estudiante";

  return "";
};

const puedeEntrarPorRol = (rolUsuario: string, rolesPermitidos: string[]) => {
  if (!rolUsuario) return false;
  if (rolUsuario === "admin") return true;

  if (rolesPermitidos.includes(rolUsuario)) {
    return true;
  }

  if (
    rolUsuario === "docente_estudiante" &&
    (rolesPermitidos.includes("docente") ||
      rolesPermitidos.includes("estudiante"))
  ) {
    return true;
  }

  return false;
};

const obtenerRutaPorRol = (rolUsuario: string) => {
  if (rolUsuario === "admin") {
    return "/dashboard-admin";
  }

  if (rolUsuario === "docente" || rolUsuario === "docente_estudiante") {
    return "/dashboard-docente";
  }

  return "/dashboard";
};

export default function RequireAuth({
  children,
  rolesPermitidos,
  permitirInvitado = false
}: RequireAuthProps) {
  const location = useLocation();

  const tieneSesion = hasAuthSession();
  const esInvitado = isGuestSession();
  const usuario = getSessionUser() as SessionUser | null;

  if (!tieneSesion && !esInvitado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          authMessage:
            "Para iniciar una actividad necesitas iniciar sesión o crear una cuenta."
        }}
      />
    );
  }

  if (esInvitado && !permitirInvitado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          authMessage:
            "Esta sección requiere iniciar sesión. Crea una cuenta para continuar."
        }}
      />
    );
  }

  if (esInvitado && permitirInvitado) {
    return <>{children}</>;
  }

  if (tieneSesion && !usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          authMessage: "Tu sesión no es válida. Inicia sesión nuevamente."
        }}
      />
    );
  }

  const rolUsuario = normalizarRol(
    usuario?.rol || usuario?.role || usuario?.tipo_usuario,
    usuario?.role_id || usuario?.roleId || usuario?.id_rol
  );

  const tester = isTesterSession();
  const learnerPath = /^\/(dashboard$|seleccion-mundos$|perfil-alumno$|estadisticas$|retroalimentacion$|recompensas$|actividades\/(?:geometria|mathnumbers)(?:\/|$)|actividades-math-(?:data|numbers)(?:\/|$)|temas\/)/i.test(location.pathname);
  if (["docente", "docente_estudiante"].includes(rolUsuario) && learnerPath && !tester) {
    return <Navigate to="/dashboard-docente" replace/>;
  }
  if (tester && !learnerPath) {
    return <Navigate to="/dashboard" replace/>;
  }
  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const rolesNormalizados = rolesPermitidos.map((rol) => normalizarRol(rol));
    const rolParaValidar =
      (tester ? "estudiante" : rolUsuario) ||
      (rolesNormalizados.includes("estudiante") ? "estudiante" : "");

    if (!puedeEntrarPorRol(rolParaValidar, rolesNormalizados)) {
      if (!rolParaValidar) {
        return (
          <Navigate
            to="/login"
            replace
            state={{
              from: location.pathname,
              authMessage:
                "Tu sesión no tiene un rol válido. Inicia sesión nuevamente."
            }}
          />
        );
      }

      return <Navigate to={obtenerRutaPorRol(rolParaValidar)} replace />;
    }
  }

  let path=location.pathname;
  try{path=decodeURIComponent(path)}catch{/* Una URL no válida no identifica una misión. */}
  const activity=catalogoAula.find(a=>a.ruta===path.toLowerCase().replace(/\/+$/, ""));
  return activity?<AulaActivityGate codigo={activity.codigo}>{children}</AulaActivityGate>:<>{children}</>;
}
