import { factory } from '@/lib/create-app';
import { createUserHandler } from '@/routes/user/create-user/create-user';
import { getUserById } from '@/routes/user/get-user-by-id/get-user-by-id';
import { getUsersHandler } from '@/routes/user/gets-all-user/gets-all-user';
import { GetMe } from '@/routes/user/me/get-me';

const userRouter = factory
  .createApp()
  .get('/users', ...getUsersHandler)
  .get('/users/me', ...GetMe)
  .post('/user', ...createUserHandler)
  .get('/user/:id', ...getUserById);

export default userRouter;
