import { z } from "zod";

export const addReportSchema = z.object({
  description: z.string().max(1000),
  title: z.string().min(5).max(200),
});
