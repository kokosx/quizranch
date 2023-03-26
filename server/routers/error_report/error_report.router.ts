import { TRPCError } from "@trpc/server";
import { authenticatedProcedure, router } from "../../trpc";
import { addReportSchema } from "./schemas";

const addReport = authenticatedProcedure
  .input(addReportSchema)
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
