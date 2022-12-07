import { TRPCError } from "@trpc/server";
import { compare, hash } from "bcrypt";
import { createHmac } from "crypto";
import { z } from "zod";
import { setSessionCookie } from "../../apiUtils/cookies";
import { authorizedProcedure, procedure, router } from "../trpc";
import crypto from "crypto";
import { deleteCookie } from "cookies-next";
import omit from "object.omit";
import { generateCSRFToken } from "../../services/auth.service";

export const authRouter = router({
  register: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(5),
        nickname: z.string().min(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await hash(input.password, 12);
      const sessionId = crypto.randomBytes(72).toString("hex");

      const hashedSessionId = createHmac(
        "SHA512",
        //@ts-expect-error
        process.env.SESSION_SECRET
      )
        .update(sessionId)
        .digest("hex");
      try {
        const user = await ctx.prismaClient.user.create({
          data: {
            email: input.email,
            nickname: input.nickname,
            password: hashedPassword,
          },
        });

        await ctx.prismaClient.session.create({
          data: {
            id: hashedSessionId,
            userId: user.id,
          },
        });
        setSessionCookie(sessionId, {
          req: ctx.req,
          res: ctx.res,
        });
        return { user: omit(user, "password") };
      } catch (error) {
        throw new TRPCError({
          message: "User with this email already exists",
          code: "CONFLICT",
        });
      }
    }),
  login: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const foundUser = await ctx.prismaClient.user.findUnique({
        where: { email: input.email },
      });
      if (!foundUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const isPasswordValid = await compare(input.password, foundUser.password);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Wrong password",
        });
      }
      const sessionId = crypto.randomBytes(72).toString("hex");

      const hashedSessionId = createHmac(
        "SHA512",
        //@ts-expect-error
        process.env.SESSION_SECRET
      )
        .update(sessionId)
        .digest("hex");
      await ctx.prismaClient.session.create({
        data: {
          id: hashedSessionId,
          userId: foundUser.id,
        },
      });
      setSessionCookie(sessionId, {
        req: ctx.req,
        res: ctx.res,
      });
      return { user: omit(foundUser, "password") };
    }),
  logout: procedure.mutation(async ({ ctx }) => {
    const existingCookie = ctx.req.cookies["sessionId"];
    if (!existingCookie) {
      throw new TRPCError({
        message: "Already logged out",
        code: "FORBIDDEN",
      });
    }
    //Delete cookie

    const hashedCookie = createHmac(
      "SHA512",
      //@ts-expect-error
      process.env.SESSION_SECRET
    )
      .update(existingCookie)
      .digest("hex");
    ctx.prismaClient.session
      .delete({ where: { id: hashedCookie } })
      .catch(() => null);
    deleteCookie("sessionId", { req: ctx.req, res: ctx.res });
    return { message: "Success" };
  }),
});
