import db from '@/db';
import { users } from '@/db/schema';
import { factory } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';
import { CustomValidator } from '@/middlewares/custom-validator';
import { resourceList } from '@/utils/create-json-response';
import { createPaginatedQuerySchema } from '@/utils/pagination';
import { SortDirection, createFilterBuilder, createSortingFunction } from '@/utils/sort';
import { and, sql } from 'drizzle-orm';
import { z } from 'zod';

// Create a sortable fields enum schema directly from the column map
const userSortableFields = z
  .enum([
    'id',
    'username',
    'name',
    'lastName',
    'email',
    'createdAt',
    'updatedAt',
    'height',
    'weight',
    'targetWeight',
    'country',
    'city',
    'dateOfBirth',
  ])
  .default('id');

// Use Zod inference to get the type
type UserSortableField = z.infer<typeof userSortableFields>;

// Create sort function for users
const applyUserSorting = createSortingFunction({
  id: users.id,
  username: users.username,
  name: users.name,
  lastName: users.lastName,
  email: users.email,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
  height: users.height,
  weight: users.weight,
  targetWeight: users.targetWeight,
  country: users.country,
  city: users.city,
  dateOfBirth: users.dateOfBirth,
});

// Use the Drizzle schema to infer filter field types
// We'll create a filterFields schema that includes only the fields we want to filter on
const userFilterFields = z.object({
  search: z.string().optional(),
  type: z.enum(['ADMIN', 'USER']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'VERY_ACTIVE', 'EXTREME']).optional(),
  firstLogin: z.boolean().optional(),
});

// Infer the filter type from the schema
type UserFilters = z.infer<typeof userFilterFields>;

// Configure the filter mappings
const userFilterConfig = {
  search: {
    operator: 'search',
    field: [users.username, users.name, users.lastName, users.email],
  },
  type: {
    operator: 'eq',
    field: users.type,
  },
  gender: {
    operator: 'eq',
    field: users.gender,
  },
  activityLevel: {
    operator: 'eq',
    field: users.activityLevel,
  },
  firstLogin: {
    operator: 'eq',
    field: users.firstLogin,
  },
} as const;

// Create a filter builder for users
const buildUserFilters = createFilterBuilder<typeof users, UserFilters>(userFilterConfig);

// Create extended pagination schema with sorting and filtering
const usersPaginationSchema = createPaginatedQuerySchema({
  sortBy: userSortableFields,
  sortDirection: SortDirection,
  ...userFilterFields.shape,
});

export const getUsersHandler = factory.createHandlers(
  CustomValidator('query', usersPaginationSchema, '/users'),
  async (c) => {
    try {
      // Get validated query parameters

      const {
        page,
        limit,
        sortBy = 'id',
        sortDirection = 'asc',
        ...filterParams
      } = c.req.valid('query');

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build where conditions using the generic filter builder
      const whereConditions = buildUserFilters(filterParams);

      // Create the final WHERE condition
      const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Query total count for pagination
      const totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereCondition);

      const totalCount = totalCountResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Validate sortBy field
      const validSortField = userSortableFields.safeParse(sortBy).success
        ? (sortBy as UserSortableField)
        : ('id' as UserSortableField);

      // Apply sorting
      const sortColumn = applyUserSorting(validSortField, sortDirection);

      // Query users with pagination, sorting and filtering
      const usersResult = await db.query.users.findMany({
        limit,
        offset,
        orderBy: [sortColumn],
        where: whereCondition,
      });
      const sanitizedUsers = usersResult.map(({ password: _, ...user }) => user);

      return resourceList({
        c,
        data: sanitizedUsers,
        page: {
          size: limit,
          totalElements: totalCount,
          totalPages,
          number: page,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('----FETCHING USERS---', error);
        throw error;
      }

      console.error('Unexpected error:', error);
      throw Errors.InternalServer();
    }
  }
);
