import { z } from 'zod';

export const customCategorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  createdAt: z.string(),
});

export const categoriesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    standard: z.array(z.string()),
    custom: z.array(customCategorySchema),
  }),
});

export type CustomCategory = z.infer<typeof customCategorySchema>;
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>['data'];
