import { useCallback, useEffect, useState } from "react";
import { API_URL, useAuth } from "./Auth";

export function VehiculosSelect({
  vehiculoId,
  onChange,
  id = "vehiculo_id",
  label = "Vehículo:",
  textoVacio = "Seleccione un vehículo",
}) {
  const [vehiculos, setVehiculos] = useState([]);
  const { fetchAuth } = useAuth();

  const obtenerVehiculos = useCallback(async () => {
    const response = await fetchAuth(`${API_URL}/vehiculos`);
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    setVehiculos(data);
  }, [fetchAuth]);

  useEffect(() => {
    obtenerVehiculos();
  }, [obtenerVehiculos]);

  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={vehiculoId}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value={0}>{textoVacio}</option>
        {vehiculos.map((v) => (
          <option key={v.id} value={v.id}>
            {v.marca} {v.modelo} - Patente: {v.patente}
          </option>
        ))}
      </select>
    </div>
  );
}

