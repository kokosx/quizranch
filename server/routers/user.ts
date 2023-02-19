import { Kit, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import omit from "object.omit";
import { z } from "zod";
import { KitData } from "../../types";
import { procedure, router } from "../trpc";
import { authorizedProcedure } from "../trpc";

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

      type TypeWithJSON = typeof user & {
        kits: Kit &
          {
            data: KitData[];
          }[];
      };

      return omit(user as TypeWithJSON, ["email", "password"]);
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
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return user;
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
