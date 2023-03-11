import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "../../../components/layout";
import { isUserLoggedIn } from "../../../services/auth.service";
import { prismaClient } from "../../../server/prisma";
import type { Note, User } from "@prisma/client";
import TextEditor from "../../../components/TextEditor";
import Avatar from "../../../components/Avatar";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "../../../utils/trpc";

type Props = {
  nickname: string | null;
  userId: string | null;
  note: Note & {
    user: Pick<User, "avatarSeed" | "nickname">;
  };
  _isFavorite: boolean;
};

const Note = ({ nickname, note, userId, _isFavorite }: Props) => {
  const [isFavorite, setIsFavorite] = useState(_isFavorite);

  const changeFavorite = trpc.favorite.setFavoredNote.useMutation();

  const handleChangeFavorite = () => {
    setIsFavorite(!isFavorite);
    changeFavorite.mutateAsync({ noteId: note.id }).catch(() => {
      //setError("Wystąpił błąd")
      setIsFavorite(!isFavorite);
    });
  };

  return (
    <Layout title={`Notatka ${note.name}`} nickname={nickname}>
      <div className="flex flex-col gap-y-2">
        <TextEditor canEdit={false} initialNote={note} userId={userId} />
        {nickname && note.createdBy !== userId && (
          <button
            aria-label="HeartButton"
            onClick={handleChangeFavorite}
            className={` ${isFavorite ? "heart-icon-on" : "heart-icon"}`}
          ></button>
        )}

        <Link
          className="flex items-center gap-x-2 max-w-fit"
          href={`/profile/${note.user.nickname}`}
        >
          <p className="text-error">Utworzone przez {note.user.nickname}</p>
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

  const getFavorite = async () => {
    if (!auth?.session) {
      return false;
    }
    const favorites = await prismaClient.favoriteNote.findMany({
      where: { userId: auth.session.userId, noteId: id },
    });
    const favorite = favorites[0];
    if (favorite) {
      return true;
    } else {
      return false;
    }
  };

  const getNote = async () => {
    return await prismaClient.note.findUnique({
      where: { id },
      include: {
        user: { select: { nickname: true, avatarSeed: true } },
      },
    });
  };

  const [note, isFavorite] = await Promise.all([getNote(), getFavorite()]);
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
      _isFavorite: isFavorite,
      userId: auth?.session?.userId ?? null,
      nickname: auth?.session?.user.nickname ?? null,
      note,
    },
  };
};
