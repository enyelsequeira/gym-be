import { factory } from '@/lib/create-app';
import { createUserHandler } from '@/routes/user/create-user/create-user';
import { getUsersHandler } from '@/routes/user/gets-all-user/gets-all-user';
import { GetMe } from '@/routes/user/me/get-me';

const userRouter = factory
  .createApp()
  .get('/users', ...getUsersHandler)
  .get('/users/me', ...GetMe)
  .post('/user', ...createUserHandler);

export default userRouter;
