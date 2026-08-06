"use client";

import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageBase } from "@/lib/tiptap-resizable-image";
import { ResizableImageView } from "@/components/admin/cms/resizable-image-view";

/** Admin editor image with click-to-select + corner resize handles. */
export const ResizableImage = ResizableImageBase.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
}).configure({ inline: false, allowBase64: false });
