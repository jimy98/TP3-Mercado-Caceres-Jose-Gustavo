import express from "express";
import cors from "cors";
import passport from "passport";
import { conectarDB } from "./db.js";
import authRouter, { authConfig } from "./auth.js";
import usuariosRouter from "./usuarios.js";
import vehiculosRouter from "./vehiculos.js";
import conductoresRouter from "./conductores.js";
import viajesRouter from "./viajes.js";

await conectarDB();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Para interpretar body como JSON
app.use(express.json());

// Habilito CORS
app.use(cors());

// Configurar Passport JWT
authConfig();
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Gestión de Transporte - TP3 funcionando correctamente",
  });
});

app.use("/auth", authRouter);
app.use("/usuarios", usuariosRouter);
app.use("/vehiculos", vehiculosRouter);
app.use("/conductores", conductoresRouter);
app.use("/viajes", viajesRouter);

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

// Manejo global de errores internos (500)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Error interno:", err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "Formato JSON inválido" });
  }
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

app.listen(port, () => {
  console.log(`La aplicación está funcionando en http://localhost:${port}`);
});

