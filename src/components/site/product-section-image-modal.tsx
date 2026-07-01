"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLenis } from "@/components/site/smooth-scroll-provider";
import { mediaUrl } from "@/lib/utils";

type ProductSectionImageModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  alt: string;
  title: string;
};

export function ProductSectionImageModal({
  open,
  onOpenChange,
  imageSrc,
  alt,
  title,
}: ProductSectionImageModalProps) {
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
        className="esth-section-image-modal border-0 bg-black/95 p-0 shadow-2xl sm:max-w-5xl sm:rounded-sm"
        data-lenis-prevent
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="esth-section-image-modal-frame">
          {open ? (
            <Image
              src={imageSrc}
              alt={alt}
              fill
              className="esth-section-image-modal-img"
              sizes="(max-width: 768px) 100vw, 90vw"
              priority
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
