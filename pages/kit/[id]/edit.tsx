import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import KitEditor from "../../../components/KitEditor";
import Layout from "../../../components/layout";

import { isUserLoggedIn } from "../../../services/auth.service";
import { prismaClient } from "../../../server/prisma";

import type { Kit, KitQuestion } from "@prisma/client";

type Props = {
  kit: Kit & {
    questions: KitQuestion[];
  };
  nickname: string;
};

const Edit = ({ kit, nickname }: Props) => {
  return (
    <Layout title="Edytuj zestaw" nickname={nickname}>
      <KitEditor initialData={kit} />
    </Layout>
  );
};

export default Edit;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Props>> => {
  const auth = await isUserLoggedIn(ctx.req);
  if (!auth?.session) {
    return { redirect: { permanent: false, destination: "/" } };
  }
  const id = ctx.query.id as unknown as string | null;
  if (!id) {
    return { redirect: { permanent: false, destination: "/dashboard" } };
  }
  //If user isnt creator, redirect:

  const kit = await prismaClient.kit.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!kit) {
    return { redirect: { destination: "/not-found", permanent: false } };
  }
  if (kit.createdBy !== auth.session.userId) {
    return { redirect: { permanent: false, destination: `/kit/${id}` } };
  }
  return {
    props: {
      nickname: auth.session.user.nickname,
      kit,
    },
  };
};
