import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL, formatearErrorApi, useAuth } from "./Auth";

export function VehiculoCrear() {
  const anioActual = new Date().getFullYear();
  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    patente: "",
    anio: anioActual,
    capacidad_carga: "",
  });
  const [erroresForm, setErroresForm] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const navigate = useNavigate();
  const { fetchAuth } = useAuth();

  const validar = () => {
    const errores = {};
    const marca = form.marca.trim();
    const modelo = form.modelo.trim();
    const patente = form.patente.trim().toUpperCase();
    const anioNum = Number(form.anio);
    const capacidadNum = Number(form.capacidad_carga);

    if (!marca) {
      errores.marca = "La marca es obligatoria";
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .-]{1,50}$/.test(marca)) {
      errores.marca = "Marca inválida (máximo 50 caracteres)";
    }

    if (!modelo) {
      errores.modelo = "El modelo es obligatorio";
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .-/]{1,50}$/.test(modelo)) {
      errores.modelo = "Modelo inválido (máximo 50 caracteres)";
    }

    if (!patente) {
      errores.patente = "La patente es obligatoria";
    } else if (!/^[A-Z0-9 -]{6,10}$/.test(patente)) {
      errores.patente =
        "La patente debe tener entre 6 y 10 caracteres alfanuméricos";
    }

    if (
      !Number.isInteger(anioNum) ||
      anioNum < 1950 ||
      anioNum > anioActual + 1
    ) {
      errores.anio = `Ingrese un año válido entre 1950 y ${anioActual + 1}`;
    }

    if (
      form.capacidad_carga === "" ||
      Number.isNaN(capacidadNum) ||
      capacidadNum <= 0
    ) {
      errores.capacidad_carga =
        "La capacidad de carga debe ser un número mayor a 0";
    }

    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorApi(null);

    if (!validar()) return;

    const response = await fetchAuth(`${API_URL}/vehiculos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        patente: form.patente.trim().toUpperCase(),
        anio: Number(form.anio),
        capacidad_carga: Number(form.capacidad_carga),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setErrorApi(formatearErrorApi(data, "No se pudo registrar el vehículo"));
      return;
    }

    navigate("/vehiculos");
  };

  return (
    <>
      <h2>Nuevo Vehículo</h2>
      <div className="formulario-contenedor">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="campo">
              <label htmlFor="marca">Marca:</label>
              <input
                id="marca"
                type="text"
                placeholder="Ej: Scania"
                value={form.marca}
                onChange={(e) =>
                  setForm((f) => ({ ...f, marca: e.target.value }))
                }
              />
              {erroresForm.marca && (
                <p className="error-campo">{erroresForm.marca}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="modelo">Modelo:</label>
              <input
                id="modelo"
                type="text"
                placeholder="Ej: R450"
                value={form.modelo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, modelo: e.target.value }))
                }
              />
              {erroresForm.modelo && (
                <p className="error-campo">{erroresForm.modelo}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="patente">Patente:</label>
              <input
                id="patente"
                type="text"
                placeholder="Ej: AF123BC"
                value={form.patente}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    patente: e.target.value.toUpperCase(),
                  }))
                }
              />
              {erroresForm.patente && (
                <p className="error-campo">{erroresForm.patente}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="anio">Año:</label>
              <input
                id="anio"
                type="number"
                min={1950}
                max={anioActual + 1}
                value={form.anio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, anio: e.target.value }))
                }
              />
              {erroresForm.anio && (
                <p className="error-campo">{erroresForm.anio}</p>
              )}
            </div>
          </div>

          <div className="campo">
            <label htmlFor="capacidad_carga">Capacidad de carga (kg):</label>
            <input
              id="capacidad_carga"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ej: 25000"
              value={form.capacidad_carga}
              onChange={(e) =>
                setForm((f) => ({ ...f, capacidad_carga: e.target.value }))
              }
            />
            {erroresForm.capacidad_carga && (
              <p className="error-campo">{erroresForm.capacidad_carga}</p>
            )}
          </div>

          {errorApi && <p className="mensaje-error">{errorApi}</p>}

          <div className="acciones">
            <button type="submit" className="btn-primario">
              Guardar vehículo
            </button>
            <Link to="/vehiculos">
              <button type="button">Cancelar</button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

