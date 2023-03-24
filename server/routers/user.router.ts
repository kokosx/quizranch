import type { User } from "@prisma/client";
import { z } from "zod";
import { procedure, router } from "../trpc";
import { authorizedProcedure } from "../trpc";

export type UserWithoutPassword = Omit<User, "password">;

export const usersRouter = router({
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

  editUser: authorizedProcedure
    .input(
      z.object({
        description: z.string().min(5).optional(),
        avatarSeed: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prismaClient.user.update({
        where: { id: ctx.session.userId },
        data: { description: input.description, avatarSeed: input.avatarSeed },
      });
      return { avatarSeed: input.avatarSeed, description: input.description };
    }),
});
