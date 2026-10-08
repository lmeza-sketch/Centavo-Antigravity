const { Router } = require('express');
const authService = require('../services/auth.service');
const { authenticate } = require('../middlewares/auth.middleware');
const { registerSchema, loginSchema, refreshSchema, validate } = require('../validators/auth.validator');

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Usuario registrado exitosamente.', user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const tokens = await authService.login(req.body);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', validate(refreshSchema), async (req, res, next) => {
  try {
    await authService.logout(req.body);
    res.json({ message: 'Sesión cerrada exitosamente.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  (requiere token válido)
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.sub);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
