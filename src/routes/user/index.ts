import { factory } from '@/lib/create-app';
import { createUserHandler } from '@/routes/user/create-user/create-user';
import { getUsersHandler } from '@/routes/user/gets-all-user/gets-all-user';

const userRouter = factory
  .createApp()
  .get('/users', ...getUsersHandler)
  .post('/user', ...createUserHandler);

export default userRouter;
