import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_URL, useAuth } from "./Auth";

export function VehiculoDetalles() {
  const { id } = useParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const { fetchAuth } = useAuth();

  const obtenerHistorial = useCallback(async () => {
    const response = await fetchAuth(`${API_URL}/vehiculos/${id}/viajes`);
    if (!response.ok) {
      setError("No se pudo obtener la información del vehículo");
      return;
    }
    const data = await response.json();
    setDatos(data);
  }, [id, fetchAuth]);

  useEffect(() => {
    obtenerHistorial();
  }, [obtenerHistorial]);

  if (error) {
    return <p className="mensaje-error">{error}</p>;
  }

  if (!datos) {
    return <p className="texto-vacio">Cargando detalle del vehículo...</p>;
  }

  const { vehiculo, total_kilometros, cantidad_viajes, viajes } = datos;

  return (
    <>
      <h2>
        Vehículo: {vehiculo.marca} {vehiculo.modelo} ({vehiculo.patente})
      </h2>

      <div className="detalle-box">
        <p>
          ID: <b>{vehiculo.id}</b>
        </p>
        <p>
          Marca: <b>{vehiculo.marca}</b>
        </p>
        <p>
          Modelo: <b>{vehiculo.modelo}</b>
        </p>
        <p>
          Patente: <b>{vehiculo.patente}</b>
        </p>
        <p>
          Año: <b>{vehiculo.anio}</b>
        </p>
        <p>
          Capacidad de carga:{" "}
          <b>{Number(vehiculo.capacidad_carga).toLocaleString("es-AR")} kg</b>
        </p>

        <div className="acciones">
          <Link to={`/viajes/crear?vehiculo_id=${vehiculo.id}`}>
            <button type="button" className="btn-primario">
              + Registrar viaje con este vehículo
            </button>
          </Link>
          <Link to={`/vehiculos/${vehiculo.id}/editar`}>
            <button type="button">Editar vehículo</button>
          </Link>
          <Link to="/vehiculos">
            <button type="button">Volver a vehículos</button>
          </Link>
        </div>
      </div>

      <div className="resumen-km">
        <div>
          <span>Cantidad de viajes realizados</span>
          <strong>{cantidad_viajes}</strong>
        </div>
        <div>
          <span>Total de kilómetros recorridos por el vehículo</span>
          <strong>
            {Number(total_kilometros).toLocaleString("es-AR")} km
          </strong>
        </div>
      </div>

      <h3>Historial de viajes del vehículo</h3>
      {viajes.length === 0 ? (
        <p className="texto-vacio">
          Este vehículo todavía no registra viajes realizados.
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID Viaje</th>
                <th>Conductor</th>
                <th>Fecha Salida</th>
                <th>Fecha Llegada</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Kilómetros</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {viajes.map((vi) => (
                <tr key={vi.id}>
                  <td>
                    <Link to={`/viajes/${vi.id}`}>{vi.id}</Link>
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
                  <td>{vi.observaciones || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

