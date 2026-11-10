import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL, formatearErrorApi, useAuth } from "./Auth";

export function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtros, setFiltros] = useState({
    marca: "",
    modelo: "",
    patente: "",
  });
  const [errorAccion, setErrorAccion] = useState(null);
  const { fetchAuth } = useAuth();

  const obtenerVehiculos = useCallback(async () => {
    const url = new URL(`${API_URL}/vehiculos`);
    if (filtros.marca.trim()) {
      url.searchParams.append("marca", filtros.marca.trim());
    }
    if (filtros.modelo.trim()) {
      url.searchParams.append("modelo", filtros.modelo.trim());
    }
    if (filtros.patente.trim()) {
      url.searchParams.append("patente", filtros.patente.trim());
    }

    const response = await fetchAuth(url);
    if (!response.ok) {
      setVehiculos([]);
      return;
    }

    const data = await response.json();
    setVehiculos(data);
  }, [filtros, fetchAuth]);

  useEffect(() => {
    obtenerVehiculos();
  }, [obtenerVehiculos]);

  const handleEliminar = async (vehiculo) => {
    setErrorAccion(null);
    const confirmar = window.confirm(
      `¿Confirma que desea eliminar el vehículo ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.patente})?`,
    );
    if (!confirmar) return;

    const response = await fetchAuth(`${API_URL}/vehiculos/${vehiculo.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      setErrorAccion(formatearErrorApi(data, "No se pudo eliminar el vehículo"));
      return;
    }

    obtenerVehiculos();
  };

  return (
    <>
      <h1>Vehículos</h1>

      <div className="filtros-box">
        <h3>Filtros de búsqueda</h3>
        <div className="filtros-grid">
          <div>
            <label htmlFor="filtroMarca">Marca:</label>
            <input
              id="filtroMarca"
              type="text"
              placeholder="Ej: Mercedes-Benz"
              value={filtros.marca}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, marca: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="filtroModelo">Modelo:</label>
            <input
              id="filtroModelo"
              type="text"
              placeholder="Ej: Actros"
              value={filtros.modelo}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, modelo: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="filtroPatente">Patente:</label>
            <input
              id="filtroPatente"
              type="text"
              placeholder="Ej: AF123BC"
              value={filtros.patente}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, patente: e.target.value }))
              }
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <button
              type="button"
              onClick={() =>
                setFiltros({ marca: "", modelo: "", patente: "" })
              }
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="barra-superior">
        <h2 style={{ margin: 0 }}>Listado de vehículos</h2>
        <Link to="/vehiculos/crear">
          <button type="button" className="btn-primario">
            + Nuevo vehículo
          </button>
        </Link>
      </div>

      {errorAccion && <p className="mensaje-error">{errorAccion}</p>}

      {vehiculos.length === 0 ? (
        <p className="texto-vacio">No se encontraron vehículos registrados.</p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Patente</th>
                <th>Año</th>
                <th>Capacidad (kg)</th>
                <th>Viajes</th>
                <th>Km Totales</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.marca}</td>
                  <td>{v.modelo}</td>
                  <td>
                    <b>{v.patente}</b>
                  </td>
                  <td>{v.anio}</td>
                  <td>{Number(v.capacidad_carga).toLocaleString("es-AR")}</td>
                  <td>{v.cantidad_viajes}</td>
                  <td>
                    <b>
                      {Number(v.total_kilometros).toLocaleString("es-AR")} km
                    </b>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <Link to={`/vehiculos/${v.id}`}>
                        <button type="button">Historial / Detalle</button>
                      </Link>
                      <Link to={`/vehiculos/${v.id}/editar`}>
                        <button type="button">Editar</button>
                      </Link>
                      <button
                        type="button"
                        className="btn-peligro"
                        onClick={() => handleEliminar(v)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

