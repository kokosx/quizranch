import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../../../components/layout";
import { isUserLoggedIn } from "../../../services/auth.service";
import { prismaClient } from "../../../server/prisma";
import type { Note, User } from "@prisma/client";
import TextEditor from "../../../components/TextEditor";
import Avatar from "../../../components/Avatar";
import Link from "next/link";

type Props = {
  nickname: string | null;
  userId: string | null;
  note: Note & {
    user: Pick<User, "avatarSeed" | "nickname">;
  };
};

const Note = ({ nickname, note, userId }: Props) => {
  return (
    <Layout title={`Notatka ${note.name}`} nickname={nickname}>
      <div className="flex flex-col gap-y-2">
        <TextEditor canEdit={false} initialNote={note} userId={userId} />

        <Link
          className="flex items-center gap-x-2"
          href={`/profile/${note.user.nickname}`}
        >
          <p>Utworzone przez {note.user.nickname}</p>
          <Avatar data={note.user} />
        </Link>

        {note.createdBy === userId && (
          <Link href={`/note/${note.id}/edit`}>
            <button className="btn btn-success">Edytuj</button>
          </Link>
        )}
      </div>
    </Layout>
  );
};

export default Note;

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const id = params?.id as unknown as string | null;
  if (!id) {
    return { redirect: { permanent: false, destination: "/dashboard" } };
  }
  const auth = await isUserLoggedIn(req);

  const note = await prismaClient.note.findUnique({
    where: { id },
    include: {
      user: { select: { nickname: true, avatarSeed: true } },
    },
  });
  if (!note) {
    return { redirect: { permanent: false, destination: "/not-found" } };
  }

  if (
    note.visibility === "PRIVATE" &&
    note.createdBy !== auth?.session?.userId
  ) {
    return { redirect: { permanent: false, destination: "/dashboard" } };
  }
  return {
    props: {
      userId: auth?.session?.userId ?? null,
      nickname: auth?.session?.user.nickname ?? null,
      note,
    },
  };
};
