import dayjs from 'dayjs';
import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';

export const usersTable = sqliteTable('users_table', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
  time: text().$defaultFn(() => dayjs().format('YYYY-MM-DD HH:mm:ss')),
});

export const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
});

const userSelectSchema = createSelectSchema(users);
type User = z.infer<typeof userSelectSchema>;
