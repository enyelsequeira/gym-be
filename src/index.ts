import { factory } from '@/lib/create-app';
import authenticationRouter from '@/routes/authentication';
import userRouter from '@/routes/user';
import workoutsRouter from '@/routes/workouts';
import { serve } from '@hono/node-server';

const app = factory.createApp();
const routes = [userRouter, workoutsRouter, authenticationRouter] as const;

routes.forEach((route) => {
  app.route('/', route);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
