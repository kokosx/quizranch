import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../components/layout";
import { prismaClient } from "../server/prisma";
import { usersRouter } from "../server/routers/user";
import { isUserLoggedIn } from "../services/auth.service";

const Settings = () => {
  return (
    <Layout title="Ustawienia konta" nickname="">
      abc
    </Layout>
  );
};

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
  const auth = await isUserLoggedIn(req);
  if (!auth?.session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  const userCaller = usersRouter.createCaller({ prismaClient, req, res });
  const user = await userCaller.getUser({ id: auth.session.userId });

  return { props: {} };
};

export default Settings;
