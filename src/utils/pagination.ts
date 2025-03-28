import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(900).default(20),
});

export const paginationResponseSchema = z.object({
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  number: z.number(),
});

/**
 * Creates a paginated query schema with sorting and filtering
 *
 * @param extendSchema - Schema to extend the base pagination schema with
 * @returns A Zod object schema for pagination with extensions
 */
export function createPaginatedQuerySchema<T extends Record<string, z.ZodType>>(extendSchema: T) {
  return z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    ...extendSchema,
  });
}
