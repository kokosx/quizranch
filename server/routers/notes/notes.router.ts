import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { MAX_NOTE_AMOUNT } from "../../../constants";

import { authorizedProcedure, procedure, router } from "../../trpc";
import { addNoteSchema, updateNoteSchema } from "./schemas";

export const noteBelongsToUser = ({
  usersNotes,
  noteId,
}: {
  usersNotes: { id: string }[];
  noteId: string;
}): boolean => usersNotes.filter((v) => v.id === noteId).length === 1;

const updateNote = authorizedProcedure
  .input(updateNoteSchema)
  .mutation(async ({ ctx, input }) => {
    if (
      !noteBelongsToUser({
        noteId: input.noteId,
        usersNotes: ctx.session.user.notes,
      })
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const newNote = await ctx.prismaClient.note.update({
      data: {
        data: input.data,
        name: input.name,
        visibility: input.visibility,
      },
      where: { id: input.noteId },
    });
    return newNote;
  });

const addNote = authorizedProcedure
  .input(addNoteSchema)
  .mutation(async ({ ctx, input }) => {
    //Protect from user having more than max amount of notes
    if (ctx.session.user.notes.length >= MAX_NOTE_AMOUNT) {
      throw new TRPCError({ code: "CONFLICT" });
    }
    await ctx.prismaClient.user.findFirst({ where: {} });

    const note = await ctx.prismaClient.note.create({
      data: {
        data: input.data,
        name: input.name,
        createdBy: input.createdBy,

        visibility: input.visibility,
      },
    });
    return note;
  });

const searchForNote = procedure
  .input(z.object({ text: z.string(), skip: z.number().default(0) }))
  .query(async ({ ctx, input }) => {
    return await ctx.prismaClient.note.findMany({
      where: {
        name: { contains: input.text, mode: "insensitive" },
        visibility: "PUBLIC",
      },
      take: 10,
      skip: input.skip,
      include: {
        user: { select: { avatarSeed: true, id: true, nickname: true } },
      },
    });
  });

const deleteNote = authorizedProcedure
  .input(z.object({ noteId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    if (
      !noteBelongsToUser({
        noteId: input.noteId,
        usersNotes: ctx.session.user.notes,
      })
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const deleted = await ctx.prismaClient.note.deleteMany({
      where: { id: input.noteId },
    });
    if (deleted.count === 0) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
    return { message: "success" };
  });

export const notesRouter = router({
  addNote,
  updateNote,
  deleteNote,
  searchForNote,
});
