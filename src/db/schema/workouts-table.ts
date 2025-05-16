import { users } from '@/db/schema/user-table';
import dayjs from 'dayjs';
import { type InferSelectModel, relations } from 'drizzle-orm';
// Workout Plans
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const workoutPlans = sqliteTable('workout_plans', {
  id: integer('id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  userId: integer('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  difficulty: text('difficulty', { enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] }),
  goal: text('goal', { enum: ['STRENGTH', 'HYPERTROPHY', 'ENDURANCE', 'WEIGHT_LOSS', 'GENERAL'] })
    .notNull()
    .default('GENERAL'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
});

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutPlans.userId],
    references: [users.id],
  }),
  workoutDays: many(workoutDays),
}));

export const workoutDays = sqliteTable('workout_days', {
  id: integer('id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  workoutPlanId: integer('workout_plan_id', { mode: 'number' })
    .notNull()
    .references(() => workoutPlans.id, { onDelete: 'cascade' }),
  dayNumber: integer('day_number', { mode: 'number' }).notNull(), // 1-7 representing days of the week
  name: text('name').notNull(), // e.g., "Push Day", "Leg Day", "Rest Day"
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
});

// Relations for Workout Days

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
  workoutPlan: one(workoutPlans, {
    fields: [workoutDays.workoutPlanId],
    references: [workoutPlans.id],
  }),
  exercises: many(workoutExercises),
}));

// Exercise Library
export const exercises = sqliteTable('exercises', {
  id: integer('id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  name: text('name').notNull(),
  description: text('description'),
  muscleGroup: text('muscle_group', {
    enum: ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'FULL_BODY', 'CARDIO'],
  }).notNull(),
  equipment: text('equipment'),
  instructions: text('instructions'),
  videoUrl: text('video_url'),
  isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
  createdById: integer('created_by_id', { mode: 'number' }).references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
});

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [exercises.createdById],
    references: [users.id],
  }),
  workoutExercises: many(workoutExercises),
}));

// Workout Exercises (exercises in a workout day)
export const workoutExercises = sqliteTable('workout_exercises', {
  id: integer('id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  workoutDayId: integer('workout_day_id', { mode: 'number' })
    .notNull()
    .references(() => workoutDays.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id', { mode: 'number' })
    .notNull()
    .references(() => exercises.id),
  orderIndex: integer('order_index', { mode: 'number' }).notNull(),
  sets: integer('sets', { mode: 'number' }).notNull().default(3),
  reps: integer('reps', { mode: 'number' }),
  weight: real('weight'),
  duration: integer('duration', { mode: 'number' }), // in seconds, for time-based exercises
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
});

// Relations for Workout Exercises
export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workoutDay: one(workoutDays, {
    fields: [workoutExercises.workoutDayId],
    references: [workoutDays.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
  logs: many(exerciseLogs),
}));

// Exercise Logs (track exercise performance history)
export const exerciseLogs = sqliteTable('exercise_logs', {
  id: integer('id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  userId: integer('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  workoutExerciseId: integer('workout_exercise_id', { mode: 'number' })
    .notNull()
    .references(() => workoutExercises.id, { onDelete: 'cascade' }),
  date: text('date')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD')),
  sets: integer('sets', { mode: 'number' }).notNull(),
  reps: integer('reps', { mode: 'number' }),
  weight: real('weight'),
  duration: integer('duration', { mode: 'number' }), // in seconds
  feelingRating: integer('feeling_rating', { mode: 'number' }), // 1-5 scale
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
});

// Relations for Exercise Logs
export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({
  user: one(users, {
    fields: [exerciseLogs.userId],
    references: [users.id],
  }),
  workoutExercise: one(workoutExercises, {
    fields: [exerciseLogs.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// Workout Sessions (tracks when a user performs a workout)
export const workoutSessions = sqliteTable('workout_sessions', {
  id: integer('id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  userId: integer('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id),
  workoutPlanId: integer('workout_plan_id', { mode: 'number' })
    .notNull()
    .references(() => workoutPlans.id),
  workoutDayId: integer('workout_day_id', { mode: 'number' })
    .notNull()
    .references(() => workoutDays.id),
  date: text('date')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD')),
  startTime: text('start_time')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
  endTime: text('end_time'),
  duration: integer('duration', { mode: 'number' }), // in minutes
  caloriesBurned: integer('calories_burned', { mode: 'number' }),
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
});

// Relations for Workout Sessions
export const workoutSessionsRelations = relations(workoutSessions, ({ one }) => ({
  user: one(users, {
    fields: [workoutSessions.userId],
    references: [users.id],
  }),
  workoutPlan: one(workoutPlans, {
    fields: [workoutSessions.workoutPlanId],
    references: [workoutPlans.id],
  }),
  workoutDay: one(workoutDays, {
    fields: [workoutSessions.workoutDayId],
    references: [workoutDays.id],
  }),
}));

// Create Zod schemas for validation
export const createWorkoutPlanSchema = createSelectSchema(workoutPlans, {
  name: (schema) => schema.min(1).max(100),
  difficulty: (_) => z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  goal: (_) =>
    z.enum(['STRENGTH', 'HYPERTROPHY', 'ENDURANCE', 'WEIGHT_LOSS', 'GENERAL']).default('GENERAL'),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createWorkoutDaySchema = createSelectSchema(workoutDays, {
  name: (schema) => schema.min(1).max(100),
  dayNumber: (schema) => schema.min(1).max(7),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createExerciseSchema = createSelectSchema(exercises, {
  name: (schema) => schema.min(1).max(100),
  muscleGroup: (_) =>
    z.enum(['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'FULL_BODY', 'CARDIO']),
}).omit({
  id: true,
  createdAt: true,

  updatedAt: true,
});

export const createExerciseLogSchema = createSelectSchema(exerciseLogs, {
  sets: (schema) => schema.min(1),
}).omit({
  id: true,
  createdAt: true,
});

// Type definitions for TypeScript
export type WorkoutPlan = InferSelectModel<typeof workoutPlans>;
export type WorkoutDay = InferSelectModel<typeof workoutDays>;
export type Exercise = InferSelectModel<typeof exercises>;
export type WorkoutExercise = InferSelectModel<typeof workoutExercises>;
export type ExerciseLog = InferSelectModel<typeof exerciseLogs>;
export type WorkoutSession = InferSelectModel<typeof workoutSessions>;
