import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpsertBudgetInput } from '@shared/types';
import { api } from '../api/client';

export function useBudgets(month: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: () => api.getBudgets(month),
  });
}

export function useSaveBudgets(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budgets: UpsertBudgetInput[]) => api.saveBudgets(month, budgets),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', month] });
      queryClient.invalidateQueries({ queryKey: ['summary', 'budget-vs-actual', month] });
    },
  });
}
