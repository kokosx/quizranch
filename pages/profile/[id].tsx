import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../../components/layout";
import { isUserLoggedIn } from "./../../services/auth.service";
import { prismaClient } from "../../server/prisma";
import Avatar from "../../components/Avatar";
import Link from "next/link";
import { noteVisibility } from "../../server/routers/notes.router";

type Props = {
  nickname: string | null;
  user: {
    avatarSeed: string | null;
    description: string | null;
    nickname: string;
    notes: {
      name: string;
      id: string;
    }[];
    kits: {
      name: string;
      questions: { id: string }[];
      id: string;
    }[];
  };
};

const Profile = ({ user, nickname }: Props) => {
  const getKitDataLength = (i: number) => {
    return user.kits[i].questions.length;
  };
  console.log(user);
  return (
    <Layout nickname={nickname} title={`Profil ${user.nickname}`}>
      <div className="flex flex-col">
        <div className="flex">
          <div className="flex flex-col gap-y-4">
            <h5 className="text-4xl font-semibold text-secondary">
              {user.nickname}
            </h5>
            <Avatar data={user} size={200} />
          </div>
          <div className="w-full px-6">
            <p className="w-full h-full p-2 text-3xl font-medium textarea textarea-bordered">
              {user.description ?? "Brak opisu..."}
            </p>
          </div>
        </div>
        <div className="divider"></div>
        <div className="flex flex-col gap-y-2">
          <h5 className="text-4xl font-semibold text-secondary">Zestawy</h5>
          {user.kits.map((v, i) => {
            return (
              <div
                className="flex items-center justify-between h-24 p-2 rounded-md bg-neutral"
                key={v.id}
              >
                <div>
                  <Avatar data={user} size={40} />
                  <p className="text-2xl font-semibold">{user.nickname}</p>
                </div>

                <div className="">
                  <h6 className="text-2xl">{v.name}</h6>
                  <div className="badge badge-primary badge-lg">
                    {getKitDataLength(i)} pojęcia
                  </div>
                </div>
                <Link href={`/kit/${v.id}`} className="btn btn-secondary">
                  Przejdź
                </Link>
              </div>
            );
          })}
          <h5 className="text-4xl font-semibold text-secondary">Notatki</h5>
          {user.notes.map((v, i) => {
            return (
              <div
                className="flex items-center justify-between h-24 p-2 rounded-md bg-neutral"
                key={v.id}
              >
                <div>
                  <Avatar data={user} size={40} />
                  <p className="text-2xl font-semibold">{user.nickname}</p>
                </div>

                <div className="">
                  <h6 className="text-2xl">{v.name}</h6>
                </div>
                <Link href={`/kit/${v.id}`} className="btn btn-secondary">
                  Przejdź
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

export const getServerSideProps = async ({
  req,
  res,
  params,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const nickname = params?.id as unknown as string;

  const auth = await isUserLoggedIn(req);

  const user = await prismaClient.user.findUnique({
    where: { nickname },
    select: {
      avatarSeed: true,
      nickname: true,
      description: true,
      notes: {
        where: { visibility: noteVisibility.Enum.PUBLIC },
        select: { name: true, id: true },
      },
      kits: {
        select: { name: true, id: true, questions: { select: { id: true } } },
      },
    },
  });
  if (!user) {
    return { redirect: { destination: "not-found", permanent: false } };
  }
  return { props: { user, nickname: auth?.session?.user.nickname ?? null } };
};
