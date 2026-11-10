import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Registro() {
  const { error, setError, register } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [erroresForm, setErroresForm] = useState({});
  const navigate = useNavigate();

  const validarFormulario = () => {
    const nuevosErrores = {};
    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();

    if (!nombreLimpio) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else if (
      nombreLimpio.length < 2 ||
      !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(nombreLimpio)
    ) {
      nuevosErrores.nombre =
        "El nombre debe tener al menos 2 letras y solo contener letras y espacios";
    }

    if (!emailLimpio) {
      nuevosErrores.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      nuevosErrores.email = "Ingrese un formato de email válido";
    }

    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      nuevosErrores.password =
        "Debe tener al menos 8 caracteres, una letra minúscula y un número";
    }

    if (confirmarPassword !== password) {
      nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
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

    const res = await register(nombre.trim(), email.trim(), password);
    if (res.success) {
      navigate("/login", {
        state: {
          mensajeRegistro:
            "Usuario registrado con éxito. Ahora puede iniciar sesión.",
        },
      });
    }
  };

  return (
    <>
      <h2>Registro de Usuario</h2>
      <div className="formulario-contenedor">
        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="nombre">Nombre completo:</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej: Jimy Mercado"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            {erroresForm.nombre && (
              <p className="error-campo">{erroresForm.nombre}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
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
              type="password"
              placeholder="Mínimo 8 caracteres, letras y números"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {erroresForm.password && (
              <p className="error-campo">{erroresForm.password}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="confirmarPassword">Repetir contraseña:</label>
            <input
              id="confirmarPassword"
              type="password"
              placeholder="Repita su contraseña"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
            />
            {erroresForm.confirmarPassword && (
              <p className="error-campo">{erroresForm.confirmarPassword}</p>
            )}
          </div>

          {error && <p className="mensaje-error">{error}</p>}

          <div className="acciones">
            <button type="submit" className="btn-primario">
              Registrarse
            </button>
            <Link to="/login">
              <button type="button">Ya tengo cuenta</button>
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

