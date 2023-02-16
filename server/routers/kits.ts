import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { MAX_KIT_AMOUNT } from "../../constants";
import { KitData } from "../../types";
import { authorizedProcedure, procedure, router } from "../trpc";

//Utils:
const kitBelongsToUser = ({
  usersKits,
  userId,
}: {
  usersKits: { id: string }[];
  userId: string;
}): boolean => usersKits.filter((v) => v.id === userId).length !== 1;

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
  name: z.string().min(3, errors.kitSchema.name.min),
  description: z.string().default(""),

  data: z
    .object({
      question: z.string().min(1, "Question cannot be empty"),
      answer: z.string().min(1, "Answer cannot be empty"),
    })
    .array()
    .min(2, errors.kitSchema.data.min),
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
            data: input.data,
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
  deleteKitById: authorizedProcedure
    .input(z.object({ kitId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        !kitBelongsToUser({
          userId: ctx.session.userId,
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
          userId: ctx.session.userId,
          usersKits: ctx.session.user.kits,
        })
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      try {
        await ctx.prismaClient.kit.update({
          where: { id: input.kitId },
          data: {
            data: input.data,
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
