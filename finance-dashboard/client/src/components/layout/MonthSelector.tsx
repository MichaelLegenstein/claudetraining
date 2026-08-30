function shiftMonth(month: string, delta: number): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

interface MonthSelectorProps {
  month: string;
  onChange: (month: string) => void;
}

export default function MonthSelector({ month, onChange }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(month, -1))}
        className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
        aria-label="Previous month"
      >
        ←
      </button>
      <span className="min-w-[10rem] text-center text-lg font-medium text-slate-100">
        {formatMonthLabel(month)}
      </span>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(month, 1))}
        className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
        aria-label="Next month"
      >
        →
      </button>
    </div>
  );
}
