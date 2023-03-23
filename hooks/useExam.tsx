import { KitQuestion } from "@prisma/client";
import { useState } from "react";

type Params = {
  initialAnswers: { id: string; index: number }[];
  kitQuestions: KitQuestion[];
};

export const useExam = ({ initialAnswers, kitQuestions }: Params) => {
  const [possibleAnswers, setPossibleAnswers] = useState(initialAnswers);
  const [index, setIndex] = useState(0);
  const [correctAnswerId, setCorrectAnswerId] = useState<string>();
  const [wrongAnswerId, setWrongAnswerId] = useState<string>();

  const [answeredCorrectly, setAnsweredCorrectly] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const answer = (id: string) => {};

  return {
    possibleAnswers,
    index,
    setIndex,
    correctAnswerId,
    setCorrectAnswerId,
    isLocked,
    answer,
  };
};
