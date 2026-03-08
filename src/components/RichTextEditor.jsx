import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {TextStyle} from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    Quote,
    Code,
    Undo,
    Redo,
    Strikethrough,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight
} from "lucide-react";

const RichTextEditor = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            Link.configure({ openOnClick: false }),
            TextAlign.configure({
                types: ["heading", "paragraph"]
            })
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm dark:prose-invert tiptap focus:outline-none min-h-[150px] p-4 max-w-none text-slate-900 dark:text-slate-100"
            }
        }
    });

    if (!editor) return null;

    const setLink = () => {
        const url = window.prompt("Enter URL");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };
    const getHeadingValue = () => {
        if (editor.isActive("heading", { level: 1 })) return "1";
        if (editor.isActive("heading", { level: 2 })) return "2";
        if (editor.isActive("heading", { level: 3 })) return "3";
        return "paragraph";
    };
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800/50">

            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                >
                    <Bold size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                >
                    <Italic size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                >
                    <UnderlineIcon size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive("strike")}
                >
                    <Strikethrough size={16} />
                </ToolbarButton>

                {/* Heading Dropdown */}
                <select
                    className="px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={getHeadingValue()}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "paragraph") {
                            editor.chain().focus().setParagraph().run();
                        } else {
                            // We use toggleHeading to switch to that specific level
                            editor.chain().focus().toggleHeading({ level: Number(val) }).run();
                        }
                    }}
                >
                    <option value="paragraph">Paragraph</option>
                    <option value="1">H1</option>
                    <option value="2">H2</option>
                    <option value="3">H3</option>
                </select>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                >
                    <List size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                >
                    <ListOrdered size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                >
                    <Quote size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive("codeBlock")}
                >
                    <Code size={16} />
                </ToolbarButton>

                <ToolbarButton onClick={setLink}>
                    <LinkIcon size={16} />
                </ToolbarButton>

                {/* Alignment */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                >
                    <AlignLeft size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                >
                    <AlignCenter size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                >
                    <AlignRight size={16} />
                </ToolbarButton>

                {/* Undo / Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    <Undo size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    <Redo size={16} />
                </ToolbarButton>

                <input
                    type="color"
                    className="w-8 h-8 border-none bg-transparent cursor-pointer"
                    onChange={(e) =>
                        editor.chain().focus().setColor(e.target.value).run()
                    }
                    title="Text Color"
                />

            </div>

            <EditorContent editor={editor} />
        </div>
    );
};

const ToolbarButton = ({ onClick, active, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors ${active
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
    >
        {children}
    </button>
);

export default RichTextEditor;