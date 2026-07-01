"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLenis } from "@/components/site/smooth-scroll-provider";
import { youtubeEmbedUrl } from "@/lib/youtube";

type ProductYoutubeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
  title: string;
};

export function ProductYoutubeModal({
  open,
  onOpenChange,
  videoId,
  title,
}: ProductYoutubeModalProps) {
  const lenis = useLenis();
  const [embedOrigin, setEmbedOrigin] = useState("");

  useEffect(() => {
    if (open) setEmbedOrigin(window.location.origin);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prevOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [open, lenis]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        mobileSheet
        className="esth-youtube-modal border-0 bg-black p-0 shadow-2xl sm:max-w-4xl sm:rounded-sm"
        data-lenis-prevent
      >
        <DialogTitle className="sr-only">{title} — product video</DialogTitle>
        <div className="esth-youtube-modal-frame">
          {open ? (
            <iframe
              src={youtubeEmbedUrl(videoId, embedOrigin)}
              title={`${title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="esth-youtube-modal-iframe"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
