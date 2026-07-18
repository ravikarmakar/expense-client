import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategoriesApi, createCategoryApi, deleteCategoryApi } from './categories.api';
import { type CategoriesResponse, type CustomCategory } from './categories.types';

export const categoryKeys = {
  all: ['categories'] as const,
};

/**
 * Hook to get standard and custom categories
 */
export const useCategories = () => {
  return useQuery<CategoriesResponse, Error>({
    queryKey: categoryKeys.all,
    queryFn: getCategoriesApi,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a new custom category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<CustomCategory, Error, { name: string; icon: string; color: string }>({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

/**
 * Hook to delete a custom category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Invalidate expenses to trigger re-renders if standard fallback applies
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
