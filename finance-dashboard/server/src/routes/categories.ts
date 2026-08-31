import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../repositories/categoriesRepo.js';
import { createCategorySchema, updateCategorySchema } from '../validation/schemas.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', (req, res) => {
  const includeArchived = req.query.includeArchived === 'true';
  res.json(listCategories(includeArchived));
});

categoriesRouter.post('/', (req, res) => {
  const input = createCategorySchema.parse(req.body);
  res.status(201).json(createCategory(input));
});

categoriesRouter.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const input = updateCategorySchema.parse(req.body);
  const updated = updateCategory(id, input);
  if (!updated) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json(updated);
});

categoriesRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const deleted = deleteCategory(id);
  if (!deleted) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.status(204).send();
});
