import type { FavoriteKit, FavoriteNote, Kit, Note } from "@prisma/client";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/layout";
import DashboardLink from "../components/styled/DashboardLink";
import { prismaClient } from "../server/prisma";
import { isUserLoggedIn } from "../services/auth.service";

type Props = {
  kits: Kit[];
  nickname: string;
  notes: Note[];
  favoriteKits: (FavoriteKit & {
    kit: Kit;
  })[];
  favoriteNotes: (FavoriteNote & {
    note: Note;
  })[];
};

const Dashboard = ({
  kits,
  nickname,
  notes,
  favoriteKits,
  favoriteNotes,
}: Props) => {
  const router = useRouter();
  const [error, setError] = useState<false | string>(false);

  return (
    <Layout nickname={nickname} title="Dashboard">
      <div className="flex flex-col gap-y-4">
        <h3 className="text-4xl font-semibold text-secondary">Twoje zestawy</h3>
        <div className="flex flex-col flex-wrap justify-center gap-4 lg:gap-8 md:justify-start md:flex-row">
          <button
            onClick={() =>
              kits.length < 5
                ? router.push("/kit/add")
                : setError("Limit 5 zestawów")
            }
            className="kit-button"
          >
            Dodaj
          </button>

          {kits.map((kit) => (
            <DashboardLink href={`/kit/${kit.id}`} key={kit.id}>
              {kit.name}
            </DashboardLink>
          ))}
          {favoriteKits.map((v) => (
            <DashboardLink href={`/kit/${v.kit.id}`} isFavorite key={v.kit.id}>
              {v.kit.name}
            </DashboardLink>
          ))}
        </div>
        {error && (
          <div className="toast toast-end ">
            <div className="shadow-lg alert alert-error">
              <div className="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => setError(false)}
                  className="flex-shrink-0 w-8 h-8 cursor-pointer stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Możesz mieć maksymalnie 5 zestawów</span>
              </div>
            </div>
          </div>
        )}
        <h3 className="text-4xl font-semibold text-secondary">Twoje notatki</h3>
        <div className="flex flex-col flex-wrap justify-center gap-4 lg:gap-8 md:justify-start md:flex-row">
          <button
            onClick={() =>
              notes.length < 5
                ? router.push("/note/add")
                : setError("Limit 5 notatek")
            }
            className="kit-button"
          >
            Dodaj
          </button>

          {notes.map((note) => (
            <DashboardLink href={`/note/${note.id}`} key={note.id}>
              {note.name}
            </DashboardLink>
          ))}

          {favoriteNotes.map((v) => (
            <DashboardLink
              isFavorite
              href={`/note/${v.note.id}`}
              key={v.note.id}
            >
              {v.note.name}
            </DashboardLink>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

export const getServerSideProps = async ({
  req,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const auth = await isUserLoggedIn(req);
  if (!auth?.session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const [kits, notes, favoriteKits, favoriteNotes] = await Promise.all([
    prismaClient.kit.findMany({
      where: { createdBy: auth.session.userId },
    }),
    prismaClient.note.findMany({
      where: { createdBy: auth.session.userId },
    }),
    prismaClient.favoriteKit.findMany({
      where: { userId: auth.session.userId },
      include: { kit: true },
    }),
    prismaClient.favoriteNote.findMany({
      where: { userId: auth.session.userId },
      include: { note: true },
    }),
  ]);

  return {
    props: {
      kits,
      favoriteKits,
      notes,
      favoriteNotes,
      nickname: auth.session.user.nickname,
    },
  };
};
