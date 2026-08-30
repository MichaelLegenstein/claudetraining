import { Router } from 'express';
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  listTransactions,
  updateTransaction,
} from '../repositories/transactionsRepo.js';
import {
  createTransactionSchema,
  transactionsQuerySchema,
  updateTransactionSchema,
} from '../validation/schemas.js';

export const transactionsRouter = Router();

transactionsRouter.get('/', (req, res) => {
  const query = transactionsQuerySchema.parse(req.query);
  res.json(listTransactions(query));
});

transactionsRouter.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const transaction = getTransactionById(id);
  if (!transaction) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }
  res.json(transaction);
});

transactionsRouter.post('/', (req, res) => {
  const input = createTransactionSchema.parse(req.body);
  res.status(201).json(createTransaction(input));
});

transactionsRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const input = updateTransactionSchema.parse(req.body);
  const updated = updateTransaction(id, input);
  if (!updated) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }
  res.json(updated);
});

transactionsRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const deleted = deleteTransaction(id);
  if (!deleted) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }
  res.status(204).send();
});
