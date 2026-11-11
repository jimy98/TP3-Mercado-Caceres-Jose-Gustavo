import { VehiculosSelect } from "./VehiculosSelect";
import { ConductoresSelect } from "./ConductoresSelect";

export function ViajesFiltros({ filtros, onChange }) {
  return (
    <div className="filtros-box">
      <h3>Consultar historial de viajes por vehículo o conductor</h3>
      <div className="filtros-grid">
        <VehiculosSelect
          id="filtroVehiculo"
          label="Filtrar por vehículo:"
          textoVacio="Todos los vehículos"
          vehiculoId={filtros.vehiculo_id}
          onChange={(vehiculo_id) =>
            onChange((f) => ({ ...f, vehiculo_id }))
          }
        />

        <ConductoresSelect
          id="filtroConductor"
          label="Filtrar por conductor:"
          textoVacio="Todos los conductores"
          conductorId={filtros.conductor_id}
          onChange={(conductor_id) =>
            onChange((f) => ({ ...f, conductor_id }))
          }
        />

        <div className="campo">
          <label htmlFor="filtroOrigen">Origen:</label>
          <input
            id="filtroOrigen"
            type="text"
            placeholder="Ej: La Rioja"
            value={filtros.origen}
            onChange={(e) =>
              onChange((f) => ({ ...f, origen: e.target.value }))
            }
          />
        </div>

        <div className="campo">
          <label htmlFor="filtroDestino">Destino:</label>
          <input
            id="filtroDestino"
            type="text"
            placeholder="Ej: Córdoba"
            value={filtros.destino}
            onChange={(e) =>
              onChange((f) => ({ ...f, destino: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="acciones">
        <button
          type="button"
          onClick={() =>
            onChange({
              vehiculo_id: 0,
              conductor_id: 0,
              origen: "",
              destino: "",
            })
          }
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

