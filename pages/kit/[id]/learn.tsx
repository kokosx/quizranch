import { Kit, KitQuestion, Progress } from "@prisma/client";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Layout from "../../../components/layout";
import { prismaClient } from "../../../server/prisma";
import { isUserLoggedIn } from "../../../services/auth.service";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import styles from "./../../../styles/learn.module.css";
import { trpc } from "../../../utils/trpc";
import ErrorDialog from "../../../components/styled/ErrorDialog";
import { useRouter } from "next/router";

type Props = {
  kit: Kit & { questions: KitQuestion[] };
  nickname: string;
  progress: Progress | null;
};

const Learn = ({ nickname, kit, progress }: Props) => {
  //Return all questions that hasnt been learned(if id doesnt exist in progress.learnt)
  const router = useRouter();
  const [newlyLearnt, setNewlyLearnt] = useState<string[]>([]);

  const getKnownPercentage = () => {
    return Math.floor((getAllLearnt().length / kit.questions.length) * 100);
  };

  const getStack = () => {
    if (!progress) {
      return kit.questions;
    }

    return kit.questions.filter(
      (ar) => !progress.learnt.find((rm) => rm === ar.id && ar.id === rm)
    );
  };

  const [stack, setStack] = useState(getStack());
  const [didEnd, setDidEnd] = useState(stack.length === 0);
  const [error, setError] = useState<false | string>(false);

  const addProgress = trpc.progress.addProgress.useMutation();
  const updateProgress = trpc.progress.updateProgress.useMutation();
  const resetProgress = trpc.progress.resetProgress.useMutation();

  const getAllLearnt = useCallback(() => {
    const allLearnt = new Set(newlyLearnt.concat(progress?.learnt ?? []));
    return Array.from(allLearnt);
  }, [newlyLearnt, progress?.learnt]);

  const activeIndex = stack.length - 1;

  useEffect(() => {
    if (stack.length < 1) {
      setDidEnd(true);
    }
    const shouldUpdate = progress ? true : false;
    if (shouldUpdate) {
      if (
        didEnd &&
        !updateProgress.isLoading &&
        (!updateProgress.isSuccess || updateProgress.isError)
      ) {
        updateProgress
          .mutateAsync({ kitId: kit.id, learnt: getAllLearnt() })
          .catch(() => setError("Zapisywanie nie powiodło się"));
      }
    } else {
      if (
        didEnd &&
        !addProgress.isLoading &&
        (!addProgress.isSuccess || addProgress.isError)
      ) {
        addProgress
          .mutateAsync({ kitId: kit.id, learnt: getAllLearnt() })
          .catch(() => setError("Zapisywanie nie powiodło się"));
      }
    }
  }, [
    stack.length,
    addProgress,
    didEnd,
    getAllLearnt,
    kit.id,
    progress,
    updateProgress,
  ]);

  const removeQuestion = (oldCard: KitQuestion) => {
    setStack((current) =>
      current.filter((card) => {
        return card.id !== oldCard.id;
      })
    );
  };

  const handleResetProgress = () => {
    resetProgress
      .mutateAsync({ kitId: kit.id })
      .catch(() => {
        setError("Zerowanie nie powiodło się");
      })
      .then(() => {
        router.reload();
      });
  };

  const showEndView = () => {
    const allLearnt = getAllLearnt();
    //Delete all values that are already known
    const notKnown = kit.questions.filter(
      (ar) => !allLearnt.find((rm) => rm === ar.id && ar.id === rm)
    );
    const percentage = getKnownPercentage();

    return (
      <div className="flex flex-col gap-y-2">
        <div>
          <p className="text-2xl">Brawo! Znasz {percentage}%</p>
          <progress
            className="w-56 progress bg-neutral progress-primary"
            value={percentage}
            max="100"
          ></progress>
        </div>
        <div className="flex gap-x-2">
          {percentage !== 100 && (
            <button onClick={() => router.reload()} className="btn btn-success">
              Powtarzaj dalej
            </button>
          )}
          <button onClick={handleResetProgress} className="btn btn-error">
            Wyzeruj postęp
          </button>
        </div>

        {percentage !== 100 && (
          <h4 className="text-xl">Te rzeczy musisz powtórzyc! :</h4>
        )}

        <div className="flex flex-col w-full md:w-1/2 gap-y-2">
          {notKnown.map((v) => (
            <div
              className="card card-body max-w-[300px] md:max-w-none bg-neutral text-neutral-content"
              key={v.id}
            >
              <p className="text-lg">Pytanie: {v.question}</p>
              <p>Odpowiedź: {v.answer}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const showLearnView = () => {
    return (
      <>
        <p className="flex items-center justify-center">
          Przeciągnij kartę na odpowiednią stronę
        </p>
        <section className="flex justify-center w-full h-full mt-8 gap-x-4">
          <div className="flex flex-col items-end w-16 mt-8">
            <ArrowLeft />
            <p>Nie znam</p>
          </div>
          <div className={`${styles["my-stack"]} w-72`}>
            <AnimatePresence>
              {stack.map((v, i) => (
                <StackItem
                  setNewlyLearnt={setNewlyLearnt}
                  active={i === activeIndex}
                  question={v}
                  removeQuestion={removeQuestion}
                  key={v.id}
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="flex flex-col w-16 mt-8">
            <ArrowRight />
            <p>Znam</p>
          </div>
        </section>
      </>
    );
  };

  return (
    <Layout nickname={nickname} title="Nauka">
      <div className="flex flex-col h-full gap-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold break-all text-secondary">
            {kit.name}
          </h2>

          <Link href={`/kit/${kit.id}`} className="btn btn-error">
            X
          </Link>
        </div>

        {didEnd ? showEndView() : showLearnView()}
      </div>
      <ErrorDialog isOpen={error !== false} onClose={() => setError(false)}>
        {error}
      </ErrorDialog>
    </Layout>
  );
};

type StackItemProps = {
  question: KitQuestion;
  active: boolean;
  removeQuestion: (oldCard: KitQuestion) => void;
  setNewlyLearnt: any;
};

const StackItem = ({
  question,
  active,
  removeQuestion,
  setNewlyLearnt,
}: StackItemProps) => {
  const [leaveX, setLeaveX] = useState(0);

  const onDragEnd = (_e: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setLeaveX(1000);
      removeQuestion(question);
      setNewlyLearnt((current: any) => [...current, question.id]);
    }
    if (info.offset.x < -100) {
      setLeaveX(-1000);
      removeQuestion(question);
    }
  };

  const classNames = `relative w-full min-h-[384px] bg-neutral border-2 border-secondary shadow-xl rounded-2xl flex flex-col  items-center cursor-grab p-2`;

  return (
    <>
      {active ? (
        <motion.div
          drag={true}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={onDragEnd}
          initial={{
            scale: 1,
          }}
          animate={{
            scale: 1.05,
          }}
          exit={{
            x: leaveX,

            opacity: 0,
            scale: 0.5,
            transition: { duration: 0.2 },
          }}
          className={classNames}
        >
          <div>
            <p className="text-lg font-semibold text-center">Pytanie:</p>
            <p className="font-medium text-center break-all ">
              {question.question}
            </p>
          </div>

          <div className="divider"></div>
          <div>
            <p className="text-lg font-semibold text-center">Odpowiedź:</p>
            <p className="font-medium text-center break-all ">
              {question.answer}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className={`${classNames}`}></div>
      )}
    </>
  );
};

export default Learn;

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const id = params?.id as unknown as string | null;
  if (!id) {
    return { redirect: { permanent: false, destination: "/dashboard" } };
  }

  const auth = await isUserLoggedIn(req);
  if (!auth?.session?.userId) {
    return { redirect: { destination: `/kit/${id}`, permanent: false } };
  }

  const [kit, progress] = await Promise.all([
    prismaClient.kit.findUnique({
      where: { id },
      include: { questions: true },
    }),
    prismaClient.progress.findFirst({
      where: { kitId: id, userId: auth.session.userId },
    }),
  ]);

  if (!kit) {
    return { redirect: { destination: "/not-found", permanent: false } };
  }

  return { props: { nickname: auth.session.user.nickname, kit, progress } };
};

const ArrowLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-12 h-12 text-error"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
    />
  </svg>
);

const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-12 h-12 text-success"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
    />
  </svg>
);
