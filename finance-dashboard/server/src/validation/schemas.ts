import { z } from 'zod';

export const categoryTypeSchema = z.enum(['expense', 'income']);

export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be in YYYY-MM format');

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: categoryTypeSchema,
  color: z.string().trim().max(20).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  type: categoryTypeSchema.optional(),
  color: z.string().trim().max(20).optional(),
  isArchived: z.boolean().optional(),
});

export const createTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  amount: z.number().positive(),
  type: categoryTypeSchema,
  categoryId: z.number().int().positive(),
  description: z.string().trim().max(500).optional(),
});

export const updateTransactionSchema = createTransactionSchema;

export const transactionsQuerySchema = z.object({
  month: monthSchema.optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const upsertBudgetsSchema = z.array(
  z.object({
    categoryId: z.number().int().positive(),
    amount: z.number().min(0),
  })
);
