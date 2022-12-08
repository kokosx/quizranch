import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { authorizedProcedure, procedure, router } from "../trpc";

const kitSchema = z.object({
  name: z.string().min(3),
  description: z.string().default(""),

  data: z
    .object({
      question: z.string(),
      answer: z.string(),
    })
    .array()
    .min(2),
});

export const kitsRouter = router({
  addNote: authorizedProcedure
    .input(kitSchema)
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
  deleteKitById: authorizedProcedure
    .input(z.object({ kitId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.kits.filter((v) => v.id === input.kitId).length !== 1
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      try {
        await ctx.prismaClient.kit.delete({ where: { id: input.kitId } });
        return { message: "success" };
      } catch (error) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kit doesnt exist" });
      }
    }),
  editKitById: authorizedProcedure

    .input(kitSchema.extend({ kitId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      //Check if user user authorized to mutate:
      if (
        ctx.session.user.kits.filter((v) => v.id === input.kitId).length !== 1
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      try {
        await ctx.prismaClient.kit.update({
          where: { id: input.kitId },
          data: {
            data: input.data,
            name: input.name,
            description: input.description,
          },
        });
        return { message: "success" };
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
    }),
});

export type KitRouter = typeof kitsRouter;
