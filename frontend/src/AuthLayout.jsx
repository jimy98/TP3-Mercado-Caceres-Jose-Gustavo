import { Link, Outlet } from "react-router";
import { useAuth } from "./Auth";

export function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="formulario-contenedor" style={{ textAlign: "center" }}>
        <h2>Acceso restringido</h2>
        <p>Debe iniciar sesión para acceder a las operaciones de gestión.</p>
        <div className="acciones" style={{ justifyContent: "center" }}>
          <Link to="/login">
            <button type="button" className="btn-primario">
              Ir a Iniciar Sesión
            </button>
          </Link>
          <Link to="/registro">
            <button type="button">Registrarse</button>
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

