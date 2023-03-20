import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Nieprawidłowy mail"),
  password: z
    .string()
    .min(5, "Za krótkie hasło, min 5 znaków")
    .max(30, "Za długie hasło, max 30 znaków"),
  nickname: z
    .string()
    .min(3, "Nazwa musi mieć pomiędzy 3 a 15 znakami")
    .max(15, "Nazwa musi mieć pomiędzy 3 a 15 znakami"),
});
