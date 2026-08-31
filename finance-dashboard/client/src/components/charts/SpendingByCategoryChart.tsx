import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useSpendingByCategory } from '../../hooks/useSummary';

const FALLBACK_COLOR = '#64748b';

export default function SpendingByCategoryChart({ month }: { month: string }) {
  const { data, isLoading, isError } = useSpendingByCategory(month);

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
      <h2 className="mb-4 text-sm font-medium text-slate-300">Spending by Category</h2>

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {isError && <p className="text-sm text-red-400">Failed to load spending data.</p>}
      {data && data.length === 0 && (
        <p className="text-sm text-slate-500">No expenses recorded for this month.</p>
      )}

      {data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `$${v}`} />
            <YAxis
              type="category"
              dataKey="categoryName"
              stroke="#64748b"
              width={110}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {data.map((row) => (
                <Cell key={row.categoryId} fill={row.color ?? FALLBACK_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
