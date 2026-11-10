import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Login() {
  const { error, setError, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erroresForm, setErroresForm] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const mensajeRegistro = location.state?.mensajeRegistro || null;

  const validarFormulario = () => {
    const nuevosErrores = {};
    const emailLimpio = email.trim();

    if (!emailLimpio) {
      nuevosErrores.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      nuevosErrores.email = "Ingrese un formato de email válido";
    }

    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria";
    }

    setErroresForm(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validarFormulario()) {
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate("/vehiculos");
    }
  };

  return (
    <>
      <h2>Iniciar Sesión</h2>
      <div className="formulario-contenedor">
        {mensajeRegistro && (
          <p className="mensaje-exito">{mensajeRegistro}</p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jimy@transporte.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {erroresForm.email && (
              <p className="error-campo">{erroresForm.email}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña:</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {erroresForm.password && (
              <p className="error-campo">{erroresForm.password}</p>
            )}
          </div>

          {error && <p className="mensaje-error">{error}</p>}

          <div className="acciones">
            <button type="submit" className="btn-primario">
              Ingresar
            </button>
            <Link to="/registro">
              <button type="button">Crear cuenta</button>
            </Link>
            <Link to="/">
              <button type="button">Volver</button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

