import mysql from "mysql2/promise";

export let db = null;

// Conexión a base de datos
export async function conectarDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
      dateStrings: true,
      decimalNumbers: true,
    });
    console.log("Conectado a la base de datos");
  } catch (e) {
    console.error("Error al conectar a la base de datos:", e.message);
    process.exit(1);
  }
}

