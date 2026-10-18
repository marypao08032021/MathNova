import { useEffect, useState, type FormEvent } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  clearAuthSession,
  startGuestSession,
  saveAuthSession,
} from "../../utils/authSession";

import "./Login.css";
import "./RegistrationModal.css";

import zorritoLogin from "../../assets/zorrito_login.png";

import logo from "../../assets/logo_MathNova.png";

import { MdOutlineEmail } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import {
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiX,
} from "react-icons/fi";

import RegisterForm from "./RegisterForm";
import ForgotPassword from "./ForgotPassword";

import { iniciarSesion } from "../../services/authService";

type UsuarioLogin = {
  id_usuario?: number | string;
  nombre_completo?: string;
  correo?: string;
  usuario?: string | null;
  rol?: string;
  role_id?: number;
};

type EstadoLogin = {
  from?: string;
  authMessage?: string;
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const state =
    location.state as EstadoLogin | null;

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isRegister,
    setIsRegister,
  ] = useState(false);

  const [
    showForgot,
    setShowForgot,
  ] = useState(false);

  const [
    correoUsuario,
    setCorreoUsuario,
  ] = useState("");

  const [
    loginPassword,
    setLoginPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    mensajeError,
    setMensajeError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isRegister) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>(".mn-register-dialog");
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {setIsRegister(false);return;}
      if (event.key !== "Tab" || !dialog) return;
      const fields = [...dialog.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled),a[href],select,textarea")];
      const first=fields[0],last=fields.at(-1);
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener("keydown",key);
    return () => {document.removeEventListener("keydown",key);previous?.focus();};
  }, [isRegister]);

  const limpiarSesionAnterior = () => {
    clearAuthSession();
  };

  const normalizarRol = (
    usuario?: UsuarioLogin,
  ) => {
    const rolTexto = String(
      usuario?.rol || "",
    )
      .toLowerCase()
      .trim();

    if (
      [
        "alumno",
        "student",
        "usuario",
        "estudiante",
      ].includes(rolTexto)
    ) {
      return "estudiante";
    }

    if (
      [
        "admin",
        "administrador",
      ].includes(rolTexto)
    ) {
      return "admin";
    }

    if (
      [
        "docente",
        "profesor",
        "maestro",
        "docente_estudiante",
        "docente_alumno",
        "docente-estudiante",
        "docente-alumno",
        "maestro_estudiante",
        "maestro-estudiante",
        "mixto",
      ].includes(rolTexto)
    ) {
      return "docente";
    }

    if ([1, 4].includes(Number(usuario?.role_id))) {
      return "docente";
    }

    if (Number(usuario?.role_id) === 2) {
      return "estudiante";
    }

    if (Number(usuario?.role_id) === 3) {
      return "admin";
    }

    return "estudiante";
  };

  const guardarSesion = (
    token: string,
    usuario: UsuarioLogin,
  ) => {
    limpiarSesionAnterior();

    saveAuthSession(
      token,
      usuario,
    );
  };

  const obtenerRutaPorRol = (
    rol: string,
  ) => {
    if (rol === "docente") {
      return "/dashboard-docente";
    }

    if (rol === "admin") {
      return "/dashboard-admin";
    }

    return "/dashboard";
  };

  const rutaPerteneceAlRol = (
    ruta: string | undefined,
    rol: string,
  ) => {
    if (
      !ruta ||
      ruta === "/" ||
      ruta === "/login"
    ) {
      return false;
    }

    if (rol === "docente") {
      return (
        ruta.includes("-docente") ||
        ruta ===
          "/dashboard-docente" ||
        ruta ===
          "/gestion-docentes"
      );
    }

    if (rol === "admin") {
      return (
        ruta.includes("-admin") ||
        ruta.startsWith("/admin")
      );
    }

    return (
      !ruta.includes("-docente") &&
      !ruta.includes("-admin")
    );
  };

  /*
   * Los estudiantes entran al dashboard con una señal
   * para abrir el video emergente.
   *
   * Docentes y administradores conservan su
   * redireccionamiento normal.
   */
  const redirigirPorRol = (
    usuario: UsuarioLogin,
  ) => {
    const rol =
      normalizarRol(usuario);

    const rutaInicial =
      obtenerRutaPorRol(rol);
    if (rol === "docente") {
      navigate("/dashboard-docente", { replace: true });
      return;
    }

    const rutaAnterior =
      state?.from;

    /*
     * Mostrar la introducción solamente
     * para estudiantes registrados.
     */
    if (rol === "estudiante") {
      navigate("/dashboard", {
        replace: true,
        state: {
          mostrarIntroduccion: true,
        },
      });

      return;
    }

    /*
     * Docentes y administradores pueden volver
     * a la ruta que intentaban visitar.
     */
    if (
      rutaPerteneceAlRol(
        rutaAnterior,
        rol,
      ) &&
      rutaAnterior
    ) {
      navigate(rutaAnterior, {
        replace: true,
      });

      return;
    }

    navigate(rutaInicial, {
      replace: true,
    });
  };

  /*
   * El espectador entra directamente al dashboard
   * y no visualiza el video de introducción.
   */
  const entrarComoEspectador = () => {
    limpiarSesionAnterior();
    startGuestSession();

    navigate("/dashboard", {
      replace: true,
    });
  };

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (
      !correoUsuario.trim() ||
      !loginPassword.trim()
    ) {
      setMensajeError(
        "Ingresa tu correo/usuario y contraseña.",
      );

      return;
    }

    try {
      setLoading(true);

      const data =
        await iniciarSesion({
          correoUsuario:
            correoUsuario.trim(),

          password:
            loginPassword,
        });

      if (!data?.token) {
        throw new Error(
          "El servidor no devolvió un token válido.",
        );
      }

      if (!data?.usuario) {
        throw new Error(
          "El servidor no devolvió los datos del usuario.",
        );
      }

      guardarSesion(
        data.token,
        data.usuario,
      );

      console.log(
        "Usuario logueado:",
        data.usuario,
      );



      redirigirPorRol(
        data.usuario,
      );
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setMensajeError(
          error.message,
        );

        console.error(
          "Error al iniciar sesión:",
          error.message,
        );
      } else {
        setMensajeError(
          "No se pudo iniciar sesión.",
        );

        console.error(
          "Error desconocido:",
          error,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
    return (
      <ForgotPassword
        onBack={() =>
          setShowForgot(false)
        }
      />
    );
  }

  return (
    <main className="login-page">
      <div className="login-scene">
        <div
          className="login-card-flip"
        >
          <div className="login-card card-face card-front">
            <section className="login-left">
              <div className="poster">
                <img
                  src={logo}
                  alt="MathNova"
                  className="login-logo"
                />

                <p className="poster-text">
                  Explorando el universo
                  de las matemáticas
                </p>

                <img
                  src={zorritoLogin}
                  alt="Zorrito MathNova"
                  className="fox-img"
                />
              </div>
            </section>

            <section className="login-right">
              <form
                className="login-form"
                onSubmit={handleLogin}
              >
                <h1>
                  ¡Bienvenido de nuevo!
                </h1>

                <p className="login-subtitle">
                  Inicia sesión para
                  continuar aprendiendo
                  con MathNova.
                </p>

                {state?.authMessage && (
                  <div className="login-alert">
                    {
                      state.authMessage
                    }
                  </div>
                )}

                <div className="input-box">
                  <MdOutlineEmail className="input-icon" />

                  <input
                    type="text"
                    placeholder="Correo o usuario"
                    value={
                      correoUsuario
                    }
                    onChange={(e) =>
                      setCorreoUsuario(
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="input-box">
                  <LuLockKeyhole className="input-icon" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Contraseña"
                    value={
                      loginPassword
                    }
                    onChange={(e) =>
                      setLoginPassword(
                        e.target.value,
                      )
                    }
                  />

                  {showPassword ? (
                    <FiEye
                      className="input-icon eye"
                      onClick={() =>
                        setShowPassword(
                          false,
                        )
                      }
                    />
                  ) : (
                    <FiEyeOff
                      className="input-icon eye"
                      onClick={() =>
                        setShowPassword(
                          true,
                        )
                      }
                    />
                  )}
                </div>

                <a
                  href="#"
                  className="forgot"
                  onClick={(e) => {
                    e.preventDefault();

                    setShowForgot(
                      true,
                    );
                  }}
                >
                  ¿Olvidaste tu
                  contraseña?
                </a>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Iniciando sesión..."
                    : "Iniciar sesión"}
                </button>

                <button
                  type="button"
                  className="guest-button"
                  onClick={
                    entrarComoEspectador
                  }
                >
                  Entrar como espectador
                </button>

                <div className="divider">
                  <span>
                    ¿Eres nuevo aquí?
                  </span>
                </div>

                <button
                  type="button"
                  className="create-btn"
                  onClick={() =>
                    setIsRegister(
                      true,
                    )
                  }
                >
                  Crear cuenta
                </button>
              </form>
            </section>
          </div>


        </div>
      </div>

      {isRegister && <div className="mn-register-overlay"><section className="mn-register-dialog" role="dialog" aria-modal="true" aria-labelledby="mn-register-title"><button type="button" className="mn-register-close" aria-label="Cerrar registro" onClick={()=>setIsRegister(false)}>×</button><RegisterForm onBack={()=>setIsRegister(false)}/></section></div>}
      {mensajeError && (
        <div
          className="login-error-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setMensajeError(
                null,
              );
            }
          }}
        >
          <section
            className="login-error-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="login-error-title"
          >
            <button
              type="button"
              className="login-error-close"
              onClick={() =>
                setMensajeError(
                  null,
                )
              }
              aria-label="Cerrar mensaje"
            >
              <FiX />
            </button>

            <div className="login-error-icon">
              <FiAlertTriangle />
            </div>

            <span className="login-error-label">
              Inicio de sesión
            </span>

            <h2 id="login-error-title">
              No pudimos iniciar sesión
            </h2>

            <p>
              {mensajeError}
            </p>

            <button
              type="button"
              className="login-error-button"
              onClick={() =>
                setMensajeError(
                  null,
                )
              }
              autoFocus
            >
              Intentar de nuevo
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default Login;
