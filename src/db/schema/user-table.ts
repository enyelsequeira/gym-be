import dayjs from 'dayjs';
import { int, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const GenderType = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export const ActivityLevel = {
  SEDENTARY: 'SEDENTARY',
  LIGHT: 'LIGHT',
  MODERATE: 'MODERATE',
  VERY_ACTIVE: 'VERY_ACTIVE',
  EXTREME: 'EXTREME',
} as const;
export const usersTable = sqliteTable('users_table', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
  time: text().$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
});
export const UserType = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  password: text('password').notNull(),
  type: text('type', { enum: ['ADMIN', 'USER'] })
    .notNull()
    .default('USER'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
  email: text('email').notNull().unique(),
  height: real('height'),
  weight: real('weight'),
  targetWeight: real('target_weight'),
  country: text('country'),
  city: text('city'),
  phone: text('phone'),
  occupation: text('occupation'),
  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),
  gender: text('gender', { enum: ['MALE', 'FEMALE', 'OTHER'] }),
  activityLevel: text('activity_level', {
    enum: ['SEDENTARY', 'LIGHT', 'MODERATE', 'VERY_ACTIVE', 'EXTREME'],
  }),
  firstLogin: integer('first_login', { mode: 'boolean' }).notNull().default(true),
});

export const createUserSchema = createSelectSchema(users, {
  username: (schema) => schema.min(3).max(50),
  name: (schema) => schema.min(1).max(100),
  lastName: (schema) => schema.min(1).max(100),
  password: (schema) => schema.min(8),
  type: (_) => z.enum([UserType.ADMIN, UserType.USER]),
  firstLogin: (_) => z.boolean().default(true),
  dateOfBirth: z
    .string()
    .transform((str) => (str ? new Date(str) : null))
    .optional()
    .nullable(),
})
  .required({
    username: true,
    name: true,
    lastName: true,
    password: true,
    type: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    height: true,
    weight: true,
    targetWeight: true,
    country: true,
    city: true,
    phone: true,
    occupation: true,
    gender: true,
    activityLevel: true,
  });
type User = z.infer<typeof createUserSchema>;
