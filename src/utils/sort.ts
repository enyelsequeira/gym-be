import { type SQL, asc, desc, eq, like, or } from 'drizzle-orm';
import { z } from 'zod';

// Define sort direction type
export const SortDirection = z
  .union([z.enum(['asc', 'desc']), z.array(z.string()).transform((arr) => arr[0] || 'asc')])
  .pipe(z.enum(['asc', 'desc']).catch('asc'))
  .default('asc');
export type SortDirection = z.infer<typeof SortDirection>;

/**
 * Creates a zod enum schema from the keys of an object
 *
 * @param obj - Object whose keys will be used for the enum
 * @param defaultValue - Default value for the enum
 * @returns Zod enum schema
 */
export function createSortFieldsSchema<T extends object>(
  obj: T,
  defaultValue: keyof T = Object.keys(obj)[0] as keyof T
) {
  return z.enum(Object.keys(obj) as [string, ...string[]]).default(defaultValue as string);
}

/**
 * Creates a sorting function for a table
 *
 * @param columnMap - Map of sort field names to table columns
 * @returns Function that returns a sort expression based on field and direction
 */
export function createSortingFunction<T extends Record<string, any>>(columnMap: T) {
  return (fieldName: keyof T, sortDirection: SortDirection) => {
    const column = columnMap[fieldName];
    return sortDirection === 'asc' ? asc(column) : desc(column);
  };
}

// Define filter operator types
type FilterOperator = 'eq' | 'like' | 'search';

// Define a filter field configuration
interface FilterFieldConfig<T, K extends keyof T> {
  operator: FilterOperator;
  field: T[K] | T[K][]; // Allow a single field or array of fields for search
}

// Define a filter field configuration
interface FilterFieldConfig<T, K extends keyof T> {
  operator: FilterOperator;
  field: T[K] | T[K][]; // Allow a single field or array of fields for search
}

// Create a type for filter configuration map
type FilterConfigMap<T, F> = {
  [K in keyof F]?: FilterFieldConfig<T, any>;
};

/**
 * Creates a filter builder based on configuration
 * @param table - The table schema
 * @param filterConfig - Configuration mapping filter fields to table fields with operators
 * @returns A function that builds filter conditions from filter values
 */
export function createFilterBuilder<TableType, FilterType>(
  filterConfig: FilterConfigMap<TableType, FilterType>
) {
  return (filters: Partial<FilterType>): SQL<unknown>[] => {
    const conditions: SQL<unknown>[] = [];

    // Process each filter value based on configuration
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined) return;
      const fieldKey = key as keyof FilterType;
      const config = filterConfig[fieldKey];
      if (!config) return;
      if (config.operator === 'eq') {
        // Ensure we're creating a SQL condition
        const condition = eq(config.field as any, value) as SQL<unknown>;
        conditions.push(condition);
      } else if (config.operator === 'like' && typeof value === 'string') {
        const condition = like(config.field as any, `%${value}%`) as SQL<unknown>;
        conditions.push(condition);
      } else if (config.operator === 'search' && typeof value === 'string') {
        const fields = Array.isArray(config.field) ? config.field : [config.field];
        if (fields.length > 0) {
          const searchConditions = fields.map(
            (field) => like(field as any, `%${value}%`) as SQL<unknown>
          );
          // Only add if we have conditions to combine
          if (searchConditions.length > 0) {
            const combinedCondition = or(...searchConditions) as SQL<unknown>;
            conditions.push(combinedCondition);
          }
        }
      }
    });

    return conditions;
  };
}
