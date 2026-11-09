import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosViajes,
  validarId,
  validarViaje,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Normaliza fechas ISO8601 a formato DATETIME de MySQL ("YYYY-MM-DD HH:MM:SS")
function formatearFechaHoraMySQL(valor) {
  const limpio = String(valor).trim().replace("T", " ").replace("Z", "");
  if (limpio.length === 10) {
    return `${limpio} 00:00:00`;
  }
  if (limpio.length === 16) {
    return `${limpio}:00`;
  }
  return limpio.slice(0, 19);
}

// GET /viajes - Listado de viajes con filtros por vehículo, conductor, origen o destino
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosViajes,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];
    const { vehiculo_id, conductor_id, origen, destino } = req.query;

    if (vehiculo_id) {
      filtros.push("vi.vehiculo_id = ?");
      parametros.push(Number(vehiculo_id));
    }
    if (conductor_id) {
      filtros.push("vi.conductor_id = ?");
      parametros.push(Number(conductor_id));
    }
    if (origen) {
      filtros.push("vi.origen LIKE ?");
      parametros.push(`%${origen}%`);
    }
    if (destino) {
      filtros.push("vi.destino LIKE ?");
      parametros.push(`%${destino}%`);
    }

    let sql =
      "SELECT vi.id, vi.vehiculo_id, vi.conductor_id, vi.fecha_salida, vi.fecha_llegada, " +
      "vi.origen, vi.destino, vi.kilometros, vi.observaciones, " +
      "v.marca AS vehiculo_marca, v.modelo AS vehiculo_modelo, v.patente AS vehiculo_patente, " +
      "c.nombre AS conductor_nombre, c.apellido AS conductor_apellido, " +
      "c.numero_documento AS conductor_documento " +
      "FROM viajes vi " +
      "JOIN vehiculos v ON vi.vehiculo_id = v.id " +
      "JOIN conductores c ON vi.conductor_id = c.id";

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY vi.fecha_salida DESC, vi.id DESC";

    const [viajes] = await db.execute(sql, parametros);
    res.json(viajes);
  },
);

// GET /viajes/:id - Detalle de un viaje
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const sql =
      "SELECT vi.id, vi.vehiculo_id, vi.conductor_id, vi.fecha_salida, vi.fecha_llegada, " +
      "vi.origen, vi.destino, vi.kilometros, vi.observaciones, " +
      "v.marca AS vehiculo_marca, v.modelo AS vehiculo_modelo, v.patente AS vehiculo_patente, " +
      "c.nombre AS conductor_nombre, c.apellido AS conductor_apellido, " +
      "c.numero_documento AS conductor_documento " +
      "FROM viajes vi " +
      "JOIN vehiculos v ON vi.vehiculo_id = v.id " +
      "JOIN conductores c ON vi.conductor_id = c.id " +
      "WHERE vi.id = ?";

    const [viajes] = await db.execute(sql, [id]);

    if (viajes.length === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    res.json(viajes[0]);
  },
);

// POST /viajes - Registro de nuevo viaje asociando un vehículo y un conductor
router.post(
  "/",
  validarAutenticacion,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const {
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones = "",
    } = req.body;

    // Verificar existencia del vehículo
    const [vehiculos] = await db.execute(
      "SELECT id FROM vehiculos WHERE id = ?",
      [Number(vehiculo_id)],
    );
    if (vehiculos.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "El vehículo seleccionado no existe" });
    }

    // Verificar existencia del conductor
    const [conductores] = await db.execute(
      "SELECT id FROM conductores WHERE id = ?",
      [Number(conductor_id)],
    );
    if (conductores.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "El conductor seleccionado no existe" });
    }

    const salidaSQL = formatearFechaHoraMySQL(fecha_salida);
    const llegadaSQL = formatearFechaHoraMySQL(fecha_llegada);

    const [result] = await db.execute(
      "INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        Number(vehiculo_id),
        Number(conductor_id),
        salidaSQL,
        llegadaSQL,
        origen,
        destino,
        Number(kilometros),
        observaciones ?? "",
      ],
    );

    res.status(201).json({
      id: result.insertId,
      vehiculo_id: Number(vehiculo_id),
      conductor_id: Number(conductor_id),
      fecha_salida: salidaSQL,
      fecha_llegada: llegadaSQL,
      origen,
      destino,
      kilometros: Number(kilometros),
      observaciones: observaciones ?? "",
    });
  },
);

// PUT /viajes/:id - Modificación de viaje
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const {
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones = "",
    } = req.body;

    const [viajes] = await db.execute("SELECT id FROM viajes WHERE id = ?", [
      id,
    ]);
    if (viajes.length === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    const [vehiculos] = await db.execute(
      "SELECT id FROM vehiculos WHERE id = ?",
      [Number(vehiculo_id)],
    );
    if (vehiculos.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "El vehículo seleccionado no existe" });
    }

    const [conductores] = await db.execute(
      "SELECT id FROM conductores WHERE id = ?",
      [Number(conductor_id)],
    );
    if (conductores.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "El conductor seleccionado no existe" });
    }

    const salidaSQL = formatearFechaHoraMySQL(fecha_salida);
    const llegadaSQL = formatearFechaHoraMySQL(fecha_llegada);

    await db.execute(
      "UPDATE viajes SET vehiculo_id = ?, conductor_id = ?, fecha_salida = ?, fecha_llegada = ?, origen = ?, destino = ?, kilometros = ?, observaciones = ? WHERE id = ?",
      [
        Number(vehiculo_id),
        Number(conductor_id),
        salidaSQL,
        llegadaSQL,
        origen,
        destino,
        Number(kilometros),
        observaciones ?? "",
        id,
      ],
    );

    res.json({
      id,
      vehiculo_id: Number(vehiculo_id),
      conductor_id: Number(conductor_id),
      fecha_salida: salidaSQL,
      fecha_llegada: llegadaSQL,
      origen,
      destino,
      kilometros: Number(kilometros),
      observaciones: observaciones ?? "",
    });
  },
);

// DELETE /viajes/:id - Eliminación de viaje
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [viajes] = await db.execute("SELECT * FROM viajes WHERE id = ?", [
      id,
    ]);

    if (viajes.length === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    await db.execute("DELETE FROM viajes WHERE id = ?", [id]);
    res.json(viajes[0]);
  },
);

export default router;

