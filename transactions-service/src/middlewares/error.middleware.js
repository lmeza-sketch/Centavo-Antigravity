/**
 * Middleware de manejo global de errores.
 * Captura errores lanzados en handlers y servicios, y retorna una respuesta JSON uniforme.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor.' : err.message;

  if (status === 500) {
    console.error('[error]', err);
  }

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
