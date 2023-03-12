import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Link from "next/link";
import { FormEvent, useState } from "react";
import Layout from "../components/layout";
import ErrorDialog from "../components/styled/ErrorDialog";
import { isUserLoggedIn } from "../services/auth.service";
import { trpc } from "../utils/trpc";

type Props = {
  nickname: string;
};

const BugReport = ({ nickname }: Props) => {
  const addReport = trpc.errorReport.addReport.useMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<false | string>(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (description.length > 1000) {
      setError("Opis nie może być dluższy niż 1000 znaków");
      return;
    }
    if (title.length < 5 || title.length > 200) {
      setError("Tytuł musi mieć pomiędzy 5 a 20 znaków");
      return;
    }
    addReport.mutateAsync({ description, title }).catch(() => {
      setError("Wystąpił błąd");
    });
  };

  if (addReport.isSuccess) {
    return (
      <Layout nickname={nickname} title="Zgłoś błąd">
        <div className="flex flex-col gap-y-2">
          <h3 className="text-3xl font-semibold text-secondary">
            Dziękuje za pomoc!
          </h3>
          <Link href="/dashboard" className="btn max-w-fit">
            Powrót na ekran główny
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout nickname={nickname} title="Zgłoś błąd">
      <h3 className="text-3xl font-semibold text-secondary">Zgłoś błąd</h3>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full h-full mt-2 md:w-1/2 gap-y-2"
      >
        <div className="form-control">
          <label className="input-group">
            <span>Tytuł</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="w-full input input-bordered"
            />
          </label>
        </div>

        <div className="form-control">
          <label className="input-group">
            <span>Opis</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-48 p-2 input input-bordered"
            />
          </label>
        </div>
        <button disabled={addReport.isLoading} className="btn max-w-fit">
          Zgłoś
        </button>
      </form>
      <ErrorDialog isOpen={error !== false} onClose={() => setError(false)}>
        {error}
      </ErrorDialog>
    </Layout>
  );
};

export default BugReport;

export const getServerSideProps = async ({
  req,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const auth = await isUserLoggedIn(req);
  if (!auth?.session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { nickname: auth.session.user.nickname } };
};
