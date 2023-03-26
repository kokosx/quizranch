import { TRPCError } from "@trpc/server";
import { compare, hash } from "bcrypt";
import { z } from "zod";
import { setSessionCookie } from "../../../apiUtils/cookies";
import { authenticatedProcedure, procedure, router } from "../../trpc";
import crypto from "crypto";
import { deleteCookie } from "cookies-next";
import omit from "object.omit";
import _hash from "../../utils/hash";
import { SESSION_ID_LENGTH } from "../../../constants";
import { loginSchema, registerSchema } from "./schemas";

export const authRouter = router({
  register: procedure.input(registerSchema).mutation(async ({ input, ctx }) => {
    //See if user with this email/username already exists:
    const emailAsLower = input.email.toLowerCase();
    const userQuery = await ctx.prismaClient.user.findFirst({
      where: {
        OR: [
          { email: { contains: emailAsLower, mode: "insensitive" } },
          { nickname: { contains: input.nickname, mode: "insensitive" } },
        ],
      },
    });

    if (userQuery) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Użytkownik z tą nazwą/mailem już istnieje",
      });
    }

    //Creating new user:

    const hashedPassword = await hash(input.password, 12);
    const sessionId = crypto.randomBytes(SESSION_ID_LENGTH).toString("hex");

    const hashedSessionId = _hash(sessionId);

    const user = await ctx.prismaClient.user.create({
      data: {
        email: emailAsLower,
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
  }),
  login: procedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const foundUser = await ctx.prismaClient.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (!foundUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nie ma takiego użytkownika",
      });
    }

    const isPasswordValid = await compare(input.password, foundUser.password);
    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Wrong password",
      });
    }
    const sessionId = crypto.randomBytes(SESSION_ID_LENGTH).toString("hex");

    const hashedSessionId = _hash(sessionId);

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
    //Delete cookie
    if (existingCookie) {
      const hashedSessionId = _hash(existingCookie);
      ctx.prismaClient.session
        .deleteMany({ where: { id: hashedSessionId } })
        .catch(() => null);
      deleteCookie("sessionId", { req: ctx.req, res: ctx.res });
    }

    return { message: "Success" };
  }),
  getCSRFToken: authenticatedProcedure.query(async ({ ctx }) => {
    const tokenId = crypto.randomBytes(250).toString("hex");

    const csrfToken = await ctx.prismaClient.csrfToken.upsert({
      create: {
        id: tokenId,
        sessionId: ctx.session.id,
      },
      update: {
        id: tokenId,
      },
      where: {
        sessionId: ctx.session.id,
      },
    });

    return csrfToken;
  }),
});
