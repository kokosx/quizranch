import { z } from "zod";
import { MAX_NOTE_LENGTH, MAX_NOTE_NAME_LENGTH } from "../../../../constants";
import type { NoteVisibility } from "@prisma/client";

//Zod infers all enum types, only PUBLIC is needed
const noteVisibility: z.ZodType<NoteVisibility> = z.enum(["PUBLIC"]);
export const addNoteSchema = z.object({
  name: z.string().min(1).max(MAX_NOTE_NAME_LENGTH),
  createdBy: z.string(),
  data: z.string().max(MAX_NOTE_LENGTH * 3),
  visibility: noteVisibility,
});

export const updateNoteSchema = z.object({
  noteId: z.string(),
  name: z.string().min(1).optional(),
  data: z
    .string()
    .max(MAX_NOTE_LENGTH * 3)
    .optional(),
  visibility: noteVisibility.optional(),
});
