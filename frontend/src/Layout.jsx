import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "./Auth";

export function Layout() {
  const { isAuthenticated, usuario, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <main>
      <nav>
        <ul>
          <li className={pathname === "/" ? "active" : ""}>
            <Link to="/">Inicio</Link>
          </li>

          {isAuthenticated ? (
            <>
              <li
                className={pathname.startsWith("/vehiculos") ? "active" : ""}
              >
                <Link to="/vehiculos">Vehículos</Link>
              </li>
              <li
                className={pathname.startsWith("/conductores") ? "active" : ""}
              >
                <Link to="/conductores">Conductores</Link>
              </li>
              <li className={pathname.startsWith("/viajes") ? "active" : ""}>
                <Link to="/viajes">Viajes</Link>
              </li>

              <div className="nav-derecha">
                {usuario && (
                  <span className="usuario-activo">
                    Usuario: <b>{usuario.nombre}</b>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Salir
                </button>
              </div>
            </>
          ) : (
            <div className="nav-derecha">
              <li className={pathname.startsWith("/login") ? "active" : ""}>
                <Link to="/login">Ingresar</Link>
              </li>
              <li className={pathname.startsWith("/registro") ? "active" : ""}>
                <Link to="/registro">Registrarse</Link>
              </li>
            </div>
          )}
        </ul>
      </nav>
      <Outlet />
    </main>
  );
}

