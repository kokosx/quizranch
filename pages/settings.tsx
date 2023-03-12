import { User } from "@prisma/client";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar from "../components/Avatar";
import Layout from "../components/layout";
import { Spinner } from "../components/Spinner";
import ErrorDialog from "../components/styled/ErrorDialog";

import { isUserLoggedIn } from "../services/auth.service";
import { csrfHeader, trpc } from "../utils/trpc";

type Props = {
  nickname: string | null;
};

const Settings = ({ nickname }: Props) => {
  const router = useRouter();

  const { data, isLoading, isError } = trpc.loaders.settingsLoader.useQuery();

  if (isError) {
    router.push("/dashboard");
  }

  const [avatarSeed, setAvatarSeed] = useState<string | undefined>(undefined);
  const csrfToken = trpc.auth.getCSRFToken.useQuery();
  const [description, setDescription] = useState("");
  const userMutation = trpc.user.editUser.useMutation();
  const [error, setError] = useState<string | false>(false);

  const getNewAvatar = () => {
    setAvatarSeed(crypto.randomUUID());
  };

  useEffect(() => {
    //Update after fetch
    if (!data) {
      return;
    }
    setDescription(data.description ?? "");
    setAvatarSeed(data.avatarSeed ?? data.nickname);
  }, [data]);

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
    userMutation
      .mutateAsync({
        avatarSeed: avatarSeed,
        description: _description,
      })
      .catch(() => {
        setError("Wystąpił nieznany błąd, spróbuj ponownie");
        csrfToken.refetch();
      });
  };

  return isLoading || !data ? (
    <Layout title="Ustawienia" nickname={nickname}>
      <div className="flex items-center justify-center h-full">
        <Spinner _className="h-20 w-20" />
      </div>
    </Layout>
  ) : (
    <Layout title="Ustawienia konta" nickname={nickname}>
      <h3 className="text-4xl font-semibold text-secondary">Ustawienia</h3>
      <div className="flex flex-col gap-y-2">
        <section className="flex flex-col">
          <h4 className="text-3xl font-medium text-secondary">Avatar</h4>
          <div className="flex items-center gap-x-2">
            <Avatar
              data={{
                nickname: data.nickname,
                avatarSeed: avatarSeed ?? data.avatarSeed,
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
      <ErrorDialog isOpen={error !== false} onClose={() => setError(false)}>
        {error}
      </ErrorDialog>
    </Layout>
  );
};

export const getServerSideProps = async ({
  req,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const auth = await isUserLoggedIn(req);
  if (!auth?.session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: { nickname: auth.session.user.nickname } };
};

export default Settings;
