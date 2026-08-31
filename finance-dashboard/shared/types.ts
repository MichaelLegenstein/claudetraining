export type CategoryType = 'expense' | 'income';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color: string | null;
  isArchived: boolean;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  type?: CategoryType;
  color?: string;
  isArchived?: boolean;
}

export interface Transaction {
  id: number;
  date: string; // 'YYYY-MM-DD'
  amount: number;
  type: CategoryType;
  categoryId: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  date: string;
  amount: number;
  type: CategoryType;
  categoryId: number;
  description?: string;
}

export type UpdateTransactionInput = CreateTransactionInput;

export interface Budget {
  id: number;
  categoryId: number;
  month: string; // 'YYYY-MM'
  amount: number;
}

export interface BudgetRow {
  categoryId: number;
  categoryName: string;
  amount: number;
}

export interface UpsertBudgetInput {
  categoryId: number;
  amount: number;
}

export interface SpendingByCategoryRow {
  categoryId: number;
  categoryName: string;
  color: string | null;
  total: number;
}

export interface BudgetVsActualRow {
  categoryId: number;
  categoryName: string;
  budgeted: number;
  actual: number;
  remaining: number;
  percentUsed: number;
}

export interface ApiError {
  error: string;
}
