import type { inferRouterOutputs } from "@trpc/server";
import { router } from "../trpc";
import { authRouter } from "./auth/auth.router";
import { errorReportRouter } from "./error_report/error_report.router";
import { favoriteRouter } from "./favorite/favorite.router";
import { kitsRouter } from "./kits/kits.router";
import { loaderRouter } from "./loaders/loaders.router";
import { notesRouter } from "./notes/notes.router";
import { progressRouter } from "./progress/progress.router";
import { usersRouter } from "./user/user.router";

export const appRouter = router({
  auth: authRouter,
  kit: kitsRouter,
  user: usersRouter,
  note: notesRouter,
  favorite: favoriteRouter,
  progress: progressRouter,
  loaders: loaderRouter,
  errorReport: errorReportRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
