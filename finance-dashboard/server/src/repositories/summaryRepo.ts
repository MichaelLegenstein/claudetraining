import { db } from '../db/index.js';
import type { BudgetVsActualRow, SpendingByCategoryRow } from '../../../shared/types.js';

export function getSpendingByCategory(month: string): SpendingByCategoryRow[] {
  const rows = db
    .prepare(
      `SELECT c.id AS categoryId, c.name AS categoryName, c.color,
              COALESCE(SUM(t.amount), 0) AS total
       FROM categories c
       JOIN transactions t
         ON t.category_id = c.id AND t.type = 'expense' AND substr(t.date, 1, 7) = @month
       WHERE c.type = 'expense'
       GROUP BY c.id, c.name, c.color
       ORDER BY total DESC`
    )
    .all({ month });

  return rows as unknown as SpendingByCategoryRow[];
}

export function getBudgetVsActual(month: string): BudgetVsActualRow[] {
  const [year, monthNum] = month.split('-').map(Number);

  const rows = db
    .prepare(
      `SELECT c.id AS categoryId, c.name AS categoryName,
              COALESCE(b.amount, 0) AS budgeted,
              COALESCE(SUM(CASE WHEN t.type = 'expense' AND substr(t.date, 1, 7) = @month
                                 THEN t.amount END), 0) AS actual
       FROM categories c
       LEFT JOIN budgets b ON b.category_id = c.id AND b.year = @year AND b.month = @monthNum
       LEFT JOIN transactions t ON t.category_id = c.id
       WHERE c.type = 'expense' AND c.is_archived = 0
       GROUP BY c.id, c.name, b.amount
       ORDER BY c.name`
    )
    .all({ month, year, monthNum }) as Array<{
    categoryId: number;
    categoryName: string;
    budgeted: number;
    actual: number;
  }>;

  return rows.map((row) => ({
    ...row,
    remaining: row.budgeted - row.actual,
    percentUsed: row.budgeted > 0 ? (row.actual / row.budgeted) * 100 : 0,
  }));
}
