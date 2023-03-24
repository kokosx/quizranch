import type { KitQuestion, Progress } from "@prisma/client";

type Props = {
  kitQuestions: KitQuestion[];
  progressInitialLoading: boolean;
  progressData: Progress | null | undefined;
};

const FlashcardProgress = ({
  kitQuestions,
  progressData,
  progressInitialLoading,
}: Props) => {
  const getKnownPercentage = () => {
    const known = kitQuestions.filter((item) =>
      progressData?.learnt.includes(item.id)
    );
    return Math.floor((known.length / kitQuestions.length) * 100);
  };

  const renderProgress = () => {
    const percentage = getKnownPercentage();
    return (
      <>
        <progress
          value={percentage}
          max="100"
          className="w-full progress progress-primary"
        ></progress>
        <p>{percentage}%</p>
      </>
    );
  };
  return (
    <div className="flex items-center justify-start w-full gap-x-2">
      {progressInitialLoading && (
        <progress className="w-72 progress-primary progress"></progress>
      )}

      {progressData?.learnt && renderProgress()}
    </div>
  );
};

export default FlashcardProgress;
