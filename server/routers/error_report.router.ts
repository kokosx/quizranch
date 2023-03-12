import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authenticatedProcedure, router } from "../trpc";

const addReport = authenticatedProcedure
  .input(
    z.object({
      description: z.string().max(1000),
      title: z.string().min(5).max(200),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      await ctx.prismaClient.errorReport.create({
        data: { description: input.description, createdBy: ctx.session.userId },
      });
      return { message: "Success" };
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  });

export const errorReportRouter = router({ addReport });
