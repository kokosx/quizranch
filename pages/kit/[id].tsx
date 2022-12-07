import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { kitsRouter } from "../../server/routers/kits";
import { isUserLoggedIn } from "../../services/auth.service";
import { prismaClient } from "../../server/prisma";
import { Kit } from "@prisma/client";
import Layout from "../../components/layout";
import { KitData } from "../../types";
import { useState } from "react";

type Props = {
  isLoggedIn: boolean;
  kit: Kit & {
    data: KitData[];
    user: {
      nickname: string;
    };
  };
  isCreator: boolean;
};

const Kit = ({ isCreator, isLoggedIn, kit }: Props) => {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<"question" | "answer">("question");

  const nextQuestion = () => {
    if (index + 1 === kit.data.length) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  };

  const previousQuestion = () => {
    if (index === 0) {
      setIndex(kit.data.length - 1);
    } else {
      setIndex(index - 1);
    }
  };

  return (
    <Layout user={isLoggedIn}>
      <div className="flex flex-col gap-y-4">
        <h2 className="text-4xl font-semibold text-secondary">{kit.name}</h2>

        <div className="flex items-center justify-center w-full ">
          <div
            onClick={() => setView(view === "answer" ? "question" : "answer")}
            className="container flex flex-col items-center justify-start p-2 border-2 rounded-md cursor-pointer h-96 gap-y-2 border-base-300 bg-base-200 md:w-10/12 lg:w-2/3"
          >
            <p>
              {index + 1} / {kit.data.length}
            </p>

            <p className="flex items-center h-full text-2xl ">
              {kit.data[index][view]}
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

        {kit.description ? <p>{kit.description}</p> : <p>Brak opisu</p>}
        <p className="text-accent">Utworzone przez {kit.user.nickname}</p>
        {isCreator && (
          <div className="flex gap-x-2">
            <button className="btn btn-secondary">Edytuj</button>
            <button className="btn btn-error">Usuń</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Kit;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<any>> => {
  const session = await isUserLoggedIn(ctx.req);
  const caller = kitsRouter.createCaller({
    prismaClient,
    req: ctx.req,
    res: ctx.res,
  });
  const id = ctx.params?.id as unknown as string | null;
  if (!id) {
    return { redirect: { permanent: false, destination: "/dashboard" } };
  }
  let isLoggedIn = false;
  if (session?.user.id) {
    isLoggedIn = true;
  }
  const kit = await caller.getKitById({ kitId: id });

  const isCreator = session?.user.id === kit.createdBy;
  return {
    props: { isCreator, isLoggedIn, kit: JSON.parse(JSON.stringify(kit)) },
  };
};
