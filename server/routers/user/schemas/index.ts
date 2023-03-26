import { z } from "zod";

export const editUserSchema = z.object({
  description: z.string().min(5).optional(),
  avatarSeed: z.string().optional(),
});
