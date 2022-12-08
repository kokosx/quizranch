import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import KitEditor from "../components/KitEditor";

import Layout from "../components/layout";

import { isUserLoggedIn } from "../services/auth.service";

const Add = ({ csrfToken }: { csrfToken: string }) => {
  return (
    <Layout title="Dodaj nowy zestaw" user>
      <KitEditor csrfToken={csrfToken} />
    </Layout>
  );
};

export default Add;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ csrfToken: string }>> => {
  const auth = await isUserLoggedIn(ctx.req);
  if (!auth?.session) {
    return { redirect: { destination: "/", permanent: false } };
  }

  if (auth.session.user.kits.length >= 5) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  const csrfToken = await auth.generateCSRF();
  return { props: { csrfToken } };
};
