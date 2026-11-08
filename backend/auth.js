import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { db } from "./db.js";
import {
  validarLogin,
  validarRegistro,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

export function authConfig() {
  // Opciones de configuración de passport-jwt
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  // Estrategia JWT
  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      next(null, payload);
    }),
  );
}

// POST /auth/register - Registro de nuevos usuarios
router.post(
  "/register",
  validarRegistro,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, email, password } = req.body;

    // Verificar que el email no esté registrado previamente
    const [existentes] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
    );

    if (existentes.length > 0) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe un usuario registrado con ese email" });
    }

    // Encriptar contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword],
    );

    // Nunca devolver la contraseña
    res.status(201).json({
      id: result.insertId,
      nombre,
      email,
    });
  },
);

// POST /auth/login - Inicio de sesión de usuarios
router.post("/login", validarLogin, verificarValidaciones, async (req, res) => {
  const { email, password } = req.body;

  const [usuarios] = await db.execute(
    "SELECT id, nombre, email, password FROM usuarios WHERE email = ?",
    [email],
  );

  if (usuarios.length === 0) {
    return res.status(401).json({ mensaje: "Email o contraseña inválidos" });
  }

  const usuario = usuarios[0];
  const passwordComparada = await bcrypt.compare(password, usuario.password);

  if (!passwordComparada) {
    return res.status(401).json({ mensaje: "Email o contraseña inválidos" });
  }

  // Generar token JWT con expiración de 4 horas
  const payload = {
    userId: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "4h",
  });

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
    },
  });
});

export default router;

