import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { API_URL, formatearErrorApi, useAuth } from "./Auth";
import { VehiculosSelect } from "./VehiculosSelect";
import { ConductoresSelect } from "./ConductoresSelect";

function aInputDateTime(valor) {
  if (!valor) return "";
  return String(valor).replace(" ", "T").slice(0, 16);
}

export function ViajeEditar() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [erroresForm, setErroresForm] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const navigate = useNavigate();
  const { fetchAuth } = useAuth();

  const cargarViaje = useCallback(async () => {
    const response = await fetchAuth(`${API_URL}/viajes/${id}`);
    if (!response.ok) {
      setErrorApi("No se encontró el viaje solicitado");
      return;
    }
    const data = await response.json();
    setForm({
      vehiculo_id: Number(data.vehiculo_id),
      conductor_id: Number(data.conductor_id),
      fecha_salida: aInputDateTime(data.fecha_salida),
      fecha_llegada: aInputDateTime(data.fecha_llegada),
      origen: data.origen,
      destino: data.destino,
      kilometros: data.kilometros,
      observaciones: data.observaciones || "",
    });
  }, [id, fetchAuth]);

  useEffect(() => {
    cargarViaje();
  }, [cargarViaje]);

  const validar = () => {
    const errores = {};
    const origen = form.origen.trim();
    const destino = form.destino.trim();
    const kmNum = Number(form.kilometros);

    if (!form.vehiculo_id || form.vehiculo_id <= 0) {
      errores.vehiculo_id = "Debe seleccionar un vehículo";
    }

    if (!form.conductor_id || form.conductor_id <= 0) {
      errores.conductor_id = "Debe seleccionar un conductor";
    }

    if (!form.fecha_salida) {
      errores.fecha_salida = "La fecha y hora de salida es obligatoria";
    }

    if (!form.fecha_llegada) {
      errores.fecha_llegada = "La fecha y hora de llegada es obligatoria";
    } else if (
      form.fecha_salida &&
      new Date(form.fecha_llegada) < new Date(form.fecha_salida)
    ) {
      errores.fecha_llegada =
        "La fecha de llegada no puede ser anterior a la fecha de salida";
    }

    if (!origen || origen.length < 2) {
      errores.origen = "El origen es obligatorio (mínimo 2 caracteres)";
    }

    if (!destino || destino.length < 2) {
      errores.destino = "El destino es obligatorio (mínimo 2 caracteres)";
    }

    if (form.kilometros === "" || Number.isNaN(kmNum) || kmNum <= 0) {
      errores.kilometros = "Los kilómetros deben ser un número mayor a 0";
    }

    if (form.observaciones.length > 500) {
      errores.observaciones =
        "Las observaciones no pueden superar los 500 caracteres";
    }

    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorApi(null);

    if (!validar()) return;

    const response = await fetchAuth(`${API_URL}/viajes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehiculo_id: Number(form.vehiculo_id),
        conductor_id: Number(form.conductor_id),
        fecha_salida: form.fecha_salida,
        fecha_llegada: form.fecha_llegada,
        origen: form.origen.trim(),
        destino: form.destino.trim(),
        kilometros: Number(form.kilometros),
        observaciones: form.observaciones.trim(),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setErrorApi(formatearErrorApi(data, "No se pudo actualizar el viaje"));
      return;
    }

    navigate(`/viajes/${id}`);
  };

  if (!form) {
    return errorApi ? (
      <p className="mensaje-error">{errorApi}</p>
    ) : (
      <p className="texto-vacio">Cargando datos del viaje...</p>
    );
  }

  return (
    <>
      <h2>Editar Viaje #{id}</h2>
      <div className="formulario-contenedor">
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <VehiculosSelect
              vehiculoId={form.vehiculo_id}
              onChange={(vehiculo_id) =>
                setForm((f) => ({ ...f, vehiculo_id }))
              }
            />
            {erroresForm.vehiculo_id && (
              <p className="error-campo">{erroresForm.vehiculo_id}</p>
            )}
          </div>

          <div>
            <ConductoresSelect
              conductorId={form.conductor_id}
              onChange={(conductor_id) =>
                setForm((f) => ({ ...f, conductor_id }))
              }
            />
            {erroresForm.conductor_id && (
              <p className="error-campo">{erroresForm.conductor_id}</p>
            )}
          </div>

          <div className="form-grid">
            <div className="campo">
              <label htmlFor="fecha_salida">Fecha y hora de salida:</label>
              <input
                id="fecha_salida"
                type="datetime-local"
                value={form.fecha_salida}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha_salida: e.target.value }))
                }
              />
              {erroresForm.fecha_salida && (
                <p className="error-campo">{erroresForm.fecha_salida}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="fecha_llegada">Fecha y hora de llegada:</label>
              <input
                id="fecha_llegada"
                type="datetime-local"
                value={form.fecha_llegada}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha_llegada: e.target.value }))
                }
              />
              {erroresForm.fecha_llegada && (
                <p className="error-campo">{erroresForm.fecha_llegada}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="origen">Origen:</label>
              <input
                id="origen"
                type="text"
                value={form.origen}
                onChange={(e) =>
                  setForm((f) => ({ ...f, origen: e.target.value }))
                }
              />
              {erroresForm.origen && (
                <p className="error-campo">{erroresForm.origen}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="destino">Destino:</label>
              <input
                id="destino"
                type="text"
                value={form.destino}
                onChange={(e) =>
                  setForm((f) => ({ ...f, destino: e.target.value }))
                }
              />
              {erroresForm.destino && (
                <p className="error-campo">{erroresForm.destino}</p>
              )}
            </div>
          </div>

          <div className="campo">
            <label htmlFor="kilometros">Kilómetros recorridos:</label>
            <input
              id="kilometros"
              type="number"
              step="0.01"
              min="0.01"
              value={form.kilometros}
              onChange={(e) =>
                setForm((f) => ({ ...f, kilometros: e.target.value }))
              }
            />
            {erroresForm.kilometros && (
              <p className="error-campo">{erroresForm.kilometros}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="observaciones">Observaciones:</label>
            <textarea
              id="observaciones"
              rows={3}
              value={form.observaciones}
              onChange={(e) =>
                setForm((f) => ({ ...f, observaciones: e.target.value }))
              }
            />
            {erroresForm.observaciones && (
              <p className="error-campo">{erroresForm.observaciones}</p>
            )}
          </div>

          {errorApi && <p className="mensaje-error">{errorApi}</p>}

          <div className="acciones">
            <button type="submit" className="btn-primario">
              Guardar cambios
            </button>
            <Link to="/viajes">
              <button type="button">Volver a viajes</button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

