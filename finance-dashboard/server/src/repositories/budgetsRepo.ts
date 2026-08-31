import { db, runInTransaction } from '../db/index.js';
import type { BudgetRow, UpsertBudgetInput } from '../../../shared/types.js';

function splitMonth(month: string): { year: number; monthNum: number } {
  const [year, monthNum] = month.split('-').map(Number);
  return { year, monthNum };
}

export function getBudgetsForMonth(month: string): BudgetRow[] {
  const { year, monthNum } = splitMonth(month);

  const rows = db
    .prepare(
      `SELECT c.id AS categoryId, c.name AS categoryName, COALESCE(b.amount, 0) AS amount
       FROM categories c
       LEFT JOIN budgets b ON b.category_id = c.id AND b.year = @year AND b.month = @monthNum
       WHERE c.type = 'expense' AND c.is_archived = 0
       ORDER BY c.name`
    )
    .all({ year, monthNum });

  return rows as unknown as BudgetRow[];
}

export function upsertBudgetsForMonth(month: string, budgets: UpsertBudgetInput[]): void {
  const { year, monthNum } = splitMonth(month);

  const upsert = db.prepare(
    `INSERT INTO budgets (category_id, year, month, amount)
     VALUES (@categoryId, @year, @monthNum, @amount)
     ON CONFLICT(category_id, year, month)
     DO UPDATE SET amount = excluded.amount, updated_at = datetime('now')`
  );

  runInTransaction(() => {
    for (const item of budgets) {
      upsert.run({ categoryId: item.categoryId, year, monthNum, amount: item.amount });
    }
  });
}

export function deleteBudget(id: number): boolean {
  const result = db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
  return result.changes > 0;
}
