import Image from "@tiptap/extension-image";
import type { Extensions } from "@tiptap/core";

/**
 * Image with optional width (px) for WordPress-like resize.
 * NodeView (handles) is added only in the admin editor — see resizable-image-extension.tsx.
 */
export const ResizableImageBase = Image.extend({
  name: "image",
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const w =
            element.getAttribute("width") ||
            element.style.width?.replace(/px$/i, "");
          if (!w) return null;
          const n = Number.parseInt(w, 10);
          return Number.isFinite(n) ? n : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: String(attributes.width),
            style: `width: ${attributes.width}px; height: auto; max-width: 100%;`,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const h = element.getAttribute("height");
          if (!h) return null;
          const n = Number.parseInt(h, 10);
          return Number.isFinite(n) ? n : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: String(attributes.height) };
        },
      },
    };
  },
});

export function getResizableImageExtension(): Extensions[number] {
  return ResizableImageBase.configure({ inline: false, allowBase64: false });
}
