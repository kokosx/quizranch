import { TRPCError } from "@trpc/server";
import { authenticatedProcedure, router } from "../../trpc";

const dashboardLoader = authenticatedProcedure.query(async ({ ctx }) => {
  const [kits, notes, favoriteKits, favoriteNotes] = await Promise.all([
    ctx.prismaClient.kit.findMany({
      where: { createdBy: ctx.session.userId },
      orderBy: { createdAt: "desc" },
    }),
    ctx.prismaClient.note.findMany({
      where: { createdBy: ctx.session.userId },
      orderBy: { createdAt: "desc" },
    }),
    ctx.prismaClient.favoriteKit.findMany({
      where: { userId: ctx.session.userId },
      orderBy: { kit: { createdAt: "desc" } },
      include: { kit: true },
    }),
    ctx.prismaClient.favoriteNote.findMany({
      where: { userId: ctx.session.userId, note: { visibility: "PUBLIC" } },
      orderBy: { note: { createdAt: "desc" } },
      include: { note: true },
    }),
  ]);

  return { kits, notes, favoriteKits, favoriteNotes };
});

const settingsLoader = authenticatedProcedure.query(async ({ ctx }) => {
  const user = await ctx.prismaClient.user.findUnique({
    where: { id: ctx.session.userId },
    select: { avatarSeed: true, nickname: true, description: true },
  });
  if (!user) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }
  return user;
});

export const loaderRouter = router({ dashboardLoader, settingsLoader });
