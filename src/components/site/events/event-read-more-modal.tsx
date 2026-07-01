"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ContentRenderer } from "@/components/site/content-renderer";
import { useLenis } from "@/components/site/smooth-scroll-provider";

type EventReadMoreModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  html: string;
};

export function EventReadMoreModal({
  open,
  onOpenChange,
  title,
  html,
}: EventReadMoreModalProps) {
  const lenis = useLenis();

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
        className="esth-event-readmore-modal border border-[#ece4de] bg-white p-0 shadow-2xl sm:max-w-2xl sm:rounded-sm"
        data-lenis-prevent
      >
        <DialogTitle className="esth-event-readmore-modal-title">{title}</DialogTitle>
        <div className="esth-event-readmore-modal-body">
          <ContentRenderer content={html} className="esth-event-readmore-content" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
