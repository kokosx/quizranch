import { Kit } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";

import { useRouter } from "next/router";
import { useState } from "react";

import { KitData } from "../types";

import { csrfHeader, trpc } from "../utils/trpc";
import { serializeKitRouterError } from "../utils/zodErrors";

const KitEditor = ({
  csrfToken,
  initialData,
}: {
  csrfToken: string;
  initialData?: Kit & { data: KitData[] };
}) => {
  const [data, setData] = useState<KitData[]>(initialData?.data ?? []);
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [error, setError] = useState<false | string>(false);
  const [loading, setLoading] = useState(false);
  //TRPC Mutations
  const addKit = trpc.notes.addKit.useMutation();
  const modifyKit = trpc.notes.editKitById.useMutation();
  const deleteKit = trpc.notes.deleteKitById.useMutation();

  const [deleteModal, setDeleteModal] = useState(false);

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
    //Set csrf
    csrfHeader.value = csrfToken;
    //Edit
    if (initialData) {
      try {
        await modifyKit.mutateAsync({
          data,
          name,
          description,
          kitId: initialData.id,
        });

        router.push(`/kit/${initialData.id}`);
      } catch (error) {
        if (error instanceof TRPCClientError) {
          //If failed, generate new token from getServerSideProps
          router.replace(router.asPath);
          setError(serializeKitRouterError(error));
        }
      }
    } else {
      //Else create new
      try {
        const res = await addKit.mutateAsync({ data, name, description });

        router.push(`/kit/${res.note.id}`);
      } catch (error) {
        if (error instanceof TRPCClientError) {
          //If failed, generate new token from getServerSideProps
          router.replace(router.asPath);
          setError(serializeKitRouterError(error));
        }
      }
    }

    setLoading(false);
  };

  const handleDeleteKit = async () => {
    csrfHeader.value = csrfToken;
    try {
      //@ts-expect-error
      await deleteKit.mutateAsync({ kitId: initialData.id });
      router.push("/");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        router.replace(router.asPath);
        setError(serializeKitRouterError(error));
      }
    }
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
    <>
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

        <span className="flex gap-x-2">
          <button
            onClick={addNote}
            className={`btn btn-primary ${loading && "loading"}`}
          >
            Zatwierdź
          </button>
          {initialData && (
            <>
              <div
                onClick={() => setDeleteModal(false)}
                className={`cursor-pointer modal ${
                  deleteModal && "modal-open"
                }`}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative modal-box"
                >
                  <h3 className="text-lg font-bold">
                    Czy na pewno chcesz usunąć zestaw?
                  </h3>
                  <div className="flex justify-center gap-x-2">
                    <button
                      onClick={() => setDeleteModal(false)}
                      className="btn btn-primary"
                    >
                      Nie
                    </button>
                    <button
                      onClick={() => handleDeleteKit()}
                      className="btn btn-secondary"
                    >
                      Tak
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDeleteModal(true)}
                className="btn btn-error"
              >
                Usuń
              </button>
            </>
          )}
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
    </>
  );
};

export default KitEditor;
