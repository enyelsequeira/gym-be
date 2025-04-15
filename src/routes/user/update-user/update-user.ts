import db from "@/db";
import { users } from "@/db/schema";
import { factory } from "@/lib/create-app";
import { ApiError, Errors } from "@/lib/error-handling";
import { CustomValidator } from "@/middlewares/custom-validator";
import { isUserAuthenticated } from "@/middlewares/is-user-authenticated";
import {
  hashPassword,
  verifyPassword,
} from "@/routes/user/utils/hash-password";
import { resourceUpdated } from "@/utils/create-json-response";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const updateUserPassword = factory.createHandlers(
  CustomValidator(
    "json",
    z.object({
      username: z.string().min(1),
      password: z.string().min(3).max(50),
      newPassword: z.string().min(3).max(50),
    }),
    "/update-password"
  ),
  isUserAuthenticated,
  async (c) => {
    try {
      const contextUser = c.get("user");
      const { password, newPassword, username } = c.req.valid("json");
      if (!contextUser) {
        throw Errors.BadRequest({
          message: "Sorry something went wrong",
        });
      }
      if (contextUser?.username !== username) {
        throw Errors.Unauthorized({
          message: "Sorry you cannot change someone else password",
        });
      }
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, contextUser.id),
      });

      if (!user) {
        throw Errors.NotFound({
          message: "User Not found",
        });
      }
      const isCurrentPasswordValid = verifyPassword(user.password, password);
      if (!isCurrentPasswordValid) {
        throw Errors.BadRequest({
          message: "Username or password wrong",
        });
      }
      const hashNewPassword = hashPassword(newPassword);
      const newUser = await db
        .update(users)
        .set({
          password: hashNewPassword,
          firstLogin: false,
          updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(users.username, username))
        .returning();

      const { password: _, ...userWithoutPassword } = newUser[0];

      return resourceUpdated({
        c,
        message: "Password has been updated",
        data: userWithoutPassword,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.log("----Updating user---", error);
        throw error;
      }

      console.error("Unexpected error:", error);
      throw Errors.InternalServer();
    }
  }
);
