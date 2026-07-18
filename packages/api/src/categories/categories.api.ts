import { getApiClient } from '../client';
import {
  categoriesResponseSchema,
  customCategorySchema,
  type CategoriesResponse,
  type CustomCategory,
} from './categories.types';

/**
 * Fetch all categories (standard + custom)
 */
export const getCategoriesApi = async (): Promise<CategoriesResponse> => {
  const { data } = await getApiClient().get<unknown>('/categories');
  const parsed = categoriesResponseSchema.parse(data);
  return parsed.data;
};

/**
 * Create a new custom category
 */
export const createCategoryApi = async (input: {
  name: string;
  icon: string;
  color: string;
}): Promise<CustomCategory> => {
  const { data } = await getApiClient().post<unknown>('/categories', input);
  const parsed = z
    .object({ success: z.boolean(), data: z.object({ category: customCategorySchema }) })
    .parse(data);
  return parsed.data.category;
};

/**
 * Delete an existing custom category by ID
 */
export const deleteCategoryApi = async (id: string): Promise<void> => {
  await getApiClient().delete(`/categories/${id}`);
};

import { z } from 'zod';
