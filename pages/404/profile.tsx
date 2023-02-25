import Layout from "../../components/layout";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { isUserLoggedIn } from "../../services/auth.service";

type Props = {
  nickname: string | null;
};

const ProfileNotFound = ({ nickname }: Props) => {
  return (
    <Layout title="Nie znaleziono" nickname={nickname}>
      <h2>Nie znaleziono takiego użytkownika</h2>
    </Layout>
  );
};

export default ProfileNotFound;

export const getServerSideProps = async ({
  req,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const auth = await isUserLoggedIn(req);
  return { props: { nickname: auth?.session?.user.nickname ?? null } };
};
