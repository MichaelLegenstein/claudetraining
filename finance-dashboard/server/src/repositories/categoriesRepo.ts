import { db } from '../db/index.js';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../../shared/types.js';

interface CategoryRow {
  id: number;
  name: string;
  type: 'expense' | 'income';
  color: string | null;
  is_archived: number;
  created_at: string;
}

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
  };
}

export function listCategories(includeArchived: boolean): Category[] {
  const rows = includeArchived
    ? db.prepare('SELECT * FROM categories ORDER BY type, name').all()
    : db.prepare('SELECT * FROM categories WHERE is_archived = 0 ORDER BY type, name').all();
  return (rows as unknown as CategoryRow[]).map(toCategory);
}

export function getCategoryById(id: number): Category | undefined {
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as CategoryRow | undefined;
  return row ? toCategory(row) : undefined;
}

export function createCategory(input: CreateCategoryInput): Category {
  const result = db
    .prepare('INSERT INTO categories (name, type, color) VALUES (?, ?, ?)')
    .run(input.name, input.type, input.color ?? null);
  return getCategoryById(Number(result.lastInsertRowid))!;
}

export function updateCategory(id: number, input: UpdateCategoryInput): Category | undefined {
  const existing = getCategoryById(id);
  if (!existing) return undefined;

  db.prepare(
    'UPDATE categories SET name = ?, type = ?, color = ?, is_archived = ? WHERE id = ?'
  ).run(
    input.name ?? existing.name,
    input.type ?? existing.type,
    input.color !== undefined ? input.color : existing.color,
    input.isArchived !== undefined ? (input.isArchived ? 1 : 0) : (existing.isArchived ? 1 : 0),
    id
  );

  return getCategoryById(id);
}

export class CategoryInUseError extends Error {}

export function deleteCategory(id: number): boolean {
  try {
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return result.changes > 0;
  } catch (err) {
    if (err instanceof Error && /FOREIGN KEY constraint failed/.test(err.message)) {
      throw new CategoryInUseError('Category is referenced by existing transactions or budgets');
    }
    throw err;
  }
}
