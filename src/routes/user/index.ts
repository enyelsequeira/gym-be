import { getUsersControllerDemo } from '@/controllers/user/create-user';
import { CreateRouter } from '@/lib/create-app';
import { CustomValidator } from '@/middlewares/custom-validator';
import { z } from 'zod';

const userRouter = CreateRouter();
const schema = z.object({
  name: z.string(),
  age: z.number(),
});

userRouter.get('/user', CustomValidator('json', schema, '/demo'), getUsersControllerDemo);

export default userRouter;

//
// app.get('/', (c) => {
//   console.log({ env });
//   return c.text('Hello Hono!');
// });
// //
// const schema = z.object({
//   name: z.string(),
//   age: z.number(),
// });
//
// app.post('/demo', OwnRateLimiter, CustomValidator('json', schema, '/demo'), (c) => {
//   const data = c.req.valid('json');
//   console.log({ data });
//
//   return CreateJsonResponse<{ id: number; name: string; email: string }>({
//     c,
//     success: true,
//     data: {
//       email: 'emo',
//       id: 1,
//       name: 'emo',
//     },
//   });
// });
