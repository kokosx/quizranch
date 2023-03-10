import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import KitEditor from "../../components/KitEditor";

import Layout from "../../components/layout";

import { isUserLoggedIn } from "../../services/auth.service";

type Props = {
  nickname: string;
};

const Add = ({ nickname }: Props) => {
  return (
    <Layout title="Dodaj nowy zestaw" nickname={nickname}>
      <KitEditor />
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

  return { props: { nickname: auth.session.user.nickname } };
};
