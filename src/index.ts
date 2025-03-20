import CreateApp from '@/lib/create-app';
import userRouter from '@/routes/user';
import { serve } from '@hono/node-server';

const app = CreateApp();
const routes = [userRouter] as const;

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
