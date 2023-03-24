import type { KitQuestion } from "@prisma/client";
import { useState } from "react";

export const useFlashcard = (kitQuestions: KitQuestion[]) => {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<"question" | "answer">("question");

  const setNextQuestion = () => {
    if (index + 1 === kitQuestions.length) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
    setView("question");
  };

  const setPreviousQuestion = () => {
    if (index === 0) {
      setIndex(kitQuestions.length - 1);
    } else {
      setIndex(index - 1);
    }
    setView("question");
  };

  const changeView = () => {
    setView(view === "answer" ? "question" : "answer");
  };

  return {
    setNextQuestion,
    setPreviousQuestion,
    flashcardText: kitQuestions[index][view],
    changeView,
    index,
  };
};
