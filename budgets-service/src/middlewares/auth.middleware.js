const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica el JWT en el header Authorization.
 * Adjunta `req.user = { sub, email }` si el token es válido.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de acceso requerido.' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { sub: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

module.exports = { authenticate };
