import { PrismaClient } from "@prisma/client";
import { prismaClient } from "../server/prisma";
import { noteVisibility } from "../server/routers/notes.router";

export const getAllOwnedNotesService = async (userId: string) => {
  const notes = await prismaClient.note.findMany({
    where: { createdBy: userId },
  });
  return notes;
};

export const getUsersPublicNotesService = async (userId: string) => {
  const notes = await prismaClient.note.findMany({
    where: {
      createdBy: userId,
      visibility: noteVisibility.Enum.PUBLIC,
    },
  });
  return notes;
};

export const getNoteByIdService = async (id: string) => {
  return await prismaClient.note.findUnique({
    where: { id },
  });
};

export const searchForNoteService = async ({
  text,
  skip,
  _prismaClient,
}: {
  text: string;
  skip: number;
  _prismaClient?: PrismaClient;
}) => {
  const pc = _prismaClient ?? prismaClient;
  const notes = await pc.note.findMany({
    where: {
      name: { contains: text, mode: "insensitive" },
      visibility: noteVisibility.Enum.PUBLIC,
    },
    skip: skip,
    take: 10,
    include: {
      user: { select: { avatarSeed: true, id: true, nickname: true } },
    },
  });
  return notes;
};
