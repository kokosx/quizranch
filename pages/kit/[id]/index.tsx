import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { isUserLoggedIn } from "../../../services/auth.service";
import { prismaClient } from "../../../server/prisma";
import Layout from "../../../components/layout";
import { useState } from "react";
import Link from "next/link";
import { DocumentIcon, LearnIcon } from "../../../components/KitEditorIcons";
import Avatar from "../../../components/Avatar";

import type { Kit, KitQuestion, User } from "@prisma/client";
import { trpc } from "../../../utils/trpc";

type Props = {
  kit: Kit & { questions: KitQuestion[] } & {
    user: Pick<User, "avatarSeed" | "id" | "nickname">;
  };
  isCreator: boolean;
  nickname: string | null;
  _isFavorite: boolean;
};

const Kit = ({ isCreator, kit, nickname, _isFavorite }: Props) => {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<"question" | "answer">("question");
  const [isFavorite, setIsFavorite] = useState(_isFavorite);

  const changeFavorite = trpc.favorite.setFavoredKit.useMutation();
  const progress = trpc.progress.getProgress.useQuery(
    { kitId: kit.id },
    { enabled: nickname ? true : false }
  );
  //Fetch progress only when user is logged in

  const nextQuestion = () => {
    if (index + 1 === kit.questions.length) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
    setView("question");
  };

  const previousQuestion = () => {
    if (index === 0) {
      setIndex(kit.questions.length - 1);
    } else {
      setIndex(index - 1);
    }
    setView("question");
  };

  const handleChangeFavorite = () => {
    setIsFavorite(!isFavorite);
    changeFavorite.mutateAsync({ kitId: kit.id }).catch(() => {
      //setError("Wystąpił błąd")
      setIsFavorite(!isFavorite);
    });
  };

  const getKnownPercentage = () => {
    const known = kit.questions.filter((item) =>
      progress.data?.learnt.includes(item.id)
    );
    return Math.floor((known.length / kit.questions.length) * 100);
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
    <Layout nickname={nickname} title="Ucz się">
      <div className="flex flex-col gap-y-4">
        <h2 className="text-4xl font-semibold text-secondary">{kit.name}</h2>
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center w-full md:w-10/12 lg:w-2/3 gap-y-2 ">
            <div className="flex items-center w-full justify-evenly md:justify-start gap-x-2">
              <span
                className={`${!nickname && "tooltip"}`}
                data-tip={"Tylko dla zalogowanych"}
              >
                <Link
                  className="flex items-center gap-2 btn btn-accent"
                  href={`/kit/${kit.id}/learn`}
                >
                  <LearnIcon />
                  Ucz się
                </Link>
              </span>
              <span
                className={`${!nickname && "tooltip"}`}
                data-tip={"Tylko dla zalogowanych"}
              >
                <Link
                  className="flex items-center gap-2 btn btn-accent"
                  href={`/kit/${kit.id}/exam`}
                >
                  <DocumentIcon />
                  Test
                </Link>
              </span>
              <div className="ml-auto min-h-max min-w-max">
                {nickname && !isCreator && (
                  <button
                    aria-label="HeartButton"
                    onClick={handleChangeFavorite}
                    className={` ${
                      isFavorite ? "heart-icon-on" : "heart-icon"
                    }`}
                  ></button>
                )}
              </div>
            </div>
            <div className="divider"></div>
            <div
              onClick={() => setView(view === "answer" ? "question" : "answer")}
              className="container flex flex-col items-center justify-around w-full p-2 border-2 rounded-md cursor-pointer min-h-[400px] gap-y-2 border-base-300 bg-base-200 "
            >
              <p>
                {index + 1} / {kit.questions.length}
              </p>

              <p className="flex items-center h-full text-2xl break-all ">
                {kit.questions[index][view]}
              </p>

              <div className="flex gap-x-4">
                <button
                  onClick={(e) => {
                    previousQuestion();
                    e.stopPropagation();
                  }}
                  className="btn"
                >
                  {"<"}
                </button>
                <button
                  onClick={(e) => {
                    nextQuestion();
                    e.stopPropagation();
                  }}
                  className="btn"
                >
                  {">"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-start w-full gap-x-2">
              {progress.isInitialLoading && (
                <progress className="w-72 progress-primary progress"></progress>
              )}

              {progress.data?.learnt && renderProgress()}
            </div>
          </div>
        </div>

        {kit.description ? <p>{kit.description}</p> : <p>Brak opisu</p>}
        <div className="flex items-center gap-x-2 border-secondary max-w-fit">
          <Link
            href={`/profile/${kit.user.nickname}`}
            className="text-accent link-hover"
          >
            Utworzone przez {kit.user.nickname}
          </Link>
          <button className="p-2 btn btn-circle">
            <Avatar data={kit.user} />
          </button>
        </div>

        {isCreator && (
          <div className="flex gap-x-2">
            <Link href={`/kit/${kit.id}/edit`} className="btn btn-secondary">
              Edytuj
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Kit;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Props>> => {
  const id = ctx.params?.id as unknown as string | null;
  if (!id) {
    return { redirect: { permanent: false, destination: "/dashboard" } };
  }

  const auth = await isUserLoggedIn(ctx.req);

  const getKit = async () => {
    return await prismaClient.kit.findUnique({
      where: { id },
      include: {
        questions: true,
        user: { select: { avatarSeed: true, id: true, nickname: true } },
      },
    });
  };

  const getFavorite = async () => {
    if (!auth?.session) {
      return false;
    }
    const favorites = await prismaClient.favoriteKit.findMany({
      where: { userId: auth.session.userId, kitId: id },
    });
    const favorite = favorites[0];
    if (favorite) {
      return true;
    } else {
      return false;
    }
  };

  const [kit, favorite] = await Promise.all([getKit(), getFavorite()]);

  if (!kit) {
    return { redirect: { destination: "/not-found", permanent: false } };
  }

  const isCreator = auth?.session?.user.id === kit.createdBy;

  return {
    props: {
      isCreator,
      _isFavorite: favorite,
      kit,
      nickname: auth?.session?.user.nickname ?? null,
    },
  };
};
