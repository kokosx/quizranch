import { TRPCClientError } from "@trpc/client";

import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/layout";

//import { useRouter } from "next/navigation";
import { generateCSRFToken, isUserLoggedIn } from "../services/auth.service";
import { KitData } from "../types";

import { csrfHeader, trpc } from "../utils/trpc";
import { serializeKitRouterError } from "../utils/zodErrors";

const Add = ({ csrfToken }: { csrfToken: string }) => {
  const [data, setData] = useState<KitData[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<false | string>(false);
  const [loading, setLoading] = useState(false);
  const addKit = trpc.notes.addNote.useMutation();

  const router = useRouter();

  const addNote = async () => {
    if (name.length < 3) {
      setError("Nazwa musi mieć przynajmniej 3 znaki");
      return;
    }
    if (data.length < 2) {
      setError("Zestaw musi mieć przynjamniej 2 pytania");
      return;
    }
    setLoading(true);
    csrfHeader.value = csrfToken;
    try {
      await addKit.mutateAsync({ data, name, description });
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        //If failed, generate new token from getServerSideProps
        router.replace(router.asPath);
        setError(serializeKitRouterError(error));
      }
    }
    setLoading(false);
  };

  const addNewItem = () => {
    setData((prev) => [...prev, { answer: "", question: "" }]);
  };

  const deleteItem = (index: number) => {
    const prev = [...data];
    const toAdd = prev.filter((_, i) => i !== index);
    setData(toAdd);
  };

  const modifyItem = (
    index: number,
    part: "question" | "answer",
    newValue: string
  ) => {
    const toAdd = [...data];
    toAdd[index][part] = newValue;
    setData(toAdd);
  };

  return (
    <Layout title="Dodaj nowy zestaw" user>
      <h2 className="text-4xl font-semibold text-secondary">
        Dodaj nowy zestaw
      </h2>
      <div className="flex flex-col mt-4 gap-y-4">
        <div className="form-control">
          <label className="input-group">
            <span className="flex items-center justify-center w-28 ">
              Nazwa
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Nazwa..."
              className="w-full max-w-md input input-bordered"
            />
          </label>
        </div>
        <div className="form-control">
          <label className="flex input-group">
            <span className="flex items-center justify-center w-28">Opis</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opis..."
              className="w-full max-w-md textarea textarea-bordered"
            />
          </label>
        </div>

        <span>
          <button className="btn btn-neutral min-w-min" onClick={addNewItem}>
            Dodaj pytanie
          </button>
        </span>
        {data.map((v, i) => (
          <div
            className="flex flex-col gap-2 p-2 border-2 rounded-md border-neutral md:items-center md:flex-row"
            key={i}
          >
            <label>Pytanie</label>
            <input
              value={data[i].question}
              onChange={(e) => modifyItem(i, "question", e.target.value)}
              type="text"
              className="w-full input input-bordered"
            />
            <label>Odpowiedź</label>
            <input
              onChange={(e) => modifyItem(i, "answer", e.target.value)}
              value={data[i].answer}
              type="text"
              className="w-full input input-bordered"
            />
            <button
              onClick={() => deleteItem(i)}
              className="btn btn-circle btn-error"
            >
              X
            </button>
          </div>
        ))}

        <span>
          <button
            onClick={addNote}
            className={`btn btn-primary ${loading && "loading"}`}
          >
            Zatwierdź
          </button>
        </span>
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

export default Add;

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ csrfToken: string }>> => {
  const session = await isUserLoggedIn(ctx.req);
  if (!session) {
    return { redirect: { destination: "/", permanent: false } };
  }

  if (session.user.kits.length >= 5) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  const csrfToken = await generateCSRFToken(session.id);
  return { props: { csrfToken } };
};
