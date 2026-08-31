import { Router } from 'express';
import { getBudgetVsActual, getSpendingByCategory } from '../repositories/summaryRepo.js';
import { monthSchema } from '../validation/schemas.js';

export const summaryRouter = Router();

summaryRouter.get('/spending-by-category', (req, res) => {
  const month = monthSchema.parse(req.query.month);
  res.json(getSpendingByCategory(month));
});

summaryRouter.get('/budget-vs-actual', (req, res) => {
  const month = monthSchema.parse(req.query.month);
  res.json(getBudgetVsActual(month));
});
