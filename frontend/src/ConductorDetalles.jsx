import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_URL, useAuth } from "./Auth";

export function ConductorDetalles() {
  const { id } = useParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const { fetchAuth } = useAuth();

  const obtenerHistorial = useCallback(async () => {
    const response = await fetchAuth(`${API_URL}/conductores/${id}/viajes`);
    if (!response.ok) {
      setError("No se pudo obtener la información del conductor");
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
    return <p className="texto-vacio">Cargando detalle del conductor...</p>;
  }

  const { conductor, total_kilometros, cantidad_viajes, viajes } = datos;

  return (
    <>
      <h2>
        Conductor: {conductor.apellido}, {conductor.nombre}
      </h2>

      <div className="detalle-box">
        <p>
          ID: <b>{conductor.id}</b>
        </p>
        <p>
          Nombre y Apellido:{" "}
          <b>
            {conductor.nombre} {conductor.apellido}
          </b>
        </p>
        <p>
          Número de documento: <b>{conductor.numero_documento}</b>
        </p>
        <p>
          Número de licencia: <b>{conductor.numero_licencia}</b>
        </p>
        <p>
          Fecha de alta de licencia: <b>{conductor.fecha_alta_licencia}</b>
        </p>
        <p>
          Fecha de vencimiento de licencia:{" "}
          <b>{conductor.fecha_vencimiento_licencia}</b>
        </p>

        <div className="acciones">
          <Link to={`/viajes/crear?conductor_id=${conductor.id}`}>
            <button type="button" className="btn-primario">
              + Registrar viaje con este conductor
            </button>
          </Link>
          <Link to={`/conductores/${conductor.id}/editar`}>
            <button type="button">Editar conductor</button>
          </Link>
          <Link to="/conductores">
            <button type="button">Volver a conductores</button>
          </Link>
        </div>
      </div>

      <div className="resumen-km">
        <div>
          <span>Cantidad de viajes realizados</span>
          <strong>{cantidad_viajes}</strong>
        </div>
        <div>
          <span>Total de kilómetros recorridos por el conductor</span>
          <strong>
            {Number(total_kilometros).toLocaleString("es-AR")} km
          </strong>
        </div>
      </div>

      <h3>Historial de viajes del conductor</h3>
      {viajes.length === 0 ? (
        <p className="texto-vacio">
          Este conductor todavía no registra viajes realizados.
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID Viaje</th>
                <th>Vehículo</th>
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
                    <Link to={`/vehiculos/${vi.vehiculo_id}`}>
                      {vi.vehiculo_marca} {vi.vehiculo_modelo} (
                      {vi.vehiculo_patente})
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

