import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";
import { isUserLoggedIn } from "../services/auth.service";
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const auth = await isUserLoggedIn(ctx.req);
  const session = auth?.session;
  if (!session) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx: { session } });
});

type CSRFToken = string | undefined;

const isAuthedToMutate = isAuthenticated.unstable_pipe(
  async ({ ctx, next }) => {
    const token = ctx.req.headers["csrf-token"] as CSRFToken;
    if (!token) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const { count } = await ctx.prismaClient.csrfToken.deleteMany({
      where: { id: token, sessionId: ctx.session.id },
    });
    if (count !== 1) {
      throw new TRPCError({ code: "FORBIDDEN", message: "NO-CSRF" });
    }
    return next();
  }
);

//Procedure in which user has to be logged in
export const authenticatedProcedure = procedure.use(isAuthenticated);
//Procedure in which user has to be logged in and have valid csrf token
export const authorizedProcedure = authenticatedProcedure.use(isAuthedToMutate);
