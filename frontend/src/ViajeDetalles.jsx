import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_URL, useAuth } from "./Auth";

export function ViajeDetalles() {
  const { id } = useParams();
  const [viaje, setViaje] = useState(null);
  const [error, setError] = useState(null);
  const { fetchAuth } = useAuth();

  const obtenerViaje = useCallback(async () => {
    const response = await fetchAuth(`${API_URL}/viajes/${id}`);
    if (!response.ok) {
      setError("No se encontró el viaje solicitado");
      return;
    }
    const data = await response.json();
    setViaje(data);
  }, [id, fetchAuth]);

  useEffect(() => {
    obtenerViaje();
  }, [obtenerViaje]);

  if (error) {
    return <p className="mensaje-error">{error}</p>;
  }

  if (!viaje) {
    return <p className="texto-vacio">Cargando detalle del viaje...</p>;
  }

  return (
    <>
      <h2>Detalle del Viaje #{viaje.id}</h2>

      <div className="detalle-box">
        <p>
          Vehículo:{" "}
          <Link to={`/vehiculos/${viaje.vehiculo_id}`}>
            <b>
              {viaje.vehiculo_marca} {viaje.vehiculo_modelo} (Patente:{" "}
              {viaje.vehiculo_patente})
            </b>
          </Link>
        </p>
        <p>
          Conductor:{" "}
          <Link to={`/conductores/${viaje.conductor_id}`}>
            <b>
              {viaje.conductor_apellido}, {viaje.conductor_nombre} (DNI:{" "}
              {viaje.conductor_documento})
            </b>
          </Link>
        </p>
        <p>
          Fecha y hora de salida: <b>{viaje.fecha_salida}</b>
        </p>
        <p>
          Fecha y hora de llegada: <b>{viaje.fecha_llegada}</b>
        </p>
        <p>
          Origen: <b>{viaje.origen}</b>
        </p>
        <p>
          Destino: <b>{viaje.destino}</b>
        </p>
        <p>
          Kilómetros recorridos:{" "}
          <b>{Number(viaje.kilometros).toLocaleString("es-AR")} km</b>
        </p>
        <p>
          Observaciones: <b>{viaje.observaciones || "Sin observaciones"}</b>
        </p>

        <div className="acciones">
          <Link to={`/viajes/${viaje.id}/editar`}>
            <button type="button" className="btn-primario">
              Editar viaje
            </button>
          </Link>
          <Link to="/viajes">
            <button type="button">Volver al listado</button>
          </Link>
        </div>
      </div>
    </>
  );
}

