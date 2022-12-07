import { prismaClient } from "../prisma";
import { router } from "../trpc";
import { authRouter } from "./auth";
import { kitsRouter } from "./kits";
export const appRouter = router({
  auth: authRouter,
  notes: kitsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
