import type { Category, Transaction } from '@shared/types';

interface TransactionRowProps {
  transaction: Transaction;
  category: Category | undefined;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TransactionRow({ transaction, category, onEdit, onDelete }: TransactionRowProps) {
  const isExpense = transaction.type === 'expense';

  function handleDelete() {
    if (window.confirm('Delete this transaction?')) {
      onDelete();
    }
  }

  return (
    <tr className="border-b border-slate-800 last:border-0">
      <td className="py-2.5 pr-4 text-slate-400">{transaction.date}</td>
      <td className="py-2.5 pr-4">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
          style={{
            backgroundColor: `${category?.color ?? '#64748b'}22`,
            color: category?.color ?? '#94a3b8',
          }}
        >
          {category?.name ?? 'Unknown'}
        </span>
      </td>
      <td className="py-2.5 pr-4 text-slate-300">{transaction.description || '—'}</td>
      <td className={`py-2.5 pr-4 text-right font-medium ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
        {isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
      </td>
      <td className="py-2.5 text-right">
        <button onClick={onEdit} className="mr-3 text-xs text-slate-400 hover:text-slate-200">
          Edit
        </button>
        <button onClick={handleDelete} className="text-xs text-red-400/80 hover:text-red-400">
          Delete
        </button>
      </td>
    </tr>
  );
}
