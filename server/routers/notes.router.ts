import { TRPCError } from "@trpc/server";
import { TypeOf, z } from "zod";
import {
  MAX_NOTE_AMOUNT,
  MAX_NOTE_LENGTH,
  MAX_NOTE_NAME_LENGTH,
} from "../../constants";

import { authorizedProcedure, procedure, router } from "../trpc";
import { searchForNoteService } from "../../services/notes.service";

export const noteBelongsToUser = ({
  usersNotes,
  noteId,
}: {
  usersNotes: { id: string }[];
  noteId: string;
}): boolean => usersNotes.filter((v) => v.id === noteId).length !== 1;

export const noteVisibility = z.enum(["PUBLIC", "PRIVATE"]);
export type NoteVisibility = TypeOf<typeof noteVisibility>;

const updateNote = authorizedProcedure
  .input(
    z.object({
      noteId: z.string(),
      name: z.string().min(1).optional(),
      data: z
        .string()
        .max(MAX_NOTE_LENGTH * 3)
        .optional(),
      visibility: noteVisibility.optional(),
    })
  )
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
  .input(
    z.object({
      name: z.string().min(1).max(MAX_NOTE_NAME_LENGTH),
      createdBy: z.string(),
      data: z.string().max(MAX_NOTE_LENGTH * 3),
      visibility: noteVisibility,
    })
  )
  .mutation(async ({ ctx, input }) => {
    //Protect from user having more than max amount of notes
    if (ctx.session.user.notes.length >= MAX_NOTE_AMOUNT) {
      throw new TRPCError({ code: "CONFLICT" });
    }

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
    return await searchForNoteService({
      skip: input.skip,
      text: input.text,
      _prismaClient: ctx.prismaClient,
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
