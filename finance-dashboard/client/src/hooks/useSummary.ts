import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useSpendingByCategory(month: string) {
  return useQuery({
    queryKey: ['summary', 'spending-by-category', month],
    queryFn: () => api.getSpendingByCategory(month),
  });
}

export function useBudgetVsActual(month: string) {
  return useQuery({
    queryKey: ['summary', 'budget-vs-actual', month],
    queryFn: () => api.getBudgetVsActual(month),
  });
}
