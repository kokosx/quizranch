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
import FlashcardLayout from "../../../features/kit/components/FlashcardLayout";
import Flashcard from "../../../features/kit/components/Flashcard";
import FlashcardProgress from "../../../features/kit/components/FlashcardProgress";

type Props = {
  kit: Kit & { questions: KitQuestion[] } & {
    user: Pick<User, "avatarSeed" | "id" | "nickname">;
  };
  isCreator: boolean;
  nickname: string | null;
  _isFavorite: boolean;
};

const KitIndex = ({ isCreator, kit, nickname, _isFavorite }: Props) => {
  const [isFavorite, setIsFavorite] = useState(_isFavorite);

  const changeFavorite = trpc.favorite.setFavoredKit.useMutation();
  const progress = trpc.progress.getProgress.useQuery(
    { kitId: kit.id },
    { enabled: nickname ? true : false }
  );
  //Fetch progress only when user is logged in

  const handleChangeFavorite = () => {
    setIsFavorite(!isFavorite);
    changeFavorite.mutateAsync({ kitId: kit.id }).catch(() => {
      //setError("Wystąpił błąd")
      setIsFavorite(!isFavorite);
    });
  };

  return (
    <Layout nickname={nickname} title="Ucz się">
      <div className="flex flex-col gap-y-4">
        <h2 className="text-4xl font-semibold text-secondary">{kit.name}</h2>
        <div className="flex flex-col items-center justify-center w-full h-full">
          <FlashcardLayout>
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
            <Flashcard kitQuestions={kit.questions} />
            <FlashcardProgress
              kitQuestions={kit.questions}
              progressData={progress.data}
              progressInitialLoading={progress.isInitialLoading}
            />
          </FlashcardLayout>
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

export default KitIndex;

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
