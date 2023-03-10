import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../../components/layout";
import TextEditor from "../../components/TextEditor";
import { MAX_NOTE_AMOUNT } from "../../constants";
import { isUserLoggedIn } from "../../services/auth.service";

type Props = {
  nickname: string;
  userId: string;
};

const AddNote = ({ nickname, userId }: Props) => {
  return (
    <Layout nickname={nickname} title="Dodaj notatkę">
      <div className="w-full h-96">
        <TextEditor userId={userId} initialNote={null} canEdit={true} />
      </div>
    </Layout>
  );
};

export default AddNote;

export const getServerSideProps = async ({
  req,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const auth = await isUserLoggedIn(req);
  if (!auth?.session?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  //Check if user can add another note
  if (auth.session.user.notes.length >= MAX_NOTE_AMOUNT) {
    return { redirect: { destination: "dashboard", permanent: false } };
  }

  return {
    props: {
      nickname: auth.session.user.nickname,
      userId: auth.session.userId,
    },
  };
};
