import { body, param, query, validationResult } from "express-validator";
import passport from "passport";

// Middleware de Passport para verificar el token JWT y restringir acceso a rutas protegidas
export const validarAutenticacion = (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .json({ mensaje: "No autenticado: token requerido" });
  }

  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(403).json({
        mensaje: "Acceso prohibido: token inválido o expirado",
        detalle: info?.message,
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Validación común de parámetro :id
export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un número entero positivo");

// Validaciones de autenticación y registro
export const validarRegistro = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede contener letras y espacios")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ingresar un email con formato válido")
    .isLength({ max: 100 })
    .withMessage("El email no puede superar los 100 caracteres"),
  body("password")
    .isString()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 0,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      "La contraseña debe tener al menos 8 caracteres, una letra minúscula y un número",
    )
    .isLength({ max: 50 })
    .withMessage("La contraseña no puede superar los 50 caracteres"),
];

export const validarLogin = [
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ingresar un email con formato válido")
    .isLength({ max: 100 }),
  body("password")
    .isString()
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 1, max: 50 })
    .withMessage("Contraseña inválida"),
];

// Validaciones de filtros de usuarios
export const validarFiltrosUsuarios = [
  query("nombre")
    .optional({ values: "falsy" })
    .trim()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El filtro nombre solo admite letras y espacios")
    .isLength({ max: 100 }),
  query("email")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("El filtro email no puede superar 100 caracteres"),
];

// Validaciones de vehículos
export const validarFiltrosVehiculos = [
  query("marca")
    .optional({ values: "falsy" })
    .trim()
    .isAlphanumeric("es-ES", { ignore: " .-" })
    .withMessage("Filtro de marca inválido")
    .isLength({ max: 50 }),
  query("modelo")
    .optional({ values: "falsy" })
    .trim()
    .isAlphanumeric("es-ES", { ignore: " .-/" })
    .withMessage("Filtro de modelo inválido")
    .isLength({ max: 50 }),
  query("patente")
    .optional({ values: "falsy" })
    .trim()
    .isAlphanumeric("es-ES", { ignore: " -" })
    .withMessage("Filtro de patente inválido")
    .isLength({ max: 20 }),
];

export const validarVehiculo = [
  body("marca")
    .trim()
    .notEmpty()
    .withMessage("La marca es obligatoria")
    .isAlphanumeric("es-ES", { ignore: " .-" })
    .withMessage("La marca contiene caracteres no permitidos")
    .isLength({ min: 1, max: 50 })
    .withMessage("La marca debe tener entre 1 y 50 caracteres"),
  body("modelo")
    .trim()
    .notEmpty()
    .withMessage("El modelo es obligatorio")
    .isAlphanumeric("es-ES", { ignore: " .-/" })
    .withMessage("El modelo contiene caracteres no permitidos")
    .isLength({ min: 1, max: 50 })
    .withMessage("El modelo debe tener entre 1 y 50 caracteres"),
  body("patente")
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage("La patente es obligatoria")
    .matches(/^[A-Z0-9 -]{6,10}$/)
    .withMessage(
      "La patente debe tener entre 6 y 10 caracteres alfanuméricos",
    ),
  body("anio")
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage(
      `El año debe ser un número entero entre 1950 y ${new Date().getFullYear() + 1}`,
    ),
  body("capacidad_carga")
    .isFloat({ gt: 0 })
    .withMessage("La capacidad de carga debe ser un número mayor a 0"),
];

// Validaciones de conductores
export const validarFiltrosConductores = [
  query("nombre")
    .optional({ values: "falsy" })
    .trim()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El filtro nombre solo admite letras")
    .isLength({ max: 50 }),
  query("apellido")
    .optional({ values: "falsy" })
    .trim()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El filtro apellido solo admite letras")
    .isLength({ max: 50 }),
  query("numero_documento")
    .optional({ values: "falsy" })
    .trim()
    .isNumeric()
    .withMessage("El filtro documento solo admite números")
    .isLength({ max: 20 }),
];

export const validarConductor = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede contener letras y espacios")
    .isLength({ min: 1, max: 50 })
    .withMessage("El nombre debe tener entre 1 y 50 caracteres"),
  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El apellido solo puede contener letras y espacios")
    .isLength({ min: 1, max: 50 })
    .withMessage("El apellido debe tener entre 1 y 50 caracteres"),
  body("numero_documento")
    .trim()
    .notEmpty()
    .withMessage("El número de documento es obligatorio")
    .isNumeric()
    .withMessage("El número de documento solo puede contener números")
    .isLength({ min: 7, max: 15 })
    .withMessage("El número de documento debe tener entre 7 y 15 dígitos"),
  body("numero_licencia")
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage("El número de licencia es obligatorio")
    .isAlphanumeric("es-ES", { ignore: " -" })
    .withMessage(
      "El número de licencia solo puede contener letras, números o guiones",
    )
    .isLength({ min: 4, max: 30 })
    .withMessage("El número de licencia debe tener entre 4 y 30 caracteres"),
  body("fecha_alta_licencia")
    .notEmpty()
    .withMessage("La fecha de alta de licencia es obligatoria")
    .isISO8601()
    .withMessage("Formato de fecha de alta inválido (YYYY-MM-DD)"),
  body("fecha_vencimiento_licencia")
    .notEmpty()
    .withMessage("La fecha de vencimiento de licencia es obligatoria")
    .isISO8601()
    .withMessage("Formato de fecha de vencimiento inválido (YYYY-MM-DD)")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.fecha_alta_licencia)) {
        throw new Error(
          "La fecha de vencimiento debe ser posterior a la fecha de alta",
        );
      }
      return true;
    }),
];

// Validaciones de viajes
export const validarFiltrosViajes = [
  query("vehiculo_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("vehiculo_id debe ser un número entero positivo"),
  query("conductor_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("conductor_id debe ser un número entero positivo"),
  query("origen")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("El filtro origen no puede superar 100 caracteres"),
  query("destino")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("El filtro destino no puede superar 100 caracteres"),
];

export const validarViaje = [
  body("vehiculo_id")
    .isInt({ min: 1 })
    .withMessage("Debe seleccionar un vehículo válido"),
  body("conductor_id")
    .isInt({ min: 1 })
    .withMessage("Debe seleccionar un conductor válido"),
  body("fecha_salida")
    .notEmpty()
    .withMessage("La fecha de salida es obligatoria")
    .isISO8601()
    .withMessage("Formato de fecha de salida inválido"),
  body("fecha_llegada")
    .notEmpty()
    .withMessage("La fecha de llegada es obligatoria")
    .isISO8601()
    .withMessage("Formato de fecha de llegada inválido")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.fecha_salida)) {
        throw new Error(
          "La fecha de llegada no puede ser anterior a la fecha de salida",
        );
      }
      return true;
    }),
  body("origen")
    .trim()
    .notEmpty()
    .withMessage("El origen es obligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("El origen debe tener entre 2 y 100 caracteres"),
  body("destino")
    .trim()
    .notEmpty()
    .withMessage("El destino es obligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("El destino debe tener entre 2 y 100 caracteres"),
  body("kilometros")
    .isFloat({ gt: 0 })
    .withMessage("Los kilómetros deben ser un número mayor a 0"),
  body("observaciones")
    .optional({ values: "null" })
    .isString()
    .withMessage("Las observaciones deben ser texto")
    .isLength({ max: 500 })
    .withMessage("Las observaciones no pueden superar los 500 caracteres"),
];

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parámetros no válidos",
      errores: resultadoValidacion.array(),
    });
  }
  next();
};

