const { Router } = require('express');
const transactionService = require('../services/transaction.service');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
  validate,
  validateQuery,
} = require('../validators/transaction.validator');

const router = Router();

// Todas las rutas de transacciones requieren autenticación
router.use(authenticate);

// GET /api/transactions - Listar transacciones del usuario
router.get('/', validateQuery(queryTransactionsSchema), async (req, res, next) => {
  try {
    const transactions = await transactionService.listTransactions(req.user.sub, req.query);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions - Registrar nueva transacción
router.post('/', validate(createTransactionSchema), async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction({
      userId: req.user.sub,
      ...req.body,
    });
    res.status(201).json({
      message: 'Transacción registrada exitosamente.',
      transaction,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/transactions/summary - Resumen de gastos por categoría
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await transactionService.getSummaryByCategory(req.user.sub, req.query);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /api/transactions/:id - Detalle de una transacción
router.get('/:id', async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.user.sub, req.params.id);
    res.json(transaction);
  } catch (err) {
    next(err);
  }
});

// PUT /api/transactions/:id - Actualizar transacción
router.put('/:id', validate(updateTransactionSchema), async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(
      req.user.sub,
      req.params.id,
      req.body,
    );
    res.json({
      message: 'Transacción actualizada exitosamente.',
      transaction,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/transactions/:id - Eliminar transacción
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await transactionService.deleteTransaction(req.user.sub, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
