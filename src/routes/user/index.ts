import { factory } from "@/lib/create-app";
import { createUserHandler } from "@/routes/user/create-user/create-user";
import { getUserById } from "@/routes/user/get-user-by-id/get-user-by-id";
import { getUsersHandler } from "@/routes/user/gets-all-user/gets-all-user";
import { GetMe } from "@/routes/user/me/get-me";
import { updateUserPassword } from "@/routes/user/update-user/update-user";

const userRouter = factory
  .createApp()
  .get("/users", ...getUsersHandler)
  .get("/users/me", ...GetMe)
  .post("/users", ...createUserHandler)
  .get("/users/:id", ...getUserById)
  .post("/users/update-password", ...updateUserPassword);

export default userRouter;
