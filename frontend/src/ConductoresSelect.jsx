import { useCallback, useEffect, useState } from "react";
import { API_URL, useAuth } from "./Auth";

export function ConductoresSelect({
  conductorId,
  onChange,
  id = "conductor_id",
  label = "Conductor:",
  textoVacio = "Seleccione un conductor",
}) {
  const [conductores, setConductores] = useState([]);
  const { fetchAuth } = useAuth();

  const obtenerConductores = useCallback(async () => {
    const response = await fetchAuth(`${API_URL}/conductores`);
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    setConductores(data);
  }, [fetchAuth]);

  useEffect(() => {
    obtenerConductores();
  }, [obtenerConductores]);

  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={conductorId}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value={0}>{textoVacio}</option>
        {conductores.map((c) => (
          <option key={c.id} value={c.id}>
            {c.apellido}, {c.nombre} - DNI: {c.numero_documento}
          </option>
        ))}
      </select>
    </div>
  );
}

