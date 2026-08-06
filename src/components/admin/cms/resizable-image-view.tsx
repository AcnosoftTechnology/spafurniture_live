"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 80;
const MAX_WIDTH = 1200;

type Corner = "nw" | "ne" | "sw" | "se";

export function ResizableImageView({ node, selected, updateAttributes, editor }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const dragging = useRef<{
    corner: Corner;
    startX: number;
    startWidth: number;
  } | null>(null);

  const widthAttr = node.attrs.width as number | string | null;
  const widthPx =
    typeof widthAttr === "number"
      ? widthAttr
      : typeof widthAttr === "string" && /^\d+$/.test(widthAttr)
        ? Number(widthAttr)
        : null;

  const onImgLoad = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    setNaturalWidth(el.naturalWidth || null);
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const drag = dragging.current;
      if (!drag) return;
      e.preventDefault();
      const delta =
        drag.corner === "ne" || drag.corner === "se"
          ? e.clientX - drag.startX
          : drag.startX - e.clientX;
      const next = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, Math.round(drag.startWidth + delta)),
      );
      updateAttributes({ width: next });
    }

    function onUp() {
      dragging.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [updateAttributes]);

  function startResize(corner: Corner, e: ReactMouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!editor.isEditable) return;
    const current =
      widthPx ??
      imgRef.current?.getBoundingClientRect().width ??
      naturalWidth ??
      400;
    dragging.current = { corner, startX: e.clientX, startWidth: current };
    document.body.style.cursor = corner === "ne" || corner === "sw" ? "nesw-resize" : "nwse-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <NodeViewWrapper
      as="div"
      className={cn(
        "tiptap-image-node relative my-3 inline-block max-w-full leading-none",
        selected && "is-selected",
      )}
      data-drag-handle
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={node.attrs.src as string}
        alt={(node.attrs.alt as string) || ""}
        title={(node.attrs.title as string) || undefined}
        width={widthPx ?? undefined}
        onLoad={onImgLoad}
        draggable={false}
        className={cn(
          "block h-auto max-w-full rounded-sm",
          selected && "outline outline-2 outline-offset-2 outline-sky-500",
        )}
        style={widthPx ? { width: `${widthPx}px` } : undefined}
      />
      {selected && editor.isEditable ? (
        <>
          {(["nw", "ne", "sw", "se"] as Corner[]).map((corner) => (
            <button
              key={corner}
              type="button"
              aria-label={`Resize ${corner}`}
              className={cn(
                "absolute z-10 h-3 w-3 rounded-sm border-2 border-sky-500 bg-white shadow",
                corner === "nw" && "-left-1.5 -top-1.5 cursor-nwse-resize",
                corner === "ne" && "-right-1.5 -top-1.5 cursor-nesw-resize",
                corner === "sw" && "-bottom-1.5 -left-1.5 cursor-nesw-resize",
                corner === "se" && "-bottom-1.5 -right-1.5 cursor-nwse-resize",
              )}
              onMouseDown={(e) => startResize(corner, e)}
            />
          ))}
          {widthPx ? (
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-1.5 py-0.5 text-[10px] text-white">
              {widthPx}px
            </span>
          ) : null}
        </>
      ) : null}
    </NodeViewWrapper>
  );
}
