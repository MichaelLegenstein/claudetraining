import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { CategoryInUseError } from '../repositories/categoriesRepo.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    return;
  }
  if (err instanceof CategoryInUseError) {
    res.status(409).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
