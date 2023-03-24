import type { KitQuestion } from "@prisma/client";

import { useFlashcard } from "../hooks/useFlashcard";

type Props = {
  kitQuestions: KitQuestion[];
};

const Flashcard = ({ kitQuestions }: Props) => {
  const {
    flashcardText,
    setNextQuestion,
    setPreviousQuestion,
    changeView,
    index,
  } = useFlashcard(kitQuestions);
  return (
    <>
      <div
        onClick={changeView}
        className="container flex flex-col items-center justify-around w-full p-2 border-2 rounded-md cursor-pointer min-h-[400px] gap-y-2 border-base-300 bg-base-200 "
      >
        <p>
          {index + 1} / {kitQuestions.length}
        </p>

        <p className="flex items-center h-full text-2xl break-all ">
          {flashcardText}
        </p>

        <div className="flex gap-x-4">
          <button
            onClick={(e) => {
              setPreviousQuestion();
              e.stopPropagation();
            }}
            className="btn"
          >
            {"<"}
          </button>
          <button
            onClick={(e) => {
              setNextQuestion();
              e.stopPropagation();
            }}
            className="btn"
          >
            {">"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Flashcard;
