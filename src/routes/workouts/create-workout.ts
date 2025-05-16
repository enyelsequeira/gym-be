import db from '@/db';
import {
  createWorkoutDaySchema,
  createWorkoutPlanSchema,
  workoutDays,
  workoutExercises,
  workoutPlans,
} from '@/db/schema';
import { factory } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';
import { CustomValidator } from '@/middlewares/custom-validator';
import { isAdmin } from '@/middlewares/is-admin';
import { isUserAuthenticated } from '@/middlewares/is-user-authenticated';
import { resourceCreated } from '@/utils/create-json-response';
import dayjs from 'dayjs';
import { z } from 'zod';

// Create a schema for the whole workout creation payload
const createWorkoutExerciseSchema = z.object({
  exerciseId: z.number(),
  orderIndex: z.number().min(0),
  sets: z.number().min(1).default(3),
  reps: z.number().optional(),
  weight: z.number().optional(),
  duration: z.number().optional(), // in seconds
  notes: z.string().optional(),
});

// Schema for day with exercises - OMIT workoutPlanId since it's set internally
const workoutDayWithExercisesSchema = createWorkoutDaySchema
  .omit({ workoutPlanId: true }) // Remove workoutPlanId from validation requirements
  .extend({
    exercises: z.array(createWorkoutExerciseSchema).optional(),
  });

// Complete schema for workout creation
const completeWorkoutPlanSchema = createWorkoutPlanSchema.extend({
  workoutDays: z.array(workoutDayWithExercisesSchema).optional(),
});

export const CreateWorkout = factory.createHandlers(
  CustomValidator('json', completeWorkoutPlanSchema, '/workout'),
  isUserAuthenticated,
  isAdmin,
  async (c) => {
    const workoutData = c.req.valid('json');

    try {
      // First, verify that all the referenced exercise IDs exist
      const exerciseIds = new Set();

      if (workoutData.workoutDays) {
        for (const day of workoutData.workoutDays) {
          if (day.exercises) {
            for (const exercise of day.exercises) {
              exerciseIds.add(exercise.exerciseId);
            }
          }
        }
      }

      // If we have exercise IDs to check
      if (exerciseIds.size > 0) {
        const idsArray = Array.from(exerciseIds);

        // Check if all exercise IDs exist in the database
        const existingExercises = await db.query.exercises.findMany({
          where: (exercises, { inArray }) => inArray(exercises.id, idsArray),
          columns: { id: true },
        });

        // Get the IDs of existing exercises
        const existingIds = new Set(existingExercises.map((ex) => ex.id));

        // Find IDs that don't exist
        const nonExistentIds = [...exerciseIds].filter((id) => !existingIds.has(id));

        if (nonExistentIds.length > 0) {
          throw Errors.NotFound({
            message: `The following exercise IDs don't exist: ${nonExistentIds.join(', ')}`,
            errorCode: 'exercise_not_found',
          });
        }
      }

      // Also verify that the user exists
      const userExists = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, workoutData.userId),
        columns: { id: true },
      });

      if (!userExists) {
        throw Errors.NotFound({
          message: `User with ID ${workoutData.userId} doesn't exist`,
          errorCode: 'user_not_found',
        });
      }

      // Start a transaction to ensure all related records are created or none
      const result = await db.transaction(async (tx) => {
        // Insert the workout plan first
        const [insertedWorkoutPlan] = await tx
          .insert(workoutPlans)
          .values({
            userId: workoutData.userId,
            name: workoutData.name,
            description: workoutData.description,
            difficulty: workoutData.difficulty,
            goal: workoutData.goal || 'GENERAL',
            isActive: workoutData.isActive ?? true,
            createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          })
          .returning();

        // If workout days are provided, create them
        if (workoutData.workoutDays && workoutData.workoutDays.length > 0) {
          for (const dayData of workoutData.workoutDays) {
            // Insert workout day
            const [insertedDay] = await tx
              .insert(workoutDays)
              .values({
                workoutPlanId: insertedWorkoutPlan.id, // Set workoutPlanId from the created plan
                dayNumber: dayData.dayNumber,
                name: dayData.name,
                notes: dayData.notes,
                createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              })
              .returning();

            // If exercises for this day are provided, create them
            if (dayData.exercises && dayData.exercises.length > 0) {
              const exercisesWithDayId = dayData.exercises.map((exercise) => ({
                workoutDayId: insertedDay.id,
                exerciseId: exercise.exerciseId,
                orderIndex: exercise.orderIndex,
                sets: exercise.sets || 3,
                reps: exercise.reps,
                weight: exercise.weight,
                duration: exercise.duration,
                notes: exercise.notes,
                createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              }));

              await tx.insert(workoutExercises).values(exercisesWithDayId);
            }
          }
        }

        // Query the complete workout plan with its days and exercises
        const completeWorkout = await tx.query.workoutPlans.findFirst({
          where: (workoutPlans, { eq }) => eq(workoutPlans.id, insertedWorkoutPlan.id),
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

        return completeWorkout;
      });

      return resourceCreated({
        c,
        data: result,
        message: 'Workout plan created successfully',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('----error---', error);
        throw error;
      }

      console.error('Unexpected error:', error);
      throw Errors.InternalServer();
    }
  }
);
