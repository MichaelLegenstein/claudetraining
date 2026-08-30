import { useState } from 'react';
import BudgetVsActualTable from '../components/budgets/BudgetVsActualTable';
import SpendingByCategoryChart from '../components/charts/SpendingByCategoryChart';
import MonthSelector from '../components/layout/MonthSelector';
import TransactionsTable from '../components/transactions/TransactionsTable';

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());

  return (
    <div className="space-y-6">
      <MonthSelector month={month} onChange={setMonth} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpendingByCategoryChart month={month} />
        <BudgetVsActualTable month={month} />
      </div>

      <TransactionsTable month={month} />
    </div>
  );
}
