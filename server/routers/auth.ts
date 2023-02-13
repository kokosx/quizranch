import { TRPCError } from "@trpc/server";
import { compare, hash } from "bcrypt";
import { z } from "zod";
import { setSessionCookie } from "../../apiUtils/cookies";
import { procedure, router } from "../trpc";
import crypto from "crypto";
import { deleteCookie } from "cookies-next";
import omit from "object.omit";
import _hash from "./../utils/hash";
import { SESSION_ID_LENGTH } from "../../constants";

export const authRouter = router({
  register: procedure
    .input(
      z.object({
        email: z.string().email("INVALID_EMAIL"),
        password: z.string().min(5),
        nickname: z.string().min(3).max(15),
      })
    )
    .mutation(async ({ input, ctx }) => {
      //See if user with this email/username already exists:

      const userQuery = await ctx.prismaClient.user.findMany({
        where: {
          OR: [
            { email: { contains: input.email, mode: "insensitive" } },
            { nickname: { contains: input.nickname, mode: "insensitive" } },
          ],
        },
      });

      let userExists = false;

      //Check if nickname already exists:
      for (let v of userQuery) {
        const areTheSame = v.nickname.localeCompare(input.nickname, undefined, {
          sensitivity: "base",
        });
        if (!areTheSame) {
          userExists = true;
          break;
        }
      }
      if (userExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Użytkownik z tą nazwą już istnieje",
        });
      }

      //Check if email already exists:
      for (let v of userQuery) {
        const areTheSame = v.email.localeCompare(input.email, undefined, {
          sensitivity: "base",
        });
        if (!areTheSame) {
          userExists = true;
          break;
        }
      }
      if (userExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Użytkownik z tym mailem już istnieje",
        });
      }
      //Creating new user:

      const hashedPassword = await hash(input.password, 12);
      const sessionId = crypto.randomBytes(SESSION_ID_LENGTH).toString("hex");

      const hashedSessionId = _hash(sessionId);

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
    if (!existingCookie) {
      throw new TRPCError({
        message: "Already logged out",
        code: "FORBIDDEN",
      });
    }
    //Delete cookie

    const hashedSessionId = _hash(existingCookie);
    ctx.prismaClient.session
      .delete({ where: { id: hashedSessionId } })
      .catch(() => null);
    deleteCookie("sessionId", { req: ctx.req, res: ctx.res });
    return { message: "Success" };
  }),
});
