import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTransactionInput, UpdateTransactionInput } from '@shared/types';
import { api } from '../api/client';

export function useTransactions(month: string) {
  return useQuery({
    queryKey: ['transactions', month],
    queryFn: () => api.getTransactions(month),
  });
}

function useInvalidateMonth(month: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['transactions', month] });
    queryClient.invalidateQueries({ queryKey: ['summary', 'spending-by-category', month] });
    queryClient.invalidateQueries({ queryKey: ['summary', 'budget-vs-actual', month] });
  };
}

export function useCreateTransaction(month: string) {
  const invalidate = useInvalidateMonth(month);
  return useMutation({
    mutationFn: (input: CreateTransactionInput) => api.createTransaction(input),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction(month: string) {
  const invalidate = useInvalidateMonth(month);
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTransactionInput }) =>
      api.updateTransaction(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction(month: string) {
  const invalidate = useInvalidateMonth(month);
  return useMutation({
    mutationFn: (id: number) => api.deleteTransaction(id),
    onSuccess: invalidate,
  });
}
