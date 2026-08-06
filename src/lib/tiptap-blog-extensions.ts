import StarterKit from "@tiptap/starter-kit";
import { ListItem } from "@tiptap/extension-list";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import type { Extensions } from "@tiptap/core";

/** Allow <li><h4>…</h4><p>…</p></li> — default TipTap requires paragraph-first. */
export const FlexibleListItem = ListItem.extend({
  content: "block+",
});

type BlogEditorOptions = {
  /** Regional intro HTML with headings inside list items. Default false for normal blog lists. */
  flexibleListItems?: boolean;
};

/** Shared TipTap schema for blog admin + generateHTML on the front. */
export function getBlogEditorExtensions(options?: BlogEditorOptions): Extensions {
  const flexibleListItems = options?.flexibleListItems ?? false;

  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      listItem: false,
      link: false,
    }),
    flexibleListItems ? FlexibleListItem : ListItem,
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false, allowBase64: false }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
  ];
}
