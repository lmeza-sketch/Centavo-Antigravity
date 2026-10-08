const { Router } = require('express');
const budgetService = require('../services/budget.service');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createBudgetSchema,
  updateBudgetSchema,
  queryBudgetsSchema,
  validate,
  validateQuery,
} = require('../validators/budget.validator');

const router = Router();

// Todas las rutas de presupuestos requieren autenticación
router.use(authenticate);

// GET /api/budgets - Listar presupuestos del usuario
router.get('/', validateQuery(queryBudgetsSchema), async (req, res, next) => {
  try {
    const budgets = await budgetService.listBudgets(req.user.sub, req.query);
    res.json(budgets);
  } catch (err) {
    next(err);
  }
});

// POST /api/budgets - Crear nuevo presupuesto
router.post('/', validate(createBudgetSchema), async (req, res, next) => {
  try {
    const budget = await budgetService.createBudget({
      userId: req.user.sub,
      ...req.body,
    });
    res.status(201).json({
      message: 'Presupuesto creado exitosamente.',
      budget,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/budgets/:id - Detalle de un presupuesto
router.get('/:id', async (req, res, next) => {
  try {
    const budget = await budgetService.getBudgetById(req.user.sub, req.params.id);
    res.json(budget);
  } catch (err) {
    next(err);
  }
});

// PUT /api/budgets/:id - Actualizar presupuesto
router.put('/:id', validate(updateBudgetSchema), async (req, res, next) => {
  try {
    const budget = await budgetService.updateBudget(
      req.user.sub,
      req.params.id,
      req.body,
    );
    res.json({
      message: 'Presupuesto actualizado exitosamente.',
      budget,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/budgets/:id - Eliminar presupuesto
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await budgetService.deleteBudget(req.user.sub, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
