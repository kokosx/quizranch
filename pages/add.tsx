import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import KitEditor from "../components/KitEditor";

import Layout from "../components/layout";

import { isUserLoggedIn } from "../services/auth.service";

type Props = {
  csrfToken: string;
  nickname: string;
};

const Add = ({ csrfToken, nickname }: Props) => {
  return (
    <Layout title="Dodaj nowy zestaw" nickname={nickname}>
      <KitEditor csrfToken={csrfToken} />
    </Layout>
  );
};

export default Add;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Props>> => {
  const auth = await isUserLoggedIn(ctx.req);
  if (!auth?.session) {
    return { redirect: { destination: "/", permanent: false } };
  }

  if (auth.session.user.kits.length >= 5) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  const csrfToken = await auth.generateCSRF();
  return { props: { csrfToken, nickname: auth.session.user.nickname } };
};
