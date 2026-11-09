import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosVehiculos,
  validarId,
  validarVehiculo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /vehiculos - Listado de vehículos con filtros y total de kilómetros
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosVehiculos,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];
    const { marca, modelo, patente } = req.query;

    if (marca) {
      filtros.push("v.marca LIKE ?");
      parametros.push(`%${marca}%`);
    }
    if (modelo) {
      filtros.push("v.modelo LIKE ?");
      parametros.push(`%${modelo}%`);
    }
    if (patente) {
      filtros.push("v.patente LIKE ?");
      parametros.push(`%${patente.toUpperCase()}%`);
    }

    let sql =
      "SELECT v.id, v.marca, v.modelo, v.patente, v.anio, v.capacidad_carga, " +
      "COALESCE(SUM(vi.kilometros), 0) AS total_kilometros, " +
      "COUNT(vi.id) AS cantidad_viajes " +
      "FROM vehiculos v " +
      "LEFT JOIN viajes vi ON vi.vehiculo_id = v.id";

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " GROUP BY v.id ORDER BY v.id DESC";

    const [vehiculos] = await db.execute(sql, parametros);
    res.json(vehiculos);
  },
);

// GET /vehiculos/:id - Detalle de un vehículo
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const sql =
      "SELECT v.id, v.marca, v.modelo, v.patente, v.anio, v.capacidad_carga, " +
      "COALESCE(SUM(vi.kilometros), 0) AS total_kilometros, " +
      "COUNT(vi.id) AS cantidad_viajes " +
      "FROM vehiculos v " +
      "LEFT JOIN viajes vi ON vi.vehiculo_id = v.id " +
      "WHERE v.id = ? " +
      "GROUP BY v.id";

    const [vehiculos] = await db.execute(sql, [id]);

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    res.json(vehiculos[0]);
  },
);

// GET /vehiculos/:id/viajes - Historial de viajes y total de km de un vehículo
router.get(
  "/:id/viajes",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [vehiculos] = await db.execute(
      "SELECT * FROM vehiculos WHERE id = ?",
      [id],
    );

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    const sqlViajes =
      "SELECT vi.id, vi.vehiculo_id, vi.conductor_id, vi.fecha_salida, vi.fecha_llegada, " +
      "vi.origen, vi.destino, vi.kilometros, vi.observaciones, " +
      "c.nombre AS conductor_nombre, c.apellido AS conductor_apellido, " +
      "c.numero_documento AS conductor_documento " +
      "FROM viajes vi " +
      "JOIN conductores c ON vi.conductor_id = c.id " +
      "WHERE vi.vehiculo_id = ? " +
      "ORDER BY vi.fecha_salida DESC, vi.id DESC";

    const [viajes] = await db.execute(sqlViajes, [id]);

    const [totales] = await db.execute(
      "SELECT COALESCE(SUM(kilometros), 0) AS total_kilometros, COUNT(id) AS cantidad_viajes " +
        "FROM viajes WHERE vehiculo_id = ?",
      [id],
    );

    res.json({
      vehiculo: vehiculos[0],
      total_kilometros: totales[0].total_kilometros,
      cantidad_viajes: totales[0].cantidad_viajes,
      viajes,
    });
  },
);

// POST /vehiculos - Alta de vehículo
router.post(
  "/",
  validarAutenticacion,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const { marca, modelo, patente, anio, capacidad_carga } = req.body;

    const [existentes] = await db.execute(
      "SELECT id FROM vehiculos WHERE patente = ?",
      [patente],
    );

    if (existentes.length > 0) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe un vehículo registrado con esa patente" });
    }

    const [result] = await db.execute(
      "INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)",
      [marca, modelo, patente, Number(anio), Number(capacidad_carga)],
    );

    res.status(201).json({
      id: result.insertId,
      marca,
      modelo,
      patente,
      anio: Number(anio),
      capacidad_carga: Number(capacidad_carga),
    });
  },
);

// PUT /vehiculos/:id - Modificación de vehículo
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { marca, modelo, patente, anio, capacidad_carga } = req.body;

    const [vehiculos] = await db.execute(
      "SELECT id FROM vehiculos WHERE id = ?",
      [id],
    );

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    const [duplicados] = await db.execute(
      "SELECT id FROM vehiculos WHERE patente = ? AND id <> ?",
      [patente, id],
    );

    if (duplicados.length > 0) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe otro vehículo con esa patente" });
    }

    await db.execute(
      "UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ? WHERE id = ?",
      [marca, modelo, patente, Number(anio), Number(capacidad_carga), id],
    );

    res.json({
      id,
      marca,
      modelo,
      patente,
      anio: Number(anio),
      capacidad_carga: Number(capacidad_carga),
    });
  },
);

// DELETE /vehiculos/:id - Eliminación de vehículo
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [vehiculos] = await db.execute(
      "SELECT * FROM vehiculos WHERE id = ?",
      [id],
    );

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    const [viajesAsociados] = await db.execute(
      "SELECT id FROM viajes WHERE vehiculo_id = ? LIMIT 1",
      [id],
    );

    if (viajesAsociados.length > 0) {
      return res.status(400).json({
        mensaje:
          "No se puede eliminar el vehículo porque tiene viajes asociados",
      });
    }

    await db.execute("DELETE FROM vehiculos WHERE id = ?", [id]);
    res.json(vehiculos[0]);
  },
);

export default router;

