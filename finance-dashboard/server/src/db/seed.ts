import { db, runInTransaction } from './index.js';

const DEFAULT_EXPENSE_CATEGORIES: Array<{ name: string; color: string }> = [
  { name: 'Groceries', color: '#4ade80' },
  { name: 'Rent/Mortgage', color: '#60a5fa' },
  { name: 'Utilities', color: '#facc15' },
  { name: 'Transportation', color: '#f97316' },
  { name: 'Dining Out', color: '#f472b6' },
  { name: 'Entertainment', color: '#a78bfa' },
  { name: 'Health', color: '#2dd4bf' },
  { name: 'Shopping', color: '#fb7185' },
  { name: 'Insurance', color: '#94a3b8' },
  { name: 'Miscellaneous', color: '#c084fc' },
];

const DEFAULT_INCOME_CATEGORIES: Array<{ name: string; color: string }> = [
  { name: 'Salary', color: '#22c55e' },
  { name: 'Other Income', color: '#84cc16' },
];

export function seed(): void {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO categories (name, type, color) VALUES (@name, @type, @color)'
  );

  runInTransaction(() => {
    for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
      insert.run({ ...cat, type: 'expense' });
    }
    for (const cat of DEFAULT_INCOME_CATEGORIES) {
      insert.run({ ...cat, type: 'income' });
    }
  });
}
