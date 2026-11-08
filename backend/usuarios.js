import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosUsuarios,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /usuarios - Listado de usuarios (sin exponer contraseñas)
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosUsuarios,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];
    const { nombre, email } = req.query;

    if (nombre) {
      filtros.push("nombre LIKE ?");
      parametros.push(`%${nombre}%`);
    }

    if (email) {
      filtros.push("email LIKE ?");
      parametros.push(`%${email}%`);
    }

    let sql = "SELECT id, nombre, email FROM usuarios";
    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }
    sql += " ORDER BY id ASC";

    const [usuarios] = await db.execute(sql, parametros);
    res.json(usuarios);
  },
);

// GET /usuarios/:id - Detalle de un usuario (sin exponer contraseña)
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [usuarios] = await db.execute(
      "SELECT id, nombre, email FROM usuarios WHERE id = ?",
      [id],
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuarios[0]);
  },
);

export default router;

