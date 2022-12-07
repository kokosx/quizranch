import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { authorizedProcedure, procedure, router } from "../trpc";

export const kitsRouter = router({
  addNote: authorizedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().default(""),

        data: z
          .object({
            question: z.string(),
            answer: z.string(),
          })
          .array()
          .min(2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.kits.length >= 5) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Over 5 kits" });
      }
      try {
        const note = await ctx.prismaClient.kit.create({
          data: {
            name: input.name,
            description: input.description,
            createdBy: ctx.session.userId,
            data: input.data,
          },
        });
        return { note };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Couldnt add note",
        });
      }
    }),
  getUsersNotesByNewest: procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prismaClient.kit.findMany({
        where: { createdBy: input.userId },
        orderBy: { createdAt: "desc" },
      });
    }),
  getKitById: procedure
    .input(z.object({ kitId: z.string() }))
    .query(async ({ input, ctx }) => {
      const kit = await ctx.prismaClient.kit.findUnique({
        where: { id: input.kitId },
        include: { user: { select: { nickname: true } } },
      });

      if (!kit) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kit not found" });
      }

      return kit;
    }),
});

export type KitRouter = typeof kitsRouter;
