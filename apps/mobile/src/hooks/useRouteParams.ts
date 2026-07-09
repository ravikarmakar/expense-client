import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

/**
 * Custom hook to retrieve and validate route parameters using a Zod schema.
 * Throws a validation error if the parameters do not conform to the schema.
 */
export function useRouteParams<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const params = useLocalSearchParams();
  return schema.parse(params);
}

/**
 * Schema for routes expecting a single required `id` parameter (e.g., dynamic [id] segments).
 */
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

/**
 * Schema for the OTP validation screen.
 * The email parameter is optional since it can also be retrieved from offline persistent storage.
 */
export const otpParamsSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
});

/**
 * Schema for the Settle Up screen.
 * Expects an optional `type` filter parameter of either 'owed' or 'owe'.
 */
export const settleUpParamsSchema = z.object({
  type: z.enum(['owed', 'owe']).optional(),
});
