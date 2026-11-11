import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL, formatearErrorApi, useAuth } from "./Auth";
import { ViajesFiltros } from "./ViajesFiltros";

export function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [filtros, setFiltros] = useState({
    vehiculo_id: 0,
    conductor_id: 0,
    origen: "",
    destino: "",
  });
  const [errorAccion, setErrorAccion] = useState(null);
  const { fetchAuth } = useAuth();

  const obtenerViajes = useCallback(async () => {
    const url = new URL(`${API_URL}/viajes`);

    if (filtros.vehiculo_id > 0) {
      url.searchParams.append("vehiculo_id", filtros.vehiculo_id);
    }
    if (filtros.conductor_id > 0) {
      url.searchParams.append("conductor_id", filtros.conductor_id);
    }
    if (filtros.origen.trim()) {
      url.searchParams.append("origen", filtros.origen.trim());
    }
    if (filtros.destino.trim()) {
      url.searchParams.append("destino", filtros.destino.trim());
    }

    const response = await fetchAuth(url);
    if (!response.ok) {
      setViajes([]);
      return;
    }

    const data = await response.json();
    setViajes(data);
  }, [filtros, fetchAuth]);

  useEffect(() => {
    obtenerViajes();
  }, [obtenerViajes]);

  const handleEliminar = async (viaje) => {
    setErrorAccion(null);
    const confirmar = window.confirm(
      `¿Confirma que desea eliminar el viaje #${viaje.id} (${viaje.origen} -> ${viaje.destino})?`,
    );
    if (!confirmar) return;

    const response = await fetchAuth(`${API_URL}/viajes/${viaje.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      setErrorAccion(formatearErrorApi(data, "No se pudo eliminar el viaje"));
      return;
    }

    obtenerViajes();
  };

  const totalKilometros = viajes.reduce(
    (acum, vi) => acum + Number(vi.kilometros || 0),
    0,
  );

  const hayFiltroEntidad =
    filtros.vehiculo_id > 0 || filtros.conductor_id > 0;

  return (
    <>
      <h1>Viajes</h1>

      <ViajesFiltros filtros={filtros} onChange={setFiltros} />

      <div className="resumen-km">
        <div>
          <span>Cantidad de viajes listados</span>
          <strong>{viajes.length}</strong>
        </div>
        <div>
          <span>
            {hayFiltroEntidad
              ? "Total de kilómetros recorridos (selección actual)"
              : "Total general de kilómetros recorridos"}
          </span>
          <strong>{totalKilometros.toLocaleString("es-AR")} km</strong>
        </div>
      </div>

      <div className="barra-superior">
        <h2 style={{ margin: 0 }}>Historial de viajes</h2>
        <Link to="/viajes/crear">
          <button type="button" className="btn-primario">
            + Registrar viaje
          </button>
        </Link>
      </div>

      {errorAccion && <p className="mensaje-error">{errorAccion}</p>}

      {viajes.length === 0 ? (
        <p className="texto-vacio">
          No se encontraron viajes para los criterios seleccionados.
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehículo</th>
                <th>Conductor</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Kilómetros</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {viajes.map((vi) => (
                <tr key={vi.id}>
                  <td>{vi.id}</td>
                  <td>
                    <Link to={`/vehiculos/${vi.vehiculo_id}`}>
                      {vi.vehiculo_marca} {vi.vehiculo_modelo} (
                      {vi.vehiculo_patente})
                    </Link>
                  </td>
                  <td>
                    <Link to={`/conductores/${vi.conductor_id}`}>
                      {vi.conductor_apellido}, {vi.conductor_nombre}
                    </Link>
                  </td>
                  <td>{vi.fecha_salida}</td>
                  <td>{vi.fecha_llegada}</td>
                  <td>{vi.origen}</td>
                  <td>{vi.destino}</td>
                  <td>
                    <b>{Number(vi.kilometros).toLocaleString("es-AR")} km</b>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <Link to={`/viajes/${vi.id}`}>
                        <button type="button">Detalle</button>
                      </Link>
                      <Link to={`/viajes/${vi.id}/editar`}>
                        <button type="button">Editar</button>
                      </Link>
                      <button
                        type="button"
                        className="btn-peligro"
                        onClick={() => handleEliminar(vi)}
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

