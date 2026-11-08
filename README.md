# Trabajo Práctico N.º 3 – Programación IV

**Alumno:** Mercado Cáceres José Gustavo

Sistema web de **Gestión de vehículos, conductores y viajes** para una empresa de transporte.

## Estructura del proyecto

- `backend/`: API REST JSON desarrollada con Node.js, Express, MySQL (`mysql2`), validaciones con `express-validator`, contraseñas encriptadas con `bcrypt` y autenticación JWT con `passport` / `passport-jwt` (expiración de 4 horas).
- `frontend/`: Aplicación web SPA desarrollada con Vite, React, `react-router` y CSS puro.

## Puesta en marcha

### 1. Base de datos MySQL

Ejecutar el script SQL incluido en `backend/tablas.sql` desde MySQL Workbench, DBeaver o consola para crear la base `tp3_transporte` y sus tablas (`usuarios`, `vehiculos`, `conductores`, `viajes`).

### 2. Backend

1. Copiar `backend/.env.example` a `backend/.env` y configurar las credenciales de MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_DATABASE`) y `JWT_SECRET`.
2. Instalar dependencias y levantar el servidor:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   El servidor quedará escuchando en `http://localhost:3000`.

### 3. Frontend

En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
Abrir la URL indicada por Vite (por defecto `http://localhost:5173`).

