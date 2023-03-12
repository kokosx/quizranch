import { authenticatedProcedure, router } from "../trpc";

const dashboardLoader = authenticatedProcedure.query(async ({ ctx }) => {
  const [kits, notes, favoriteKits, favoriteNotes] = await Promise.all([
    ctx.prismaClient.kit.findMany({
      where: { createdBy: ctx.session.userId },
    }),
    ctx.prismaClient.note.findMany({
      where: { createdBy: ctx.session.userId },
    }),
    ctx.prismaClient.favoriteKit.findMany({
      where: { userId: ctx.session.userId },
      include: { kit: true },
    }),
    ctx.prismaClient.favoriteNote.findMany({
      where: { userId: ctx.session.userId },
      include: { note: true },
    }),
  ]);

  return { kits, notes, favoriteKits, favoriteNotes };
});

export const loaderRouter = router({ dashboardLoader });
