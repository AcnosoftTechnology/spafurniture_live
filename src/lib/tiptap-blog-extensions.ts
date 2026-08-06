import StarterKit from "@tiptap/starter-kit";
import { ListItem } from "@tiptap/extension-list";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import type { Extensions } from "@tiptap/core";

/** Allow <li><h4>…</h4><p>…</p></li> — default TipTap requires paragraph-first. */
export const FlexibleListItem = ListItem.extend({
  content: "block+",
});

/** Shared TipTap schema for blog admin + generateHTML on the front. */
export function getBlogEditorExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      listItem: false,
    }),
    FlexibleListItem,
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false, allowBase64: false }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
  ];
}
