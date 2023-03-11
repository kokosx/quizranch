import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authenticatedProcedure, router } from "../trpc";
import { kitBelongsToUser } from "./kits.router";
import { noteBelongsToUser } from "./notes.router";

const setFavoredKit = authenticatedProcedure
  .input(z.object({ kitId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    try {
      //Dont allow user to add if is the owner
      if (
        kitBelongsToUser({
          kitId: input.kitId,
          usersKits: ctx.session.user.kits,
        })
      ) {
        throw new TRPCError({ code: "CONFLICT" });
      }
      const existing = await ctx.prismaClient.favoriteKit.findMany({
        where: { kitId: input.kitId },
      });
      const existingVal = existing[0];

      if (existingVal) {
        await ctx.prismaClient.favoriteKit.deleteMany({
          where: { kitId: input.kitId, userId: ctx.session.userId },
        });
      } else {
        await ctx.prismaClient.favoriteKit.create({
          data: { kitId: input.kitId, userId: ctx.session.userId },
        });
      }

      return { success: true };
    } catch (error) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
  });

const setFavoredNote = authenticatedProcedure
  .input(z.object({ noteId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    try {
      if (
        noteBelongsToUser({
          noteId: input.noteId,
          usersNotes: ctx.session.user.notes,
        })
      ) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      const existing = await ctx.prismaClient.favoriteNote.findMany({
        where: { noteId: input.noteId },
      });
      const existingVal = existing[0];
      if (existingVal) {
        await ctx.prismaClient.favoriteNote.deleteMany({
          where: { noteId: input.noteId, userId: ctx.session.userId },
        });
      } else {
        await ctx.prismaClient.favoriteNote.create({
          data: { noteId: input.noteId, userId: ctx.session.userId },
        });
      }

      return { success: true };
    } catch (error) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
  });

export const favoriteRouter = router({ setFavoredKit, setFavoredNote });
