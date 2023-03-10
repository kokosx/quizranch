import {
  IconArrowBack,
  IconArrowForward,
  IconBold,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconItalic,
  IconList,
  IconListNumbers,
  IconNewSection,
  IconQuote,
  IconSeparator,
  IconStrikethrough,
} from "@tabler/icons-react";
import { type Editor } from "@tiptap/react";

const TextEditorBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const btnClassName = (node: string, attr?: any) =>
    `btn btn-sm ${editor.isActive(node, attr) ? "btn-primary" : ""}`;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={btnClassName("bold")}
      >
        <IconBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={btnClassName("italic")}
      >
        <IconItalic />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={btnClassName("strike")}
      >
        <IconStrikethrough />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClassName("heading", { level: 1 })}
      >
        <IconH1 />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClassName("heading", { level: 2 })}
      >
        <IconH2 />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClassName("heading", { level: 3 })}
      >
        <IconH3 />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={btnClassName("heading", { level: 4 })}
      >
        <IconH4 />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClassName("bulletList")}
      >
        <IconList />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClassName("orderedList")}
      >
        <IconListNumbers />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btnClassName("codeBlock")}
      >
        <IconCode />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClassName("blockquote")}
      >
        <IconQuote />
      </button>
      <button
        className="btn btn-sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <IconSeparator />
      </button>

      <button
        className="btn btn-sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <IconArrowBack />
      </button>
      <button
        className="btn btn-sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <IconArrowForward />
      </button>
    </div>
  );
};

export default TextEditorBar;
