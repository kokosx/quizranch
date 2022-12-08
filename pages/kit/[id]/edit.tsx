import { GetServerSidePropsContext } from "next";
import KitEditor from "../../../components/KitEditor";
import Layout from "../../../components/layout";
import { kitsRouter } from "../../../server/routers/kits";
import { isUserLoggedIn } from "../../../services/auth.service";
import { prismaClient } from "../../../server/prisma";
import { Kit } from "@prisma/client";
import { KitData } from "../../../types";

const Edit = ({
  csrfToken,
  kit,
}: {
  csrfToken: string;
  kit: Kit & { data: KitData[] };
}) => {
  return (
    <Layout title="Edytuj zestaw" user={true}>
      <KitEditor csrfToken={csrfToken} initialData={kit} />
    </Layout>
  );
};

export default Edit;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
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
  return {
    props: {
      kit: JSON.parse(JSON.stringify(kit)),
      csrfToken: await auth.generateCSRF(),
    },
  };
};
