import { useState } from 'react';
import type { Category, CategoryType, Transaction } from '@shared/types';

interface TransactionFormModalProps {
  categories: Category[];
  transaction?: Transaction;
  defaultMonth: string;
  onClose: () => void;
  onSubmit: (input: {
    date: string;
    amount: number;
    type: CategoryType;
    categoryId: number;
    description?: string;
  }) => void;
  isSubmitting: boolean;
}

function defaultDateForMonth(month: string): string {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  if (month === currentMonth) {
    return today.toISOString().slice(0, 10);
  }
  return `${month}-01`;
}

export default function TransactionFormModal({
  categories,
  transaction,
  defaultMonth,
  onClose,
  onSubmit,
  isSubmitting,
}: TransactionFormModalProps) {
  const [date, setDate] = useState(transaction?.date ?? defaultDateForMonth(defaultMonth));
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [type, setType] = useState<CategoryType>(transaction?.type ?? 'expense');
  const [categoryId, setCategoryId] = useState<number | ''>(
    transaction?.categoryId ?? categories.find((c) => c.type === (transaction?.type ?? 'expense'))?.id ?? ''
  );
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.type === type);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!date || !parsedAmount || parsedAmount <= 0 || !categoryId) {
      setError('Please fill in date, a positive amount, and a category.');
      return;
    }
    setError(null);
    onSubmit({
      date,
      amount: parsedAmount,
      type,
      categoryId: Number(categoryId),
      description: description.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-medium text-slate-100">
          {transaction ? 'Edit Transaction' : 'Add Transaction'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId(categories.find((c) => c.type === 'expense')?.id ?? '');
              }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                type === 'expense' ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId(categories.find((c) => c.type === 'income')?.id ?? '');
              }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                type === 'income' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
            >
              <option value="" disabled>
                Select a category
              </option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              placeholder="e.g. Weekly groceries"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
