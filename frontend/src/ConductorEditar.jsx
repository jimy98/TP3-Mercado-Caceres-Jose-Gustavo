import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { API_URL, formatearErrorApi, useAuth } from "./Auth";

export function ConductorEditar() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [erroresForm, setErroresForm] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const navigate = useNavigate();
  const { fetchAuth } = useAuth();

  const cargarConductor = useCallback(async () => {
    const response = await fetchAuth(`${API_URL}/conductores/${id}`);
    if (!response.ok) {
      setErrorApi("No se encontró el conductor solicitado");
      return;
    }
    const data = await response.json();
    setForm({
      nombre: data.nombre,
      apellido: data.apellido,
      numero_documento: data.numero_documento,
      numero_licencia: data.numero_licencia,
      fecha_alta_licencia: String(data.fecha_alta_licencia).slice(0, 10),
      fecha_vencimiento_licencia: String(
        data.fecha_vencimiento_licencia,
      ).slice(0, 10),
    });
  }, [id, fetchAuth]);

  useEffect(() => {
    cargarConductor();
  }, [cargarConductor]);

  const validar = () => {
    const errores = {};
    const nombre = form.nombre.trim();
    const apellido = form.apellido.trim();
    const documento = form.numero_documento.trim();
    const licencia = form.numero_licencia.trim().toUpperCase();

    if (!nombre) {
      errores.nombre = "El nombre es obligatorio";
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{1,50}$/.test(nombre)) {
      errores.nombre = "El nombre solo puede contener letras y espacios";
    }

    if (!apellido) {
      errores.apellido = "El apellido es obligatorio";
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{1,50}$/.test(apellido)) {
      errores.apellido = "El apellido solo puede contener letras y espacios";
    }

    if (!documento) {
      errores.numero_documento = "El número de documento es obligatorio";
    } else if (!/^\d{7,15}$/.test(documento)) {
      errores.numero_documento =
        "El número de documento debe contener entre 7 y 15 dígitos numéricos";
    }

    if (!licencia) {
      errores.numero_licencia = "El número de licencia es obligatorio";
    } else if (!/^[A-Z0-9 -]{4,30}$/.test(licencia)) {
      errores.numero_licencia =
        "La licencia debe tener entre 4 y 30 caracteres alfanuméricos o guiones";
    }

    if (!form.fecha_alta_licencia) {
      errores.fecha_alta_licencia =
        "La fecha de alta de licencia es obligatoria";
    }

    if (!form.fecha_vencimiento_licencia) {
      errores.fecha_vencimiento_licencia =
        "La fecha de vencimiento de licencia es obligatoria";
    } else if (
      form.fecha_alta_licencia &&
      new Date(form.fecha_vencimiento_licencia) <=
        new Date(form.fecha_alta_licencia)
    ) {
      errores.fecha_vencimiento_licencia =
        "La fecha de vencimiento debe ser posterior a la fecha de alta";
    }

    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorApi(null);

    if (!validar()) return;

    const response = await fetchAuth(`${API_URL}/conductores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        numero_documento: form.numero_documento.trim(),
        numero_licencia: form.numero_licencia.trim().toUpperCase(),
        fecha_alta_licencia: form.fecha_alta_licencia,
        fecha_vencimiento_licencia: form.fecha_vencimiento_licencia,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setErrorApi(
        formatearErrorApi(data, "No se pudo actualizar el conductor"),
      );
      return;
    }

    navigate(`/conductores/${id}`);
  };

  if (!form) {
    return errorApi ? (
      <p className="mensaje-error">{errorApi}</p>
    ) : (
      <p className="texto-vacio">Cargando datos del conductor...</p>
    );
  }

  return (
    <>
      <h2>Editar Conductor #{id}</h2>
      <div className="formulario-contenedor">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="campo">
              <label htmlFor="nombre">Nombre:</label>
              <input
                id="nombre"
                type="text"
                value={form.nombre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nombre: e.target.value }))
                }
              />
              {erroresForm.nombre && (
                <p className="error-campo">{erroresForm.nombre}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="apellido">Apellido:</label>
              <input
                id="apellido"
                type="text"
                value={form.apellido}
                onChange={(e) =>
                  setForm((f) => ({ ...f, apellido: e.target.value }))
                }
              />
              {erroresForm.apellido && (
                <p className="error-campo">{erroresForm.apellido}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="numero_documento">Número de documento:</label>
              <input
                id="numero_documento"
                type="text"
                value={form.numero_documento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, numero_documento: e.target.value }))
                }
              />
              {erroresForm.numero_documento && (
                <p className="error-campo">{erroresForm.numero_documento}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="numero_licencia">Número de licencia:</label>
              <input
                id="numero_licencia"
                type="text"
                value={form.numero_licencia}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    numero_licencia: e.target.value.toUpperCase(),
                  }))
                }
              />
              {erroresForm.numero_licencia && (
                <p className="error-campo">{erroresForm.numero_licencia}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="fecha_alta_licencia">
                Fecha de alta de licencia:
              </label>
              <input
                id="fecha_alta_licencia"
                type="date"
                value={form.fecha_alta_licencia}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    fecha_alta_licencia: e.target.value,
                  }))
                }
              />
              {erroresForm.fecha_alta_licencia && (
                <p className="error-campo">
                  {erroresForm.fecha_alta_licencia}
                </p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="fecha_vencimiento_licencia">
                Fecha de vencimiento de licencia:
              </label>
              <input
                id="fecha_vencimiento_licencia"
                type="date"
                value={form.fecha_vencimiento_licencia}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    fecha_vencimiento_licencia: e.target.value,
                  }))
                }
              />
              {erroresForm.fecha_vencimiento_licencia && (
                <p className="error-campo">
                  {erroresForm.fecha_vencimiento_licencia}
                </p>
              )}
            </div>
          </div>

          {errorApi && <p className="mensaje-error">{errorApi}</p>}

          <div className="acciones">
            <button type="submit" className="btn-primario">
              Guardar cambios
            </button>
            <Link to="/conductores">
              <button type="button">Volver al listado</button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

