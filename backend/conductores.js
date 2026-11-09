import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarConductor,
  validarFiltrosConductores,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /conductores - Listado de conductores con filtros y total de kilómetros
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosConductores,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];
    const { nombre, apellido, numero_documento } = req.query;

    if (nombre) {
      filtros.push("c.nombre LIKE ?");
      parametros.push(`%${nombre}%`);
    }
    if (apellido) {
      filtros.push("c.apellido LIKE ?");
      parametros.push(`%${apellido}%`);
    }
    if (numero_documento) {
      filtros.push("c.numero_documento LIKE ?");
      parametros.push(`%${numero_documento}%`);
    }

    let sql =
      "SELECT c.id, c.nombre, c.apellido, c.numero_documento, c.numero_licencia, " +
      "c.fecha_alta_licencia, c.fecha_vencimiento_licencia, " +
      "COALESCE(SUM(vi.kilometros), 0) AS total_kilometros, " +
      "COUNT(vi.id) AS cantidad_viajes " +
      "FROM conductores c " +
      "LEFT JOIN viajes vi ON vi.conductor_id = c.id";

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " GROUP BY c.id ORDER BY c.id DESC";

    const [conductores] = await db.execute(sql, parametros);
    res.json(conductores);
  },
);

// GET /conductores/:id - Detalle de un conductor
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const sql =
      "SELECT c.id, c.nombre, c.apellido, c.numero_documento, c.numero_licencia, " +
      "c.fecha_alta_licencia, c.fecha_vencimiento_licencia, " +
      "COALESCE(SUM(vi.kilometros), 0) AS total_kilometros, " +
      "COUNT(vi.id) AS cantidad_viajes " +
      "FROM conductores c " +
      "LEFT JOIN viajes vi ON vi.conductor_id = c.id " +
      "WHERE c.id = ? " +
      "GROUP BY c.id";

    const [conductores] = await db.execute(sql, [id]);

    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    res.json(conductores[0]);
  },
);

// GET /conductores/:id/viajes - Historial de viajes y total de km de un conductor
router.get(
  "/:id/viajes",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [conductores] = await db.execute(
      "SELECT * FROM conductores WHERE id = ?",
      [id],
    );

    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    const sqlViajes =
      "SELECT vi.id, vi.vehiculo_id, vi.conductor_id, vi.fecha_salida, vi.fecha_llegada, " +
      "vi.origen, vi.destino, vi.kilometros, vi.observaciones, " +
      "v.marca AS vehiculo_marca, v.modelo AS vehiculo_modelo, v.patente AS vehiculo_patente " +
      "FROM viajes vi " +
      "JOIN vehiculos v ON vi.vehiculo_id = v.id " +
      "WHERE vi.conductor_id = ? " +
      "ORDER BY vi.fecha_salida DESC, vi.id DESC";

    const [viajes] = await db.execute(sqlViajes, [id]);

    const [totales] = await db.execute(
      "SELECT COALESCE(SUM(kilometros), 0) AS total_kilometros, COUNT(id) AS cantidad_viajes " +
        "FROM viajes WHERE conductor_id = ?",
      [id],
    );

    res.json({
      conductor: conductores[0],
      total_kilometros: totales[0].total_kilometros,
      cantidad_viajes: totales[0].cantidad_viajes,
      viajes,
    });
  },
);

// POST /conductores - Alta de conductor
router.post(
  "/",
  validarAutenticacion,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const {
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
    } = req.body;

    const [docExistente] = await db.execute(
      "SELECT id FROM conductores WHERE numero_documento = ?",
      [numero_documento],
    );
    if (docExistente.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe un conductor con ese número de documento",
      });
    }

    const [licExistente] = await db.execute(
      "SELECT id FROM conductores WHERE numero_licencia = ?",
      [numero_licencia],
    );
    if (licExistente.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe un conductor con ese número de licencia",
      });
    }

    const fechaAlta = fecha_alta_licencia.slice(0, 10);
    const fechaVencimiento = fecha_vencimiento_licencia.slice(0, 10);

    const [result] = await db.execute(
      "INSERT INTO conductores (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) VALUES (?, ?, ?, ?, ?, ?)",
      [
        nombre,
        apellido,
        numero_documento,
        numero_licencia,
        fechaAlta,
        fechaVencimiento,
      ],
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia: fechaAlta,
      fecha_vencimiento_licencia: fechaVencimiento,
    });
  },
);

// PUT /conductores/:id - Modificación de conductor
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const {
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
    } = req.body;

    const [conductores] = await db.execute(
      "SELECT id FROM conductores WHERE id = ?",
      [id],
    );

    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    const [docDuplicado] = await db.execute(
      "SELECT id FROM conductores WHERE numero_documento = ? AND id <> ?",
      [numero_documento, id],
    );
    if (docDuplicado.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe otro conductor con ese número de documento",
      });
    }

    const [licDuplicada] = await db.execute(
      "SELECT id FROM conductores WHERE numero_licencia = ? AND id <> ?",
      [numero_licencia, id],
    );
    if (licDuplicada.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe otro conductor con ese número de licencia",
      });
    }

    const fechaAlta = fecha_alta_licencia.slice(0, 10);
    const fechaVencimiento = fecha_vencimiento_licencia.slice(0, 10);

    await db.execute(
      "UPDATE conductores SET nombre = ?, apellido = ?, numero_documento = ?, numero_licencia = ?, fecha_alta_licencia = ?, fecha_vencimiento_licencia = ? WHERE id = ?",
      [
        nombre,
        apellido,
        numero_documento,
        numero_licencia,
        fechaAlta,
        fechaVencimiento,
        id,
      ],
    );

    res.json({
      id,
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia: fechaAlta,
      fecha_vencimiento_licencia: fechaVencimiento,
    });
  },
);

// DELETE /conductores/:id - Eliminación de conductor
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [conductores] = await db.execute(
      "SELECT * FROM conductores WHERE id = ?",
      [id],
    );

    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    const [viajesAsociados] = await db.execute(
      "SELECT id FROM viajes WHERE conductor_id = ? LIMIT 1",
      [id],
    );

    if (viajesAsociados.length > 0) {
      return res.status(400).json({
        mensaje:
          "No se puede eliminar el conductor porque tiene viajes asociados",
      });
    }

    await db.execute("DELETE FROM conductores WHERE id = ?", [id]);
    res.json(conductores[0]);
  },
);

export default router;

