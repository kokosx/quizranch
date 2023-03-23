import { KitQuestion } from "@prisma/client";
import { useState } from "react";

type Params = {
  initialAnswers: { id: string; index: number }[];
  kitQuestions: KitQuestion[];
};

export const useExam = ({ initialAnswers, kitQuestions }: Params) => {
  const [index, setIndex] = useState(0);
  const [correctAnswerId, setCorrectAnswerId] = useState<string>();
  const [wrongAnswerId, setWrongAnswerId] = useState<string>();
  const [didEnd, setDidEnd] = useState(false);

  const [answeredCorrectly, setAnsweredCorrectly] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const getPossibleAnswersList = () => {
    if (index === 0) {
      return initialAnswers;
    }

    const possibleAnswers = [{ index: index, id: kitQuestions[index].id }];
    //There must be at least 2 possible answers;
    const targetLength = kitQuestions.length > 5 ? 5 : kitQuestions.length;
    while (possibleAnswers.length < targetLength) {
      const randomIndex = Math.floor(Math.random() * kitQuestions.length);
      //Check if this index already exists:
      let shouldSkip = false;
      for (let i = 0; i < possibleAnswers.length; i++) {
        if (randomIndex === possibleAnswers[i].index) {
          shouldSkip = true;
        }
      }
      if (shouldSkip) {
        continue;
      }
      possibleAnswers.push({
        index: randomIndex,
        id: kitQuestions[randomIndex].id,
      });
    }

    //Return as an array
    return possibleAnswers;
  };

  const [possibleAnswers, setPossibleAnswers] = useState(
    getPossibleAnswersList()
  );

  const handleAnswering = (answerIndex: number) => {
    if (possibleAnswers[answerIndex].id === kitQuestions[index].id) {
      setCorrectAnswerId(possibleAnswers[answerIndex].id);
      setAnsweredCorrectly([
        ...answeredCorrectly,
        possibleAnswers[answerIndex].id,
      ]);
    } else {
      setWrongAnswerId(possibleAnswers[answerIndex].id);
      setCorrectAnswerId(kitQuestions[index].id);
    }

    window.scrollTo({
      top: 99999,

      behavior: "smooth",
    });

    setIsLocked(true);
  };

  const setNextAnswer = () => {
    setCorrectAnswerId(undefined);
    setWrongAnswerId(undefined);
    setIsLocked(false);

    if (index >= kitQuestions.length - 1) {
      setDidEnd(true);
    } else {
      setIndex(index + 1);
      setPossibleAnswers(getPossibleAnswersList());
    }
  };

  const getBgClass = (answerId: string) => {
    if (answerId === correctAnswerId) {
      return "bg-success";
    } else if (answerId === wrongAnswerId) {
      return "bg-error";
    } else {
      return "bg-neutral";
    }
  };

  return {
    possibleAnswers,
    index,
    setIndex,
    correctAnswerId,
    setCorrectAnswerId,
    isLocked,
    getBgClass,
    didEnd,
    answeredCorrectly,
    setNextAnswer,
    handleAnswering,
  };
};
