import { createContext, useCallback, useContext, useState } from "react";

export const API_URL = "http://localhost:3000";

const STORAGE_KEY = "tp3_sesion_transporte";

function leerSesionGuardada() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, usuario: null };
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || null,
      usuario: parsed.usuario || null,
    };
  } catch {
    return { token: null, usuario: null };
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatearErrorApi(data, fallback = "Ocurrió un error") {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (Array.isArray(data.errores) && data.errores.length > 0) {
    return data.errores.map((e) => e.msg).join(". ");
  }
  if (data.mensaje) return data.mensaje;
  return fallback;
}

// Contexto para compartir el estado de autenticación y autorización
const AuthContext = createContext(null);

// Hook personalizado para acceder al contexto de auth
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const sesionInicial = leerSesionGuardada();
  const [token, setToken] = useState(sesionInicial.token);
  const [usuario, setUsuario] = useState(sesionInicial.usuario);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(formatearErrorApi(data, "No se pudo iniciar sesión"));
      }

      setToken(data.token);
      setUsuario(data.usuario);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: data.token, usuario: data.usuario }),
      );
      return { success: true };
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor");
      return { success: false };
    }
  }, []);

  const register = useCallback(async (nombre, email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          formatearErrorApi(data, "No se pudo completar el registro"),
        );
      }

      return { success: true, usuario: data };
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor");
      return { success: false };
    }
  }, []);

  const fetchAuth = useCallback(
    async (url, options = {}) => {
      if (!token) {
        throw new Error("No está iniciada la sesión");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        logout();
      }

      return response;
    },
    [token, logout],
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        error,
        setError,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        fetchAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
