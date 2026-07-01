"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { InquiryForm } from "@/components/site/inquiry-form";
import { useLenis } from "@/components/site/smooth-scroll-provider";
import { mediaUrl } from "@/lib/utils";

type ProductEnquiryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productTitle: string;
  imagePath?: string | null;
};

export function ProductEnquiryModal({
  open,
  onOpenChange,
  productId,
  productTitle,
  imagePath,
}: ProductEnquiryModalProps) {
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
        className="esth-enquiry-modal shadow-none sm:rounded-sm"
        data-lenis-prevent
      >
        <div className="esth-enquiry-modal-header">
          {imagePath ? (
            <div className="esth-enquiry-modal-image">
              <Image
                src={mediaUrl(imagePath)}
                alt={productTitle}
                fill
                className="object-contain"
                sizes="140px"
              />
            </div>
          ) : null}
          <div className="esth-enquiry-modal-heading">
            <p className="esth-enquiry-modal-eyebrow">Send enquiry for</p>
            <DialogTitle className="esth-enquiry-modal-title">{productTitle}</DialogTitle>
          </div>
        </div>

        <div className="esth-enquiry-modal-body">
          <InquiryForm
            variant="modal"
            productId={productId}
            type="PRODUCT"
            defaultSubject={productTitle}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
