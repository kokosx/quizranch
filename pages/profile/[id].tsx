import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../../components/layout";
import { isUserLoggedIn } from "./../../services/auth.service";
import { prismaClient } from "../../server/prisma";
import { usersRouter } from "../../server/routers/user";
import Avatar from "../../components/Avatar";
import type { UserOutput } from "../../server/routers/_app";
import Link from "next/link";

type Props = {
  nickname: string | null;
  data: UserOutput["getUserWithKits"];
};

const Profile = ({ data, nickname }: Props) => {
  const getKitDataLength = (i: number) => {
    return data.kits[i].data.length;
  };

  return (
    <Layout nickname={nickname} title={`Profil ${data.nickname}`}>
      <div className="flex flex-col">
        <div className="flex">
          <div className="flex flex-col gap-y-4">
            <h5 className="text-4xl font-semibold text-secondary">
              {data.nickname}
            </h5>
            <Avatar data={data} size={200} />
          </div>
          <div className="w-full px-6">
            <p className="w-full h-full p-2 text-3xl font-medium textarea textarea-bordered">
              {data.description ?? "Brak opisu..."}
            </p>
          </div>
        </div>
        <div className="divider"></div>
        <div className="flex flex-col gap-y-2">
          <h5 className="text-4xl font-semibold text-secondary">Zestawy</h5>
          {data.kits.map((v, i) => {
            return (
              <div
                className="flex items-center justify-between h-24 p-2 rounded-md bg-neutral"
                key={v.id}
              >
                <div>
                  <Avatar data={data} size={40} />
                  <p className="text-2xl font-semibold">{data.nickname}</p>
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
  const caller = usersRouter.createCaller({
    prismaClient,
    req,
    res,
  });
  try {
    const userWithKits = await caller.getUserWithKits({ nickname });
    return {
      props: {
        nickname: auth?.session?.user.nickname ?? null,
        data: JSON.parse(JSON.stringify(userWithKits)),
      },
    };
  } catch (error) {
    return {
      redirect: { destination: `/404/profile/`, permanent: false },
    };
  }
};
