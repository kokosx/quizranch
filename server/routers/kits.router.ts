import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  CHARACTER_LIMIT,
  LEAST_QUESTIONS_NEEDED,
  MAX_KIT_AMOUNT,
} from "../../constants";
import { KitData } from "../../types";

import {
  authenticatedProcedure,
  authorizedProcedure,
  procedure,
  router,
} from "../trpc";

//Utils: TODO: Fix in edit
export const kitBelongsToUser = ({
  usersKits,
  kitId,
}: {
  usersKits: { id: string }[];
  kitId: string;
}): boolean => usersKits.filter((v) => v.id === kitId).length === 1;

const errors = {
  kitSchema: {
    name: {
      min: "Name is too short",
    },
    data: {
      min: "There must be at least 2 inputs",
    },
  },
};

//

const kitSchema = z.object({
  name: z.string().min(3, errors.kitSchema.name.min).max(30),
  description: z.string().default(""),

  data: z
    .object({
      question: z
        .string()
        .min(1, "Question cannot be empty")
        .max(CHARACTER_LIMIT),
      answer: z.string().min(1, "Answer cannot be empty").max(CHARACTER_LIMIT),
    })
    .array()
    .min(LEAST_QUESTIONS_NEEDED, errors.kitSchema.data.min),
});

export const kitsRouter = router({
  addKit: authorizedProcedure
    .input(kitSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.kits.length >= MAX_KIT_AMOUNT) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Over 5 kits" });
      }

      try {
        const kit = await ctx.prismaClient.kit.create({
          data: {
            name: input.name,
            description: input.description,
            createdBy: ctx.session.userId,
            questions: { createMany: { data: input.data } },
          },
        });

        return kit;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Couldnt add note",
        });
      }
    }),
  getUsersKitsByNewest: procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prismaClient.kit.findMany({
        where: { createdBy: input.userId },
        include: { user: { select: { nickname: true, avatarSeed: true } } },
        orderBy: { createdAt: "desc" },
      });
    }),
  getKitById: procedure
    .input(z.object({ kitId: z.string() }))
    .query(async ({ input, ctx }) => {
      const kitWithUser = await ctx.prismaClient.kit.findUnique({
        where: { id: input.kitId },
        include: { user: { select: { nickname: true, avatarSeed: true } } },
      });

      if (!kitWithUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kit not found" });
      }
      type typeWithJSON = typeof kitWithUser & { data: KitData[] };
      return kitWithUser as typeWithJSON;
    }),
  getKitByIdWithProgress: authenticatedProcedure
    .input(z.object({ kitId: z.string() }))
    .query(async ({ ctx, input }) => {
      const kitWithProgress = await ctx.prismaClient.kit.findUnique({
        where: { id: input.kitId },
        include: {
          progress: { where: { user: { id: ctx.session.userId } }, take: 1 },
        },
      });

      if (!kitWithProgress) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kit not found" });
      }
      type typeWithJSON = typeof kitWithProgress & { data: KitData[] };

      return kitWithProgress as typeWithJSON;
    }),
  deleteKitById: authorizedProcedure
    .input(z.object({ kitId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        !kitBelongsToUser({
          kitId: input.kitId,
          usersKits: ctx.session.user.kits,
        })
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      try {
        await ctx.prismaClient.kit.delete({ where: { id: input.kitId } });

        return { message: "success" };
      } catch (error) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kit doesnt exist" });
      }
    }),
  editKitById: authorizedProcedure

    .input(kitSchema.extend({ kitId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      //Check if user user authorized to mutate:
      if (
        !kitBelongsToUser({
          kitId: input.kitId,
          usersKits: ctx.session.user.kits,
        })
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      try {
        await ctx.prismaClient.kit.update({
          where: { id: input.kitId },
          data: {
            name: input.name,
            description: input.description,
          },
        });
        return { message: "success" };
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
    }),
  searchForKit: procedure
    .input(z.object({ name: z.string(), skip: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      return await ctx.prismaClient.kit.findMany({
        where: { name: { contains: input.name, mode: "insensitive" } },
        take: 10,
        skip: input.skip,
        select: {
          id: true,
          name: true,

          description: true,
          user: { select: { avatarSeed: true, nickname: true } },
        },
      });
    }),
});

export type KitRouter = typeof kitsRouter;
