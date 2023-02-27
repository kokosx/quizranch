import { inferRouterOutputs } from "@trpc/server";
import { router } from "../trpc";
import { authRouter } from "./auth.router";
import { kitsRouter } from "./kits.router";
import { usersRouter } from "./user.router";

export const appRouter = router({
  auth: authRouter,
  kit: kitsRouter,
  user: usersRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

type RouterOutput = inferRouterOutputs<AppRouter>;

export type AuthOutput = RouterOutput["auth"];
export type KitOutput = RouterOutput["kit"];
export type UserOutput = RouterOutput["user"];
