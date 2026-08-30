import { db } from '../db/index.js';
import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../../../shared/types.js';

interface TransactionRow {
  id: number;
  date: string;
  amount: number;
  type: 'expense' | 'income';
  category_id: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    type: row.type,
    categoryId: row.category_id,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ListTransactionsFilter {
  month?: string;
  categoryId?: number;
  limit?: number;
  offset?: number;
}

export function listTransactions(filter: ListTransactionsFilter): Transaction[] {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filter.month) {
    conditions.push("substr(date, 1, 7) = @month");
    params.month = filter.month;
  }
  if (filter.categoryId) {
    conditions.push('category_id = @categoryId');
    params.categoryId = filter.categoryId;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filter.limit ?? 50;
  const offset = filter.offset ?? 0;

  const rows = db
    .prepare(
      `SELECT * FROM transactions ${where} ORDER BY date DESC, id DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset });

  return (rows as unknown as TransactionRow[]).map(toTransaction);
}

export function getTransactionById(id: number): Transaction | undefined {
  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as
    | TransactionRow
    | undefined;
  return row ? toTransaction(row) : undefined;
}

export function createTransaction(input: CreateTransactionInput): Transaction {
  const result = db
    .prepare(
      'INSERT INTO transactions (date, amount, type, category_id, description) VALUES (?, ?, ?, ?, ?)'
    )
    .run(input.date, input.amount, input.type, input.categoryId, input.description ?? null);
  return getTransactionById(Number(result.lastInsertRowid))!;
}

export function updateTransaction(
  id: number,
  input: UpdateTransactionInput
): Transaction | undefined {
  const existing = getTransactionById(id);
  if (!existing) return undefined;

  db.prepare(
    `UPDATE transactions
     SET date = ?, amount = ?, type = ?, category_id = ?, description = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(input.date, input.amount, input.type, input.categoryId, input.description ?? null, id);

  return getTransactionById(id);
}

export function deleteTransaction(id: number): boolean {
  const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  return result.changes > 0;
}
