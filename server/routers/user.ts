import { TRPCError } from "@trpc/server";
import omit from "object.omit";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const usersRouter = router({
  //TODO: Check if this works!
  getUserWithKits: procedure
    .input(z.object({ nickname: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prismaClient.user.findUnique({
        where: { nickname: input.nickname },

        include: { kits: { orderBy: { createdAt: "desc" } } },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return omit(user, ["email", "password"]);
    }),
  searchForUser: procedure
    .input(z.object({ nickname: z.string(), skip: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.prismaClient.user.findMany({
        where: { nickname: { contains: input.nickname, mode: "insensitive" } },
        select: { nickname: true, avatarSeed: true },
        take: 10,
        skip: input.skip,
      });
      return users;
    }),
  getUser: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prismaClient.user.findUnique({
        where: { id: input.id },
        select: {},
      });
      return user;
    }),
});
