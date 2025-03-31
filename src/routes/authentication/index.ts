import { factory } from '@/lib/create-app';
import { login } from '@/routes/authentication/login/login';
import { logout } from '@/routes/authentication/logout/logout';

const authenticationRouter = factory
  .createApp()
  .post('/login', ...login)
  .post('/logout/:id', ...logout);
export default authenticationRouter;
