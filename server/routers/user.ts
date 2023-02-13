import omit from "object.omit";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const usersRouter = router({
  getUserWithKits: procedure
    .input(z.object({ nickname: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prismaClient.user.findMany({
        where: { nickname: { mode: "insensitive", contains: input.nickname } },

        include: { kits: { orderBy: { createdAt: "desc" } } },
      });
      if (!user) {
        return null;
      }

      return omit(user[0], ["email", "password"]);
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
});
