import { Link } from "react-router";
import { useAuth } from "./Auth";

export function Home() {
  const { isAuthenticated, usuario } = useAuth();

  return (
    <>
      <h1>Sistema de Gestión de Transporte</h1>
      <p style={{ textAlign: "center" }}>
        Plataforma integral para la administración de flota de vehículos,
        conductores habilitados y control de viajes realizados.
      </p>

      <div className="tarjetas-grid">
        <div className="tarjeta">
          <h3>Flota de Vehículos</h3>
          <p>
            Registro y mantenimiento de unidades con marca, modelo, patente, año
            y capacidad de carga en kilogramos.
          </p>
          {isAuthenticated && (
            <div className="acciones">
              <Link to="/vehiculos">
                <button type="button" className="btn-primario">
                  Ver vehículos
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="tarjeta">
          <h3>Plantel de Conductores</h3>
          <p>
            Administración de choferes, documentos, números de licencia y
            control de fechas de alta y vencimiento.
          </p>
          {isAuthenticated && (
            <div className="acciones">
              <Link to="/conductores">
                <button type="button" className="btn-primario">
                  Ver conductores
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="tarjeta">
          <h3>Registro e Historial de Viajes</h3>
          <p>
            Asignación de viajes por vehículo y conductor, consulta de historial
            y cálculo automático del total de kilómetros recorridos.
          </p>
          {isAuthenticated && (
            <div className="acciones">
              <Link to="/viajes">
                <button type="button" className="btn-primario">
                  Ver viajes
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated ? (
        <div className="resumen-km">
          <div>
            <span>Sesión activa como</span>
            <strong>{usuario?.nombre}</strong>
            <span>{usuario?.email}</span>
          </div>
        </div>
      ) : (
        <div className="detalle-box" style={{ textAlign: "center" }}>
          <h3>Acceso al sistema</h3>
          <p>
            Inicie sesión con su cuenta o regístrese para gestionar vehículos,
            conductores y viajes.
          </p>
          <div className="acciones" style={{ justifyContent: "center" }}>
            <Link to="/login">
              <button type="button" className="btn-primario">
                Iniciar sesión
              </button>
            </Link>
            <Link to="/registro">
              <button type="button">Crear cuenta</button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

