import { useState, type FormEvent } from "react";
import { registrarUsuario } from "../../services/authService";

import { MdOutlineEmail } from "react-icons/md";
import { LuLockKeyhole, LuUser } from "react-icons/lu";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaRegAddressCard } from "react-icons/fa";

type RegisterFormProps = {
  onBack: () => void;
};

function RegisterForm({ onBack }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");setSuccess(false);

    const nombreLimpio = nombreCompleto.trim();
    const correoLimpio = correo.trim().toLowerCase();

    if (!nombreLimpio || !correoLimpio || !password || !confirmarPassword) {
      setMessage("Completa todos los campos.");
      return;
    }

    if (!correoLimpio.includes("@")) {
      setMessage("Ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (!aceptoTerminos) {
      setMessage("Debes aceptar los términos y condiciones.");
      return;
    }

    try {
      setLoading(true);

      const data = await registrarUsuario({
        nombre_completo: nombreLimpio,
        correo: correoLimpio,
        password,
        confirmarPassword,
        acepto_terminos: aceptoTerminos,
      });

      setMessage(data.mensaje || "Cuenta creada correctamente.");

      setNombreCompleto("");
      setCorreo("");
      setPassword("");
      setConfirmarPassword("");
      setAceptoTerminos(false);

      console.log("Usuario registrado:", data.usuario);

      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
        console.error("Error al registrar:", error.message);
      } else {
        setMessage("No se pudo registrar el usuario.");
        console.error("Error desconocido:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form register-form" onSubmit={handleRegister}>
      <h1 id="mn-register-title">¡Crea tu cuenta!</h1>
      {message && <p role={success?"status":"alert"} className={success?"mn-register-success":"mn-register-error"}>{message}</p>}

      <p className="login-subtitle register-subtitle">
        Regístrate para comenzar tu aventura de aprendizaje en MathNova.
      </p>

      <div className="input-box">
        <LuUser className="input-icon" />
        <input
          type="text"
          placeholder="Nombre completo" autoFocus required maxLength={120} aria-label="Nombre completo"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
        />
      </div>

      <div className="input-box">
        <MdOutlineEmail className="input-icon" />
        <input
          type="email"
          placeholder="Correo electrónico" required maxLength={120} aria-label="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </div>

      <div className="input-box">
        <LuLockKeyhole className="input-icon" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña" required minLength={6} autoComplete="new-password" aria-label="Contraseña de registro"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {showPassword ? (
          <FiEye
            className="input-icon eye"
            onClick={() => setShowPassword(false)}
          />
        ) : (
          <FiEyeOff
            className="input-icon eye"
            onClick={() => setShowPassword(true)}
          />
        )}
      </div>

      <div className="input-box">
        <FaRegAddressCard className="input-icon" />

        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirmar contraseña" required minLength={6} autoComplete="new-password" aria-label="Confirmar contraseña"
          value={confirmarPassword}
          onChange={(e) => setConfirmarPassword(e.target.value)}
        />

        {showConfirmPassword ? (
          <FiEye
            className="input-icon eye"
            onClick={() => setShowConfirmPassword(false)}
          />
        ) : (
          <FiEyeOff
            className="input-icon eye"
            onClick={() => setShowConfirmPassword(true)}
          />
        )}
      </div>

      <label className="terms">
        <input
          type="checkbox"
          className="terms-checkbox"
          checked={aceptoTerminos}
          onChange={(e) => setAceptoTerminos(e.target.checked)}
        />
        <span className="custom-check"></span>
        <span>Acepto los términos y condiciones</span>
      </label>

      <button type="submit" className="login-btn" disabled={loading || success}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <div className="divider">
        <span>¿Ya tienes cuenta?</span>
      </div>

      <button type="button" className="create-btn" onClick={onBack}>
        Iniciar sesión
      </button>
    </form>
  );
}

export default RegisterForm;