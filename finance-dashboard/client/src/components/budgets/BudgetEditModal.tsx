import { useState } from 'react';
import type { BudgetRow } from '@shared/types';
import { useSaveBudgets } from '../../hooks/useBudgets';

interface BudgetEditModalProps {
  month: string;
  budgets: BudgetRow[];
  onClose: () => void;
}

export default function BudgetEditModal({ month, budgets, onClose }: BudgetEditModalProps) {
  const [values, setValues] = useState<Record<number, string>>(
    Object.fromEntries(budgets.map((b) => [b.categoryId, String(b.amount || '')]))
  );
  const saveMutation = useSaveBudgets(month);

  function handleSave() {
    const payload = budgets.map((b) => ({
      categoryId: b.categoryId,
      amount: Number(values[b.categoryId]) || 0,
    }));
    saveMutation.mutate(payload, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-medium text-slate-100">Edit Budgets</h3>

        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {budgets.map((b) => (
            <div key={b.categoryId} className="flex items-center justify-between gap-3">
              <label className="text-sm text-slate-300">{b.categoryName}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={values[b.categoryId] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [b.categoryId]: e.target.value }))}
                className="w-28 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-right text-slate-100"
                placeholder="0.00"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
