import { Router } from 'express';
import { deleteBudget, getBudgetsForMonth, upsertBudgetsForMonth } from '../repositories/budgetsRepo.js';
import { monthSchema, upsertBudgetsSchema } from '../validation/schemas.js';

export const budgetsRouter = Router();

budgetsRouter.get('/', (req, res) => {
  const month = monthSchema.parse(req.query.month);
  res.json(getBudgetsForMonth(month));
});

budgetsRouter.put('/', (req, res) => {
  const month = monthSchema.parse(req.query.month);
  const budgets = upsertBudgetsSchema.parse(req.body);
  upsertBudgetsForMonth(month, budgets);
  res.json(getBudgetsForMonth(month));
});

budgetsRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const deleted = deleteBudget(id);
  if (!deleted) {
    res.status(404).json({ error: 'Budget not found' });
    return;
  }
  res.status(204).send();
});
