import type { Note } from "@prisma/client";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../../../components/layout";
import TextEditor from "../../../components/TextEditor";
import { MAX_NOTE_AMOUNT } from "../../../constants";
import { prismaClient } from "../../../server/prisma";
import { isUserLoggedIn } from "../../../services/auth.service";

type Props = {
  nickname: string;
  userId: string;
  initialNote: Note;
};

const EditNote = ({ nickname, userId, initialNote }: Props) => {
  return (
    <Layout nickname={nickname} title="Dodaj notatkę">
      <div className="w-full h-96">
        <TextEditor userId={userId} initialNote={initialNote} canEdit={true} />
      </div>
    </Layout>
  );
};

export default EditNote;

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const id = params?.id as unknown as string | null;
  if (!id) {
    return { redirect: { permanent: false, destination: "/dashboard" } };
  }
  const auth = await isUserLoggedIn(req);
  if (!auth?.session?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  //Check if user can add another note
  if (auth.session.user.notes.length >= MAX_NOTE_AMOUNT) {
    return { redirect: { destination: "dashboard", permanent: false } };
  }
  const note = await prismaClient.note.findUnique({ where: { id } });
  if (!note) {
    return { redirect: { destination: "/not-found", permanent: false } };
  }
  if (note.createdBy !== auth.session.userId) {
    return { redirect: { destination: `/note/${note.id}`, permanent: false } };
  }
  return {
    props: {
      nickname: auth.session.user.nickname,
      userId: auth.session.userId,
      initialNote: note,
    },
  };
};
