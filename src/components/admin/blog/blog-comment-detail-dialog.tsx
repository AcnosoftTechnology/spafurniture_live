"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatIpGeo } from "@/lib/ip-geo";
import { blogPostPath } from "@/lib/blog-paths";

export type AdminBlogCommentDetail = {
  id: string;
  authorName: string;
  email: string;
  content: string;
  parentId: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
  ip: string | null;
  userAgent: string | null;
  pageUrl: string | null;
  geoCountry: string | null;
  geoRegion: string | null;
  geoCity: string | null;
  createdAt: string;
  post: { id: string; title: string; slug: string };
  parent?: { id: string; authorName: string; content: string; createdAt?: string } | null;
  moderatedBy?: { id: string; name: string | null } | null;
};

type BlogCommentDetailDialogProps = {
  comment: AdminBlogCommentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-stone-100 py-3 last:border-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">{label}</p>
      <div className="mt-1 text-sm text-stone-900">{children}</div>
    </div>
  );
}

export function BlogCommentDetailDialog({ comment, open, onOpenChange }: BlogCommentDetailDialogProps) {
  if (!comment) return null;

  const location = formatIpGeo(
    {
      country: comment.geoCountry ?? undefined,
      region: comment.geoRegion ?? undefined,
      city: comment.geoCity ?? undefined,
    },
    comment.ip,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">Comment details</DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          <DetailRow label="Status">
            <Badge
              variant={
                comment.status === "APPROVED"
                  ? "default"
                  : comment.status === "PENDING"
                    ? "secondary"
                    : "outline"
              }
            >
              {comment.status}
            </Badge>
          </DetailRow>

          <DetailRow label="Submitted at">
            {format(new Date(comment.createdAt), "EEEE, d MMMM yyyy 'at' h:mm a")}
          </DetailRow>

          <DetailRow label="Author">
            <p className="font-medium">{comment.authorName}</p>
            <p className="text-stone-600">{comment.email}</p>
          </DetailRow>

          <DetailRow label="Comment">
            <p className="whitespace-pre-wrap leading-relaxed">{comment.content}</p>
          </DetailRow>

          {comment.parent ? (
            <DetailRow label="Reply to">
              <p className="font-medium">{comment.parent.authorName}</p>
              <p className="mt-1 whitespace-pre-wrap text-stone-600">{comment.parent.content}</p>
            </DetailRow>
          ) : null}

          <DetailRow label="Post">
            <Link
              href={blogPostPath(comment.post.slug)}
              target="_blank"
              className="text-stone-800 underline hover:text-stone-950"
            >
              {comment.post.title}
            </Link>
          </DetailRow>

          <DetailRow label="Page URL">
            {comment.pageUrl ? (
              <a
                href={comment.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-stone-800 underline hover:text-stone-950"
              >
                {comment.pageUrl}
              </a>
            ) : (
              <span className="text-stone-500">—</span>
            )}
          </DetailRow>

          <DetailRow label="IP address">
            {comment.ip ?? <span className="text-stone-500">—</span>}
          </DetailRow>

          <DetailRow label="Location">
            {location}
          </DetailRow>

          <DetailRow label="Browser / device">
            {comment.userAgent ? (
              <p className="break-all text-stone-700">{comment.userAgent}</p>
            ) : (
              <span className="text-stone-500">—</span>
            )}
          </DetailRow>

          {comment.moderatedBy?.name ? (
            <DetailRow label="Moderated by">{comment.moderatedBy.name}</DetailRow>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
