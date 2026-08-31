import { useState } from 'react';
import type { Transaction } from '@shared/types';
import { useCategories } from '../../hooks/useCategories';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from '../../hooks/useTransactions';
import TransactionFormModal from './TransactionFormModal';
import TransactionRow from './TransactionRow';

export default function TransactionsTable({ month }: { month: string }) {
  const { data: transactions, isLoading, isError } = useTransactions(month);
  const { data: categories = [] } = useCategories();

  const createMutation = useCreateTransaction(month);
  const updateMutation = useUpdateTransaction(month);
  const deleteMutation = useDeleteTransaction(month);

  const [modalState, setModalState] = useState<{ open: boolean; transaction?: Transaction }>({
    open: false,
  });

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  function closeModal() {
    setModalState({ open: false });
  }

  function handleSubmit(input: Parameters<typeof createMutation.mutate>[0]) {
    if (modalState.transaction) {
      updateMutation.mutate(
        { id: modalState.transaction.id, input },
        { onSuccess: closeModal }
      );
    } else {
      createMutation.mutate(input, { onSuccess: closeModal });
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-300">Recent Transactions</h2>
        <button
          onClick={() => setModalState({ open: true })}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
        >
          + Add Transaction
        </button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {isError && <p className="text-sm text-red-400">Failed to load transactions.</p>}
      {transactions && transactions.length === 0 && (
        <p className="text-sm text-slate-500">No transactions for this month yet.</p>
      )}

      {transactions && transactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Description</th>
                <th className="pb-2 pr-4 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  category={categoryById.get(t.categoryId)}
                  onEdit={() => setModalState({ open: true, transaction: t })}
                  onDelete={() => deleteMutation.mutate(t.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalState.open && (
        <TransactionFormModal
          categories={categories}
          transaction={modalState.transaction}
          defaultMonth={month}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </section>
  );
}
