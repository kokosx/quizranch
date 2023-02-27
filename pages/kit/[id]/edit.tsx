import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import KitEditor from "../../../components/KitEditor";
import Layout from "../../../components/layout";
import { kitsRouter } from "../../../server/routers/kits.router";
import { isUserLoggedIn } from "../../../services/auth.service";
import { prismaClient } from "../../../server/prisma";
import type { KitOutput } from "../../../server/routers/_app";

type Props = {
  kit: KitOutput["getKitById"];
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
  if (auth.session.user.kits.filter((v) => v.id === id).length !== 1) {
    console.log(auth.session.user.kits.map((v) => v.id === id));
    return { redirect: { permanent: false, destination: `/kit/${id}` } };
  }
  const caller = kitsRouter.createCaller({
    prismaClient,
    req: ctx.req,
    res: ctx.res,
  });
  const kit = await caller.getKitById({ kitId: id });
  if (!kit) {
    return { redirect: { destination: "/404/kit", permanent: false } };
  }
  return {
    props: {
      nickname: auth.session.user.nickname,
      kit: JSON.parse(JSON.stringify(kit)),
    },
  };
};
