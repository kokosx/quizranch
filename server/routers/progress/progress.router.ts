import { z } from "zod";
import { authenticatedProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";

const upsertProgress = authenticatedProcedure
  .input(z.object({ kitId: z.string(), learnt: z.string().array() }))
  .mutation(async ({ ctx, input }) => {
    try {
      await ctx.prismaClient.progress.upsert({
        create: {
          kitId: input.kitId,
          userId: ctx.session.userId,
          learnt: input.learnt,
        },
        update: {
          learnt: input.learnt,
        },
        where: {
          kitId_userId: { kitId: input.kitId, userId: ctx.session.userId },
        },
      });
    } catch (error) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
  });

const addProgress = authenticatedProcedure
  .input(z.object({ kitId: z.string(), learnt: z.string().array() }))
  .mutation(async ({ ctx, input }) => {
    //TODO: Add try catch
    await ctx.prismaClient.progress.create({
      data: {
        kitId: input.kitId,
        userId: ctx.session.userId,
        learnt: input.learnt,
      },
    });
    return { message: "Success" };
  });

const updateProgress = authenticatedProcedure
  .input(z.object({ kitId: z.string(), learnt: z.string().array() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prismaClient.progress.updateMany({
      data: { learnt: input.learnt },
      where: { kitId: input.kitId, userId: ctx.session.userId },
    });
    return { message: "Success" };
  });

const resetProgress = authenticatedProcedure
  .input(z.object({ kitId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prismaClient.progress.deleteMany({
      where: { kitId: input.kitId, userId: ctx.session.userId },
    });
    return { message: "success" };
  });

const getProgress = authenticatedProcedure
  .input(z.object({ kitId: z.string() }))
  .query(async ({ ctx, input }) => {
    const progress = await ctx.prismaClient.progress.findUnique({
      where: {
        kitId_userId: { kitId: input.kitId, userId: ctx.session.userId },
      },
    });
    return progress;
  });

export const progressRouter = router({
  resetProgress,
  updateProgress,
  addProgress,
  getProgress,
  upsertProgress,
});
