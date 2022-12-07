import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";
import { isUserLoggedIn } from "../services/auth.service";
import { createHmac } from "crypto";
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({ transformer: superjson });
// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
/*
const isLoggedIn = t.middleware(async ({ ctx, next }) => {
  if (!ctx.req.cookies["sessionId"]) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  const session = await isUserLoggedIn(ctx.req);
  if (!session) {
    console.log("no session");

    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});
*/

const isAuthedToMutate = t.middleware(async ({ ctx, next }) => {
  if (!ctx.req.headers["csrf-token"] || !ctx.req.cookies["sessionId"]) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  const session = await isUserLoggedIn(ctx.req);
  if (!session) {
    console.log("no session");

    throw new TRPCError({ code: "FORBIDDEN" });
  }
  const token = ctx.req.headers["csrf-token"] as unknown as string;

  /*const hashedCsrf = createHmac("SHA512", process.env.CSRF_SECRET)
    //@ts-expect-error
    .update(ctx.req.headers["csrf-token"])
    .digest("hex");*/
  console.log("token:", token);
  console.log("sessionid:", session.id);
  const { count } = await ctx.prismaClient.csrfToken.deleteMany({
    where: { id: token, sessionId: session.id },
  });
  if (count !== 1) {
    throw new TRPCError({ code: "FORBIDDEN", message: "NO-CSRF" });
  } else {
    return next({ ctx: { session } });
  }
});

export const authorizedProcedure = procedure.use(isAuthedToMutate);
