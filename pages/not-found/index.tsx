import Layout from "../../components/layout";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { isUserLoggedIn } from "../../services/auth.service";
import Link from "next/link";

type Props = {
  nickname: string | null;
};

const ProfileNotFound = ({ nickname }: Props) => {
  return (
    <Layout title="Nie znaleziono" nickname={nickname}>
      <h2>Nie znaleziono takiego zasobu</h2>
      <Link className="btn" href={nickname ? "/dashboard" : "/"}>
        Powrót
      </Link>
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
