import { z } from "zod";
import { CHARACTER_LIMIT, LEAST_QUESTIONS_NEEDED } from "../../../../constants";

export const kitSchema = z.object({
  name: z.string().min(3, "Nazwa musi mieć przynajmniej 3 znaki").max(30),
  description: z.string().default(""),
  data: z
    .object({
      question: z
        .string()
        .min(1, "Pytanie nie może być puste")
        .max(
          CHARACTER_LIMIT,
          `Pole może mieć maksymalnie ${CHARACTER_LIMIT} znaków`
        ),
      answer: z
        .string()
        .min(1, "Odpowiedź nie może być pusta")
        .max(
          CHARACTER_LIMIT,
          `Pole może mieć maksymalnie ${CHARACTER_LIMIT} znaków`
        ),
    })
    .array()
    .min(
      LEAST_QUESTIONS_NEEDED,
      `Muszą być przynajmniej ${LEAST_QUESTIONS_NEEDED} pytania`
    ),
});
