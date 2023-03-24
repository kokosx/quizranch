import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import TextStyle from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";
import { MAX_NOTE_LENGTH, MAX_NOTE_NAME_LENGTH } from "../constants";

import { type FormEvent, useEffect, useState } from "react";
import type { NoteVisibility } from "../server/routers/notes.router";
import { csrfHeader, trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import type { Note } from "@prisma/client";
import TextEditorBar from "./TextEditorBar";
import ErrorDialog from "./styled/ErrorDialog";

type Props = {
  initialNote: Note | null;
  canEdit: boolean;
  userId: string | null;
};

const TextEditor = ({ initialNote, userId, canEdit }: Props) => {
  const editor = useEditor({
    editable: canEdit,
    extensions: [
      TextStyle,
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
      }),

      CharacterCount.configure({ limit: MAX_NOTE_LENGTH }),
    ],
    content: initialNote?.data ?? "",
    editorProps: {
      attributes: {
        class:
          "prose min-h-[400px] border-2 p-2 rounded-md border-secondary dark:prose-invert prose-sm sm:prose outline-none lg:prose-lg xl:prose-2xl",
      },
    },
  });

  const csrfToken = trpc.auth.getCSRFToken.useQuery(undefined, {
    enabled: canEdit,
  });

  const updateNote = trpc.note.updateNote.useMutation();
  const addNote = trpc.note.addNote.useMutation();
  const deleteNote = trpc.note.deleteNote.useMutation();
  const [error, setError] = useState<string | false>(false);
  const router = useRouter();
  const [canSave, setCanSave] = useState(false);
  const [name, setName] = useState(initialNote?.name ?? "");
  const [visibility, setVisibility] = useState<NoteVisibility>(
    initialNote?.visibility ?? "PRIVATE"
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(
      csrfToken.isLoading ||
        updateNote.isLoading ||
        addNote.isLoading ||
        deleteNote.isLoading
    );
  }, [
    csrfToken.isLoading,
    updateNote.isLoading,
    addNote.isLoading,
    deleteNote.isLoading,
  ]);

  useEffect(() => {
    //Disallow saving if length is too big(shouldnt happen)
    /*if (editor?.getText().length ?? 0 > MAX_NOTE_LENGTH) {
      setCanSave(false);
      return;
    } else {
      setCanSave(true);
    }*/
    //Disaloww saving if nothing changed

    //Disallow saving if name is not present
    if (name) {
      setCanSave(true);
    } else {
      setCanSave(false);
      return;
    }
    //Disallow when loading token
    if (csrfToken.isLoading) {
      setCanSave(false);
      return;
    } else {
      setCanSave(true);
    }
  }, [
    editor,
    initialNote?.data,
    initialNote?.name,
    name,
    csrfToken.isLoading,
    setCanSave,
  ]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    csrfHeader.value = csrfToken?.data?.id;

    //Handle adding new note
    if (!initialNote && userId && canEdit) {
      try {
        const res = await addNote.mutateAsync({
          createdBy: userId,
          data: editor?.getHTML() ?? "",
          name,
          visibility,
        });
        router.push(`/note/${res.id}`);
      } catch (error) {
        csrfToken.refetch();
        setError("Wystąpił błąd");
      }
    }
    //Handle editing
    else if (userId && canEdit && initialNote) {
      try {
        const res = await updateNote.mutateAsync({
          noteId: initialNote.id,
          data: editor?.getHTML() ?? "",
          name,
          visibility,
        });
        router.push(`/note/${res.id}`);
      } catch (error) {
        csrfToken.refetch();
        setError("Wystąpił błąd");
      }
    }
  };

  const handleDelete = async () => {
    if (!initialNote) {
      return;
    }
    try {
      csrfHeader.value = csrfToken.data?.id;
      await deleteNote.mutateAsync({ noteId: initialNote.id });
      router.push("/dashboard");
    } catch (error) {
      setError("Wystąpił błąd");
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-y-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center lg:flex-row gap-y-2 gap-x-4 "
      >
        <div className="self-start form-control">
          <label className="input-group ">
            <span>Nazwa</span>
            <input
              value={name}
              disabled={!canEdit}
              onChange={(e) =>
                setName(
                  e.target.value.length > MAX_NOTE_NAME_LENGTH
                    ? name
                    : e.target.value
                )
              }
              type="text"
              placeholder="Podaj nazwe..."
              className="input input-bordered"
            />
          </label>
        </div>
        <div className="flex items-center justify-start w-full gap-x-4">
          {canEdit && (
            <>
              <label htmlFor="share">Publiczny</label>
              <input
                checked={visibility === "PUBLIC"}
                onChange={() =>
                  setVisibility(visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC")
                }
                type="checkbox"
                id="share"
                className="checkbox"
              />

              <button
                disabled={!canSave}
                className={`btn btn-success ${isLoading && "loading"}`}
              >
                Zapisz
              </button>
              {initialNote && (
                <button
                  onClick={handleDelete}
                  type="button"
                  className={`btn btn-error ${isLoading && "loading"}`}
                >
                  Usuń
                </button>
              )}
            </>
          )}
        </div>
      </form>
      {canEdit && (
        <>
          <TextEditorBar editor={editor} />
          <span>Słowa: {editor?.storage.characterCount.words()}</span>
          <span>
            Znaki: {editor?.storage.characterCount.characters()} /{" "}
            {MAX_NOTE_LENGTH}
          </span>
        </>
      )}

      <EditorContent editor={editor} />
      <ErrorDialog isOpen={error !== false} onClose={() => setError(false)}>
        {error}
      </ErrorDialog>
    </div>
  );
};

export default TextEditor;
