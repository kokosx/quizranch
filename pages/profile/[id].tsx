import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../../components/layout";
import { isUserLoggedIn } from "./../../services/auth.service";
import { prismaClient } from "../../server/prisma";
import { usersRouter } from "../../server/routers/user";
import { Kit, User } from "@prisma/client";

type Props = {
  nickname?: string;
  data: User & { kits: Kit[] };
};

const Profile = ({ data, nickname }: Props) => {
  return (
    <Layout nickname={nickname} title={`Profil ${data.nickname}`}>
      <p>fds</p>
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

  const userWithKits = await caller.getUserWithKits({ nickname });
  if (!userWithKits) {
    return {
      redirect: { destination: `/profile/404/`, permanent: false },
    };
  }

  return {
    props: {
      nickname: auth?.session?.user.nickname,
      data: JSON.parse(JSON.stringify(userWithKits)),
    },
  };
};
