import db from '@/db';
import { createUserSchema, users } from '@/db/schema/user-table';
import { factory } from '@/lib/create-app';
import { ApiError, Errors } from '@/lib/error-handling';
import { CustomValidator } from '@/middlewares/custom-validator';
import { hashPassword } from '@/routes/user/utils/hash-password';
import { resourceCreated } from '@/utils/create-json-response';

export const createUserHandler = factory.createHandlers(
  CustomValidator('json', createUserSchema, '/user'),
  // Second parameter: the actual handler function
  async (c) => {
    const userData = c.req.valid('json');

    try {
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq, or }) =>
          or(eq(users.username, userData.username), eq(users.email, userData.email)),
      });

      if (existingUser) {
        throw Errors.Conflict({
          message: 'User already exists',
          errorCode: 'user_already_exists',
        });
      }

      const hashedPassword = hashPassword(userData.password);
      const result = await db.transaction(async (tx) => {
        const [insertedUser] = await tx
          .insert(users)
          .values({
            ...userData,
            password: hashedPassword,
          })
          .returning();
        return insertedUser;
      });

      const { password: _password, ...userWithoutPassword } = result;
      return resourceCreated({
        c,
        data: userWithoutPassword,
        message: 'User created successfully',
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
