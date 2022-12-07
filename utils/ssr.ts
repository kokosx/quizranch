import { Session, User } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import { isUserLoggedIn } from "../services/auth.service";

export type withPageAuthSession = Session & { user: User };

export const withPageAuth = (fn: any): any => {
  return async (ctx: GetServerSidePropsContext) => {
    const sessionId = getCookie("sessionId", { req: ctx.req, res: ctx.res });
    if (!sessionId) {
      return fn(ctx, null);
    }
    //@ts-expect-error
    const logged = await isUserLoggedIn(sessionId);
    return fn(ctx, logged);
  };
};
