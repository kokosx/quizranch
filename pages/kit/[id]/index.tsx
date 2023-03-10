import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { isUserLoggedIn } from "../../../services/auth.service";
import { prismaClient } from "../../../server/prisma";
import Layout from "../../../components/layout";
import { useState } from "react";
import Link from "next/link";
import { DocumentIcon, LearnIcon } from "../../../components/KitEditorIcons";
import Avatar from "../../../components/Avatar";

import type { Kit, KitQuestion, User } from "@prisma/client";

type Props = {
  kit: Kit & { questions: KitQuestion[] } & {
    user: Pick<User, "avatarSeed" | "id" | "nickname">;
  };
  isCreator: boolean;
  nickname: string | null;
};

const Kit = ({ isCreator, kit, nickname }: Props) => {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<"question" | "answer">("question");

  const nextQuestion = () => {
    if (index + 1 === kit.questions.length) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  };

  const previousQuestion = () => {
    if (index === 0) {
      setIndex(kit.questions.length - 1);
    } else {
      setIndex(index - 1);
    }
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
          </div>
        </div>

        {kit.description ? <p>{kit.description}</p> : <p>Brak opisu</p>}
        <div className="flex items-center gap-x-2 border-secondary max-w-fit">
          <Link
            href={`/profile/${nickname}`}
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

  const kit = await prismaClient.kit.findUnique({
    where: { id },
    include: {
      questions: true,
      user: { select: { avatarSeed: true, id: true, nickname: true } },
    },
  });

  if (!kit) {
    return { redirect: { destination: "/not-found", permanent: false } };
  }

  const isCreator = auth?.session?.user.id === kit.createdBy;

  return {
    props: {
      isCreator,

      kit,
      nickname: auth?.session?.user.nickname ?? null,
    },
  };
};
