"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ListItem } from "@tiptap/extension-list";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Undo,
  Redo,
  ImageIcon,
  Quote,
  Minus,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, mediaUrl } from "@/lib/utils";
import { MediaPickerDialog, type MediaItem } from "@/components/admin/cms/media-picker-dialog";
import { uploadMediaFile } from "@/lib/admin-media-upload";
import { toast } from "sonner";

/** Allow <li><h4>…</h4><p>…</p></li> — default TipTap requires paragraph-first. */
const FlexibleListItem = ListItem.extend({
  content: "block+",
});

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
type HeadingLevel = (typeof HEADING_LEVELS)[number];
type BlockFormat = "paragraph" | `h${HeadingLevel}`;

function getActiveBlockFormat(editor: Editor): BlockFormat {
  for (const level of HEADING_LEVELS) {
    if (editor.isActive("heading", { level })) return `h${level}`;
  }
  return "paragraph";
}

function HeadingSelect({ editor }: { editor: Editor }) {
  const [block, setBlock] = useState<BlockFormat>(() => getActiveBlockFormat(editor));

  useEffect(() => {
    const sync = () => setBlock(getActiveBlockFormat(editor));
    editor.on("selectionUpdate", sync);
    editor.on("transaction", sync);
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("transaction", sync);
    };
  }, [editor]);

  return (
    <Select
      value={block}
      onValueChange={(value) => {
        const format = value as BlockFormat;
        if (format === "paragraph") {
          editor.chain().focus().setParagraph().run();
        } else {
          const level = Number(format.slice(1)) as HeadingLevel;
          editor.chain().focus().setHeading({ level }).run();
        }
        setBlock(format);
      }}
    >
      <SelectTrigger
        className="h-8 w-[7.25rem] border-0 bg-transparent px-2 text-xs shadow-none focus:ring-0"
        aria-label="Heading level"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="paragraph">Paragraph</SelectItem>
        {HEADING_LEVELS.map((level) => (
          <SelectItem key={level} value={`h${level}`}>
            Heading {level}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type RichTextEditorProps = {
  value?: unknown;
  onChange: (json: unknown) => void;
  onPlainTextChange?: (text: string) => void;
  /** Fired on each edit with serialized HTML (for legacy/page SEO storage). */
  onHtmlChange?: (html: string) => void;
  placeholder?: string;
  /**
   * Keep string HTML as the source of truth.
   * Source mode saves raw HTML without TipTap rewriting it.
   */
  preserveHtml?: boolean;
  /** Open in HTML source mode (recommended with preserveHtml). */
  defaultSourceMode?: boolean;
};

export function RichTextEditor({
  value,
  onChange,
  onPlainTextChange,
  onHtmlChange,
  placeholder,
  preserveHtml = false,
  defaultSourceMode = false,
}: RichTextEditorProps) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [sourceMode, setSourceMode] = useState(defaultSourceMode);
  const [sourceHtml, setSourceHtml] = useState(() =>
    typeof value === "string" ? value : "",
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const lastAppliedRawRef = useRef<string | null>(null);
  const stringValue = typeof value === "string" ? value : null;

  const initialContent =
    typeof value === "string" ? value : (value as object | undefined);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        listItem: false,
      }),
      FlexibleListItem,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON());
      onPlainTextChange?.(ed.getText().replace(/\s+/g, " ").trim());
      if (!preserveHtml || !sourceMode) {
        onHtmlChange?.(ed.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor || value == null || sourceMode) return;

    if (typeof value === "string") {
      if (preserveHtml) {
        if (lastAppliedRawRef.current === value) return;
        lastAppliedRawRef.current = value;
        editor.commands.setContent(value, { emitUpdate: false });
        return;
      }

      const html = value.trim();
      if (html && editor.getHTML() !== html) {
        editor.commands.setContent(html, { emitUpdate: false });
      }
      return;
    }

    if (typeof value === "object" && JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value as object, { emitUpdate: false });
    }
  }, [value, editor, sourceMode, preserveHtml]);

  const commitSourceHtml = useCallback(
    (html: string) => {
      setSourceHtml(html);
      lastAppliedRawRef.current = html;
      onHtmlChange?.(html);
      if (editor && !preserveHtml) {
        editor.commands.setContent(html, { emitUpdate: false });
        onChange(editor.getJSON());
        onPlainTextChange?.(editor.getText().replace(/\s+/g, " ").trim());
      }
    },
    [editor, onChange, onHtmlChange, onPlainTextChange, preserveHtml],
  );

  const applySourceHtml = useCallback(() => {
    if (!editor) return;
    lastAppliedRawRef.current = sourceHtml;
    // Always persist the raw source first — do not replace with TipTap's getHTML().
    onHtmlChange?.(sourceHtml);
    editor.commands.setContent(sourceHtml, { emitUpdate: false });
    onChange(editor.getJSON());
    onPlainTextChange?.(editor.getText().replace(/\s+/g, " ").trim());
  }, [editor, onChange, onHtmlChange, onPlainTextChange, sourceHtml]);

  const toggleSourceMode = useCallback(() => {
    if (!editor) return;
    if (!sourceMode) {
      const raw =
        preserveHtml && stringValue != null ? stringValue : editor.getHTML();
      setSourceHtml(raw);
      setSourceMode(true);
      return;
    }
    applySourceHtml();
    setSourceMode(false);
  }, [applySourceHtml, editor, preserveHtml, sourceMode, stringValue]);

  const insertImage = useCallback(
    (src: string, alt?: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src, alt: alt ?? "" }).run();
    },
    [editor],
  );

  async function uploadFile(file: File) {
    const result = await uploadMediaFile(file);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    const item = result.data;
    insertImage(mediaUrl(item.webpPath ?? item.path), item.alt ?? undefined);
    toast.success("Image inserted");
  }

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return <div className="h-80 animate-pulse rounded-lg bg-stone-100" />;

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
    { icon: Link2, action: setLink, active: editor.isActive("link") },
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false },
  ];

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <div className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center gap-0.5 border-b border-stone-200 bg-stone-50/95 p-1.5 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/95">
          <HeadingSelect editor={editor} />
          <div className="mx-0.5 h-6 w-px bg-stone-200" />
          {tools.map(({ icon: Icon, action, active }, i) => (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="icon"
              disabled={sourceMode}
              className={cn("h-8 w-8", active && "bg-stone-200 dark:bg-stone-800")}
              onClick={action}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
          ))}
          <div className="mx-1 h-6 w-px bg-stone-200" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-8 gap-1 text-xs", sourceMode && "bg-stone-200 dark:bg-stone-800")}
            onClick={toggleSourceMode}
          >
            <Code2 className="h-3.5 w-3.5" />
            {sourceMode ? "Visual" : "Source"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            disabled={sourceMode}
            onClick={() => fileRef.current?.click()}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Upload
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            disabled={sourceMode}
            onClick={() => setMediaOpen(true)}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Media library
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
        {preserveHtml && sourceMode ? (
          <p className="border-b border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] leading-snug text-amber-900">
            Source HTML saves exactly as typed. Switch to Visual only for simple edits — complex lists
            with headings are safest in Source.
          </p>
        ) : null}
        <div className="relative max-h-[min(50vh,28rem)] overflow-y-auto overscroll-contain">
          {sourceMode ? (
            <textarea
              value={sourceHtml}
              onChange={(e) => {
                if (preserveHtml) {
                  commitSourceHtml(e.target.value);
                } else {
                  setSourceHtml(e.target.value);
                }
              }}
              spellCheck={false}
              className={cn(
                "min-h-[12rem] w-full resize-y border-0 bg-white px-4 py-3 font-mono text-xs leading-relaxed text-stone-800",
                "outline-none focus:ring-0 dark:bg-stone-950 dark:text-stone-100",
              )}
              aria-label="HTML source code"
              placeholder="<p>Paste or edit HTML here…</p>"
            />
          ) : (
            <EditorContent
              editor={editor}
              className={cn(
                "[&_.tiptap]:prose [&_.tiptap]:prose-sm [&_.tiptap]:max-w-none [&_.tiptap]:min-h-[12rem]",
                "[&_.tiptap]:px-4 [&_.tiptap]:py-3 [&_.tiptap]:outline-none dark:[&_.tiptap]:prose-invert",
                "[&_.tiptap_h1]:text-2xl [&_.tiptap_h2]:text-xl [&_.tiptap_h3]:text-lg",
                "[&_.tiptap_h4]:text-base [&_.tiptap_h5]:text-sm [&_.tiptap_h6]:text-sm",
                "[&_.tiptap_img]:max-w-full [&_.tiptap_img]:rounded-md",
              )}
            />
          )}
          {!sourceMode && placeholder && editor.isEmpty && (
            <p className="pointer-events-none absolute left-4 top-3 text-sm text-stone-400">
              {placeholder}
            </p>
          )}
        </div>
      </div>

      <MediaPickerDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={(m: MediaItem) => {
          insertImage(mediaUrl(m.webpPath ?? m.path), m.alt ?? m.filename);
          setMediaOpen(false);
        }}
      />
    </>
  );
}
