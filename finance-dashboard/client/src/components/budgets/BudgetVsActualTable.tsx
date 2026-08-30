import { useState } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import { useBudgetVsActual } from '../../hooks/useSummary';
import BudgetEditModal from './BudgetEditModal';

function progressColor(percentUsed: number): string {
  if (percentUsed > 100) return 'bg-red-500';
  if (percentUsed > 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export default function BudgetVsActualTable({ month }: { month: string }) {
  const { data: rows, isLoading, isError } = useBudgetVsActual(month);
  const { data: budgets = [] } = useBudgets(month);
  const [editing, setEditing] = useState(false);

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-300">Budget vs Actual</h2>
        <button
          onClick={() => setEditing(true)}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
        >
          Edit Budgets
        </button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {isError && <p className="text-sm text-red-400">Failed to load budget data.</p>}

      {rows && rows.length > 0 && (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.categoryId}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-300">{row.categoryName}</span>
                <span className="text-slate-400">
                  ${row.actual.toFixed(2)}
                  {row.budgeted > 0 && <span className="text-slate-600"> / ${row.budgeted.toFixed(2)}</span>}
                </span>
              </div>
              {row.budgeted > 0 ? (
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full ${progressColor(row.percentUsed)}`}
                    style={{ width: `${Math.min(row.percentUsed, 100)}%` }}
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-600">No budget set</p>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && <BudgetEditModal month={month} budgets={budgets} onClose={() => setEditing(false)} />}
    </section>
  );
}
