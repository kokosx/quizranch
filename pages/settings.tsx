import { User } from "@prisma/client";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useState } from "react";
import Avatar from "../components/Avatar";
import Layout from "../components/layout";
import { prismaClient } from "../server/prisma";
import { isUserLoggedIn } from "../services/auth.service";
import { csrfHeader, trpc } from "../utils/trpc";

type Props = {
  user: Pick<User, "avatarSeed" | "description" | "nickname">;
};

const Settings = ({ user }: Props) => {
  const [avatarSeed, setAvatarSeed] = useState<string | undefined>(
    user.avatarSeed ?? user.nickname
  );
  const csrfToken = trpc.auth.getCSRFToken.useQuery();
  const [description, setDescription] = useState(user.description ?? "");
  const userMutation = trpc.user.editUser.useMutation();
  const [error, setError] = useState<string | false>(false);

  const getNewAvatar = () => {
    setAvatarSeed(crypto.randomUUID());
  };
  const handleEdit = async () => {
    setError(false);
    csrfHeader.value = csrfToken.data?.id;
    let _description: string | undefined = description;
    if (description.length < 5 && description.length !== 0) {
      setError("Opis musi być pusty lub zawierać przynamniej 3 znaki");
      return;
    }
    if (description.length === 0) {
      _description = undefined;
    }
    await userMutation.mutateAsync({
      avatarSeed: avatarSeed,
      description: _description,
    });
    //TODO: Error handling
    csrfToken.refetch();
  };

  return (
    <Layout title="Ustawienia konta" nickname={user.nickname}>
      <h3 className="text-4xl font-semibold text-secondary">Ustawienia</h3>
      <div className="flex flex-col gap-y-2">
        <section className="flex flex-col">
          <h4 className="text-3xl font-medium text-secondary">Avatar</h4>
          <div className="flex items-center gap-x-2">
            <Avatar
              data={{
                nickname: user.nickname,
                avatarSeed: avatarSeed ?? user.avatarSeed,
              }}
              size={150}
            />
            <div className="flex flex-col items-center gap-y-2">
              <button onClick={getNewAvatar} className="btn">
                Wygeneruj nowy
              </button>
              <button onClick={() => setAvatarSeed(undefined)} className="btn">
                Przywróć domyślny
              </button>
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-y-2">
          <h4 className="text-3xl font-medium text-secondary">Opis</h4>
          <textarea
            placeholder="Brak..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-48 p-2 text-3xl font-medium resize-none textarea textarea-bordered "
          />
        </section>
        <section>
          <button
            disabled={userMutation.isLoading}
            onClick={handleEdit}
            className={`btn btn-lg btn-primary ${
              userMutation.isLoading && "loading"
            }`}
          >
            Zapisz
          </button>
        </section>
      </div>
      {error && (
        <div className="toast toast-end ">
          <div className="shadow-lg alert alert-error">
            <div className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => setError(false)}
                className="flex-shrink-0 w-8 h-8 cursor-pointer stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const auth = await isUserLoggedIn(req);
  if (!auth?.session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const user = await prismaClient.user.findUnique({
    where: { id: auth.session.userId },
    select: { avatarSeed: true, nickname: true, description: true },
  });
  if (!user) {
    return { redirect: { destination: "not-found", permanent: false } };
  }
  return { props: { user } };
};

export default Settings;
