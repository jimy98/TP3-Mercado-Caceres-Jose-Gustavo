import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL, formatearErrorApi, useAuth } from "./Auth";

export function Conductores() {
  const [conductores, setConductores] = useState([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    apellido: "",
    numero_documento: "",
  });
  const [errorAccion, setErrorAccion] = useState(null);
  const { fetchAuth } = useAuth();

  const obtenerConductores = useCallback(async () => {
    const url = new URL(`${API_URL}/conductores`);
    if (filtros.nombre.trim()) {
      url.searchParams.append("nombre", filtros.nombre.trim());
    }
    if (filtros.apellido.trim()) {
      url.searchParams.append("apellido", filtros.apellido.trim());
    }
    if (filtros.numero_documento.trim()) {
      url.searchParams.append(
        "numero_documento",
        filtros.numero_documento.trim(),
      );
    }

    const response = await fetchAuth(url);
    if (!response.ok) {
      setConductores([]);
      return;
    }

    const data = await response.json();
    setConductores(data);
  }, [filtros, fetchAuth]);

  useEffect(() => {
    obtenerConductores();
  }, [obtenerConductores]);

  const handleEliminar = async (conductor) => {
    setErrorAccion(null);
    const confirmar = window.confirm(
      `¿Confirma que desea eliminar al conductor ${conductor.apellido}, ${conductor.nombre} (DNI ${conductor.numero_documento})?`,
    );
    if (!confirmar) return;

    const response = await fetchAuth(
      `${API_URL}/conductores/${conductor.id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const data = await response.json();
      setErrorAccion(
        formatearErrorApi(data, "No se pudo eliminar el conductor"),
      );
      return;
    }

    obtenerConductores();
  };

  return (
    <>
      <h1>Conductores</h1>

      <div className="filtros-box">
        <h3>Filtros de búsqueda</h3>
        <div className="filtros-grid">
          <div>
            <label htmlFor="filtroNombre">Nombre:</label>
            <input
              id="filtroNombre"
              type="text"
              placeholder="Ej: Carlos"
              value={filtros.nombre}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, nombre: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="filtroApellido">Apellido:</label>
            <input
              id="filtroApellido"
              type="text"
              placeholder="Ej: Gómez"
              value={filtros.apellido}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, apellido: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="filtroDocumento">N.º Documento:</label>
            <input
              id="filtroDocumento"
              type="text"
              placeholder="Solo números"
              value={filtros.numero_documento}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  numero_documento: e.target.value.replace(/\D/g, ""),
                }))
              }
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <button
              type="button"
              onClick={() =>
                setFiltros({ nombre: "", apellido: "", numero_documento: "" })
              }
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="barra-superior">
        <h2 style={{ margin: 0 }}>Listado de conductores</h2>
        <Link to="/conductores/crear">
          <button type="button" className="btn-primario">
            + Nuevo conductor
          </button>
        </Link>
      </div>

      {errorAccion && <p className="mensaje-error">{errorAccion}</p>}

      {conductores.length === 0 ? (
        <p className="texto-vacio">
          No se encontraron conductores registrados.
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Apellido y Nombre</th>
                <th>Documento</th>
                <th>N.º Licencia</th>
                <th>Alta Licencia</th>
                <th>Vencimiento</th>
                <th>Viajes</th>
                <th>Km Totales</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {conductores.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    {c.apellido}, {c.nombre}
                  </td>
                  <td>{c.numero_documento}</td>
                  <td>
                    <b>{c.numero_licencia}</b>
                  </td>
                  <td>{c.fecha_alta_licencia}</td>
                  <td>{c.fecha_vencimiento_licencia}</td>
                  <td>{c.cantidad_viajes}</td>
                  <td>
                    <b>
                      {Number(c.total_kilometros).toLocaleString("es-AR")} km
                    </b>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <Link to={`/conductores/${c.id}`}>
                        <button type="button">Historial / Detalle</button>
                      </Link>
                      <Link to={`/conductores/${c.id}/editar`}>
                        <button type="button">Editar</button>
                      </Link>
                      <button
                        type="button"
                        className="btn-peligro"
                        onClick={() => handleEliminar(c)}
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

