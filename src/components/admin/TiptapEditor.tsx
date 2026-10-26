"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useState, useCallback, useEffect } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder = "Start writing..." }: TiptapEditorProps) {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      ImageExtension.configure({ allowBase64: true, inline: false }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[400px] px-4 py-3 outline-none font-body text-on-surface [&_h2]:font-headline [&_h2]:text-2xl [&_h2]:text-primary [&_h3]:font-headline [&_h3]:text-xl [&_h3]:text-on-surface [&_a]:text-primary [&_a]:underline [&_img]:rounded-lg [&_img]:max-w-full [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadImage(file).then((url) => {
              if (url) {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                if (pos) {
                  const tr = view.state.tr.insert(pos.pos, node);
                  view.dispatch(tr);
                }
              }
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch {}
    // Fallback: use data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file && editor) {
        const url = await uploadImage(file);
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const toggleSource = () => {
    if (isSourceMode) {
      // Switch back to visual — apply source code changes
      editor?.commands.setContent(sourceCode);
      onChange(sourceCode);
    } else {
      // Switch to source — get current HTML
      setSourceCode(editor?.getHTML() || "");
    }
    setIsSourceMode(!isSourceMode);
  };

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive = false,
    icon,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    icon: string;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-surface-container transition-colors ${
        isActive ? "bg-primary/10 text-primary" : "text-on-surface-variant"
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );

  return (
    <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-surface-container-low flex-wrap">
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} icon="title" title="Heading 2" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} icon="format_h3" title="Heading 3" />

        <div className="w-px h-5 bg-outline-variant/30 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} icon="format_bold" title="Bold" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} icon="format_italic" title="Italic" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} icon="format_underlined" title="Underline" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} icon="strikethrough_s" title="Strikethrough" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive("highlight")} icon="ink_highlighter" title="Highlight" />

        <div className="w-px h-5 bg-outline-variant/30 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} icon="format_list_bulleted" title="Bullet List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} icon="format_list_numbered" title="Numbered List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} icon="format_quote" title="Blockquote" />

        <div className="w-px h-5 bg-outline-variant/30 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} icon="format_align_left" title="Align Left" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} icon="format_align_center" title="Align Center" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} icon="format_align_right" title="Align Right" />

        <div className="w-px h-5 bg-outline-variant/30 mx-1" />

        <ToolbarButton onClick={addImage} icon="image" title="Insert Image (drag & drop also supported)" />
        <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} icon="link" title="Add Link" />
        {editor.isActive("link") && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} icon="link_off" title="Remove Link" />
        )}
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon="horizontal_rule" title="Horizontal Rule" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} icon="code" title="Code Block" />

        <div className="flex-1" />

        {/* Source/Visual Toggle */}
        <button
          type="button"
          onClick={toggleSource}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-label font-semibold transition-colors ${
            isSourceMode
              ? "bg-primary text-on-primary"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">{isSourceMode ? "visibility" : "code"}</span>
          {isSourceMode ? "Visual" : "HTML"}
        </button>
      </div>

      {/* Editor / Source */}
      {isSourceMode ? (
        <textarea
          value={sourceCode}
          onChange={(e) => {
            setSourceCode(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-[400px] p-4 font-mono text-sm text-on-surface bg-[#1b1c1c] text-green-400 outline-none resize-y"
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
