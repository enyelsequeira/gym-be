import db from '@/db';
import { users, workoutPlans } from '@/db/schema';
import { HTTP } from '@/error-code-and-message';
import { factory } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';
import { CustomValidator } from '@/middlewares/custom-validator';
import { isAdmin } from '@/middlewares/is-admin';
import { isUserAuthenticated } from '@/middlewares/is-user-authenticated';
import { createJsonResponse } from '@/utils/create-json-response';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const getUserById = factory.createHandlers(
  CustomValidator('param', z.object({ id: z.string() }), '/user/:id'),
  isUserAuthenticated,
  isAdmin,
  async (c) => {
    try {
      const query = c.req.valid('param');
      const targetId = Number(query.id);

      // First, get the user
      const user = await db.query.users.findFirst({
        where: eq(users.id, targetId),
      });

      if (!user) {
        throw Errors.NotFound({ message: 'User not found' });
      }

      // Get the user's workout plans with related data
      const userWorkoutPlans = await db.query.workoutPlans.findMany({
        where: eq(workoutPlans.userId, targetId),
        with: {
          workoutDays: {
            with: {
              exercises: {
                with: {
                  exercise: true,
                },
              },
            },
          },
        },
      });

      // Remove password from user data
      const { password: _, ...userWithoutPassword } = user;

      // Structure the response with user data and workout plans
      const userData = {
        ...userWithoutPassword,
        workoutPlans: userWorkoutPlans,
      };

      return createJsonResponse({
        c,
        data: userData,
        message: HTTP.Phrases.OK,
        statusCode: HTTP.Codes.OK,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('----FETCHING SPECIFIC---', error);
        throw error;
      }

      console.error('Unexpected error:', error);
      throw Errors.InternalServer();
    }
  }
);
