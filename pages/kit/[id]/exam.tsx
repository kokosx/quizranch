import type { Kit, KitQuestion } from "@prisma/client";

import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import Layout from "../../../components/layout";
import ErrorDialog from "../../../components/styled/ErrorDialog";
import { prismaClient } from "../../../server/prisma";
import { isUserLoggedIn } from "../../../services/auth.service";

type Props = {
  nickname: string;
  kit: Kit & { questions: KitQuestion[] };
  initialAnswers: { id: string; index: number }[];
};

const Learn = ({ kit, nickname, initialAnswers }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [correctAnswer, setCorrectAnswer] = useState<string>();
  const [wrongAnswer, setWrongAnswer] = useState<string>();

  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  const [didEnd, setDidEnd] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState(false);

  const [answers, setAnswers] =
    useState<{ id: string; index: number }[]>(initialAnswers);

  const router = useRouter();

  const getAnswersList = () => {
    //If its first run, return answers generated on the server;
    if (currentIndex === 0) {
      return initialAnswers;
    }

    const possibleAnswers = [
      { index: currentIndex, id: kit.questions[currentIndex].id },
    ];
    //There must be at least 2 possible answers;
    const targetLength = kit.questions.length > 5 ? 5 : kit.questions.length;
    while (possibleAnswers.length < targetLength) {
      const randomIndex = Math.floor(Math.random() * kit.questions.length);
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
        id: kit.questions[randomIndex].id,
      });
    }

    //Return as an array
    return possibleAnswers;
  };

  const handleClosedAnswer = (answerIndex: number) => {
    if (answers[answerIndex].id === kit.questions[currentIndex].id) {
      setCorrectAnswer(answers[answerIndex].id);
      setCorrectAnswers([...correctAnswers, answers[answerIndex].id]);
    } else {
      setWrongAnswer(answers[answerIndex].id);
      setCorrectAnswer(kit.questions[currentIndex].id);
    }

    window.scrollTo({
      top: 99999,

      behavior: "smooth",
    });

    setIsLocked(true);
  };

  const setNextAnswer = () => {
    setCorrectAnswer(undefined);
    setWrongAnswer(undefined);
    setIsLocked(false);
    if (currentIndex + 1 === kit.questions.length) {
      setDidEnd(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setAnswers(getAnswersList());
    }
  };

  const getBgClass = (answerId: string) => {
    if (answerId === correctAnswer) {
      return "bg-success";
    } else if (answerId === wrongAnswer) {
      return "bg-error";
    } else {
      return "bg-neutral";
    }
  };

  const renderPossibleClosedAnswers = () => {
    return answers.map((v, i) => {
      return (
        <button
          onClick={() => (isLocked ? null : handleClosedAnswer(i))}
          key={v.id}
          className={`flex items-center hover:scale-[1.01] duration-200 ease-in-out justify-center p-2  rounded-md min-h-[200px] text-lg text-center break-all  ${getBgClass(
            v.id
          )}`}
        >
          {kit.questions[v.index].answer}
        </button>
      );
    });
  };

  const showQuizView = () => {
    return (
      <>
        <h2 className="text-4xl font-semibold text-secondary">{kit.name}</h2>
        <p className="text-xl">
          {currentIndex + 1} / {kit.questions.length}
        </p>
        <div className="flex items-center justify-center p-2  rounded-md min-h-[200px] bg-neutral">
          <p className="text-lg text-center break-all ">
            {kit.questions[currentIndex].question}
          </p>
        </div>
        <hr />
        <h3 className="text-3xl">Wybierz poprawną odpowiedź</h3>
        <div className="flex flex-col gap-y-4 ">
          {renderPossibleClosedAnswers()}
        </div>

        <button
          disabled={!isLocked}
          onClick={setNextAnswer}
          className="btn btn-primary"
        >
          {currentIndex + 1 === kit.questions.length
            ? "Zakończ"
            : "Następne pytanie"}
        </button>
      </>
    );
  };

  const showEndView = () => {
    const isAnswerCorrect = (id: string) => {
      const val = correctAnswers.filter((v) => v === id).length === 1;
      console.log(val);
      return val;
    };

    return (
      <>
        <h2 className="text-4xl font-semibold text-secondary">Wyniki</h2>
        <div className="flex flex-col w-full md:w-1/2">
          <div className="flex items-center w-full gap-x-2">
            <progress
              className="progress progress-success bg-neutral"
              value={(correctAnswers.length / kit.questions.length) * 100}
              max="100"
            ></progress>
            <p>{(correctAnswers.length / kit.questions.length) * 100}%</p>
          </div>

          <div className="flex flex-col gap-y-2">
            <h4 className="text-2xl font-semi text-secondary">
              Poprawne odpowiedzi
            </h4>
            {kit.questions.map((v) => {
              return (
                isAnswerCorrect(v.id) && (
                  <div className="card bg-neutral text-neutral-content">
                    <div className="card-body">
                      <p>Pytanie: {v.question}</p>
                      <p className="text-success">
                        Twoja odpowiedź: {v.answer}
                      </p>
                    </div>
                  </div>
                )
              );
            })}
            <div className="flex flex-col gap-y-2">
              <h4 className="text-2xl font-semi text-secondary">
                Niepoprawne odpowiedzi
              </h4>
              {kit.questions.map((v) => {
                return (
                  !isAnswerCorrect(v.id) && (
                    <div className="card bg-neutral text-neutral-content">
                      <div className="card-body">
                        <p>Pytanie: {v.question}</p>
                        <p className="text-error">
                          Prawidłowa odpowiedź: {v.answer}
                        </p>
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <Layout title="Test" nickname={nickname}>
      <div className="flex flex-col w-full h-full scroll-smooth gap-y-4 ">
        <Link
          href={`/kit/${router.query.id}`}
          className="btn btn-error btn-square"
        >
          X
        </Link>
        {didEnd ? showEndView() : showQuizView()}
      </div>
      <ErrorDialog isOpen={error} onClose={() => setError(false)}>
        Wystąpił nieznany błąd
      </ErrorDialog>
    </Layout>
  );
};

export default Learn;

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const kitId = params?.id as unknown as string | null;
  if (!kitId) {
    return { redirect: { permanent: false, destination: "/dashboard" } };
  }
  const auth = await isUserLoggedIn(req);
  if (!auth?.session) {
    return { redirect: { destination: "/", permanent: false } };
  }

  const kit = await prismaClient.kit.findUnique({
    where: { id: kitId },
    include: {
      questions: true,
    },
  });

  if (!kit) {
    return { redirect: { destination: "/not-found", permanent: false } };
  }

  //Copy of function above
  const possibleAnswers = [{ index: 0, id: kit.questions[0].id }];
  //There must be at least 2 possible answers;

  const targetLength = kit.questions.length > 5 ? 5 : kit?.questions.length;
  while (possibleAnswers.length < targetLength) {
    const randomIndex = Math.floor(Math.random() * kit.questions.length);
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
      id: kit.questions[randomIndex].id,
    });
  }

  //Return as an array

  const initialAnswers = possibleAnswers.sort(() => Math.random() - 0.5);
  return {
    props: {
      initialAnswers,
      nickname: auth.session.user.nickname,
      kit,
    },
  };
};
