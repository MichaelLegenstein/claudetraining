import type {
  Budget,
  BudgetRow,
  BudgetVsActualRow,
  Category,
  CreateCategoryInput,
  CreateTransactionInput,
  SpendingByCategoryRow,
  Transaction,
  UpdateCategoryInput,
  UpdateTransactionInput,
  UpsertBudgetInput,
} from '@shared/types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (input: CreateCategoryInput) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(input) }),
  updateCategory: (id: number, input: UpdateCategoryInput) =>
    request<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteCategory: (id: number) => request<void>(`/categories/${id}`, { method: 'DELETE' }),

  getTransactions: (month: string) =>
    request<Transaction[]>(`/transactions?month=${month}`),
  createTransaction: (input: CreateTransactionInput) =>
    request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(input) }),
  updateTransaction: (id: number, input: UpdateTransactionInput) =>
    request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteTransaction: (id: number) => request<void>(`/transactions/${id}`, { method: 'DELETE' }),

  getBudgets: (month: string) => request<BudgetRow[]>(`/budgets?month=${month}`),
  saveBudgets: (month: string, budgets: UpsertBudgetInput[]) =>
    request<Budget[]>(`/budgets?month=${month}`, { method: 'PUT', body: JSON.stringify(budgets) }),

  getSpendingByCategory: (month: string) =>
    request<SpendingByCategoryRow[]>(`/summary/spending-by-category?month=${month}`),
  getBudgetVsActual: (month: string) =>
    request<BudgetVsActualRow[]>(`/summary/budget-vs-actual?month=${month}`),
};
