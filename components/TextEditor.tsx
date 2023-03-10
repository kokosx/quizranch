import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import TextStyle from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";
import { MAX_NOTE_LENGTH, MAX_NOTE_NAME_LENGTH } from "../constants";

import { FormEvent, useEffect, useState } from "react";
import { NoteVisibility } from "../server/routers/notes.router";
import { csrfHeader, trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { Note } from "@prisma/client";
import TextEditorBar from "./TextEditorBar";

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
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();
  const [canSave, setCanSave] = useState(false);
  const [name, setName] = useState(initialNote?.name ?? "");
  const [visibility, setVisibility] = useState<NoteVisibility>(
    //TODO: FIX
    //@ts-expect-error
    initialNote?.visibility ?? "PRIVATE"
  );

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
    if (userId && canEdit && initialNote) {
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

  return (
    <div className="flex flex-col w-full h-full gap-y-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-x-4 ">
        <div className="form-control">
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
              disabled={addNote.isLoading || !canSave || updateNote.isLoading}
              className="btn btn-success"
            >
              Zapisz
            </button>
            {initialNote && <button className="btn btn-error">Usuń</button>}
          </>
        )}
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
      {error && (
        <div className="toast">
          <div className="alert alert-error">
            <div>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;