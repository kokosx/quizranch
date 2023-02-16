import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../../components/layout";
import { isUserLoggedIn } from "./../../services/auth.service";
import { prismaClient } from "../../server/prisma";
import { usersRouter } from "../../server/routers/user";
import Avatar from "../../components/Avatar";
import type { UserOutput } from "../../server/routers/_app";

type Props = {
  nickname?: string;
  data: UserOutput["getUserWithKits"];
};

const Profile = ({ data, nickname }: Props) => {
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
        nickname: auth?.session?.user.nickname,
        data: JSON.parse(JSON.stringify(userWithKits)),
      },
    };
  } catch (error) {
    return {
      redirect: { destination: `/profile/404/`, permanent: false },
    };
  }
};
