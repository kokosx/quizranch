import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../../../components/layout";
import { prismaClient } from "../../../server/prisma";
import { kitsRouter } from "../../../server/routers/kits";
import { KitOutput } from "../../../server/routers/_app";
import { isUserLoggedIn } from "../../../services/auth.service";

type Props = {
  nickname: string;
  kit: KitOutput["getKitById"];
};

const Learn = ({ kit, nickname }: Props) => {
  return (
    <Layout title="Nauka" nickname={nickname}>
      abcfds
    </Layout>
  );
};

export default Learn;

export const getServerSideProps = async ({
  req,
  res,
  params,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const kitId = params?.id as unknown as string | null;
  const auth = await isUserLoggedIn(req);
  if (!auth?.session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  if (!kitId) {
    return { redirect: { permanent: false, destination: "/dashboard" } };
  }
  const caller = kitsRouter.createCaller({ req, res, prismaClient });
  const kit = await caller.getKitById({ kitId });

  return {
    props: {
      nickname: auth.session.user.nickname,
      kit: JSON.parse(JSON.stringify(kit)),
    },
  };
};
