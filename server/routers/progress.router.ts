import { z } from "zod";
import { authenticatedProcedure, router } from "../trpc";

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
    return "gwgds";
  });

const updateProgress = authenticatedProcedure
  .input(z.object({ kitId: z.string(), learnt: z.string().array() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prismaClient.progress.updateMany({
      data: { learnt: input.learnt },
      where: { kitId: input.kitId, userId: ctx.session.userId },
    });
    return { message: "success" };
  });

const resetProgress = authenticatedProcedure
  .input(z.object({ kitId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prismaClient.progress.deleteMany({
      where: { kitId: input.kitId, userId: ctx.session.userId },
    });
    return { message: "success" };
  });

export const progressRouter = router({
  resetProgress,
  updateProgress,
  addProgress,
});
