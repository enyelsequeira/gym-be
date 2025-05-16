import db from '@/db';
import { createExerciseSchema, exercises } from '@/db/schema';
import { factory } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';
import { CustomValidator } from '@/middlewares/custom-validator';
import { isAdmin } from '@/middlewares/is-admin';
import { isUserAuthenticated } from '@/middlewares/is-user-authenticated';
import { resourceCreated } from '@/utils/create-json-response';
import dayjs from 'dayjs';
import { z } from 'zod';

// Create a modified schema for bulk exercise creation where videoUrl and createdById are optional
const bulkExerciseSchema = createExerciseSchema.extend({
  videoUrl: z.string().optional(),
  createdById: z.number().optional(),
});

// Create a schema for bulk exercise creation
const bulkCreateExercisesSchema = z.object({
  exercises: z.array(bulkExerciseSchema),
  adminId: z.number(), // Add adminId to use as default createdById
});

export const CreateExercise = factory.createHandlers(
  CustomValidator('json', createExerciseSchema, '/exercise'),
  isUserAuthenticated,
  isAdmin,
  async (c) => {
    const exerciseData = c.req.valid('json');

    try {
      const [insertedExercise] = await db
        .insert(exercises)
        .values({
          name: exerciseData.name,
          description: exerciseData.description,
          muscleGroup: exerciseData.muscleGroup,
          equipment: exerciseData.equipment,
          instructions: exerciseData.instructions,
          videoUrl: exerciseData.videoUrl || 'https://example.com/placeholder-video',
          isCustom: exerciseData.isCustom ?? false,
          createdById: exerciseData.createdById,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        })
        .returning();

      return resourceCreated({
        c,
        data: insertedExercise,
        message: 'Exercise created successfully',
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

// Handler for bulk exercise creation
export const BulkCreateExercises = factory.createHandlers(
  CustomValidator('json', bulkCreateExercisesSchema, '/exercises/bulk'),
  isUserAuthenticated,
  isAdmin,
  async (c) => {
    const data = c.req.valid('json');
    const exercisesData = data.exercises;
    const adminId = data.adminId; // Get the admin ID to use as default creator

    try {
      // Start a transaction to ensure all exercises are created or none
      const result = await db.transaction(async (tx) => {
        const insertedExercises = [];

        for (const exerciseData of exercisesData) {
          const [insertedExercise] = await tx
            .insert(exercises)
            .values({
              name: exerciseData.name,
              description: exerciseData.description,
              muscleGroup: exerciseData.muscleGroup,
              equipment: exerciseData.equipment || null,
              instructions: exerciseData.instructions || null,
              videoUrl: exerciseData.videoUrl || 'https://example.com/placeholder-video',
              isCustom: exerciseData.isCustom ?? false,
              createdById: exerciseData.createdById || adminId,
              createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            .returning();

          insertedExercises.push(insertedExercise);
        }

        return insertedExercises;
      });

      return resourceCreated({
        c,
        data: result,
        message: `${result.length} exercises created successfully`,
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

// Handler to get all exercises
export const GetExercises = factory.createHandlers(isUserAuthenticated, async (c) => {
  try {
    const allExercises = await db.query.exercises.findMany();

    return c.json({
      success: true,
      data: allExercises,
      message: 'Exercises retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw Errors.InternalServer();
  }
});
