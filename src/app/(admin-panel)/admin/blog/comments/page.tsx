"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  BlogCommentDetailDialog,
  type AdminBlogCommentDetail,
} from "@/components/admin/blog/blog-comment-detail-dialog";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { ShimmerSkeleton } from "@/components/ui/skeleton";
import { formatIpGeo } from "@/lib/ip-geo";
import { blogPostPath } from "@/lib/blog-paths";

type Comment = AdminBlogCommentDetail;

const FILTERS = ["PENDING", "APPROVED", "REJECTED", "SPAM", "ALL"] as const;

export default function AdminBlogCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const query = filter === "ALL" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/v1/admin/blog/comments${query}`);
    const data = await res.json();
    setComments(data.data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function updateStatus(id: string, status: Comment["status"]) {
    await fetch(`/api/v1/admin/blog/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setComments((prev) =>
      filter === "ALL"
        ? prev.map((c) => (c.id === id ? { ...c, status } : c))
        : prev.filter((c) => c.id !== id),
    );
    if (selectedComment?.id === id) {
      setSelectedComment((prev) => (prev ? { ...prev, status } : prev));
    }
  }

  function openDetail(comment: Comment) {
    setSelectedComment(comment);
    setDetailOpen(true);
  }

  return (
    <>
      <AdminHeader title="Blog Comments" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === item
                  ? "bg-stone-900 text-white"
                  : "bg-stone-200 text-stone-700 hover:bg-stone-300"
              }`}
            >
              {item === "ALL" ? "All" : item.charAt(0) + item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <ShimmerSkeleton className="h-64" />
        ) : comments.length === 0 ? (
          <p className="text-sm text-stone-500">No comments in this view.</p>
        ) : (
          <DataTable>
            <table className="w-full">
              <DataTableHeader>
                <th className="px-4 py-3 text-left">Author</th>
                <th className="px-4 py-3 text-left">Comment</th>
                <th className="px-4 py-3 text-left">Post</th>
                <th className="px-4 py-3 text-left">Submitted</th>
                <th className="px-4 py-3 text-left">IP / Location</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </DataTableHeader>
              <DataTableBody>
                {comments.map((comment) => (
                  <DataTableRow key={comment.id}>
                    <DataTableCell>
                      <p className="font-medium">{comment.authorName}</p>
                      <p className="text-stone-500">{comment.email}</p>
                      {comment.parentId ? (
                        <p className="mt-1 text-xs text-stone-400">Reply</p>
                      ) : null}
                    </DataTableCell>
                    <DataTableCell className="max-w-xs">
                      <p className="line-clamp-3 text-sm">{comment.content}</p>
                      <button
                        type="button"
                        onClick={() => openDetail(comment)}
                        className="mt-2 text-xs font-medium text-stone-700 underline hover:text-stone-900"
                      >
                        View full comment
                      </button>
                    </DataTableCell>
                    <DataTableCell>
                      <Link
                        href={blogPostPath(comment.post.slug)}
                        className="text-sm text-stone-700 underline hover:text-stone-900"
                        target="_blank"
                      >
                        {comment.post.title}
                      </Link>
                    </DataTableCell>
                    <DataTableCell className="text-sm text-stone-600">
                      <p>{format(new Date(comment.createdAt), "d MMM yyyy, h:mm a")}</p>
                      <p className="text-xs text-stone-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </DataTableCell>
                    <DataTableCell className="text-sm text-stone-600">
                      <p>{comment.ip ?? "—"}</p>
                      <p className="text-xs text-stone-400">
                        {formatIpGeo(
                          {
                            country: comment.geoCountry ?? undefined,
                            region: comment.geoRegion ?? undefined,
                            city: comment.geoCity ?? undefined,
                          },
                          comment.ip,
                        )}
                      </p>
                    </DataTableCell>
                    <DataTableCell>
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
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => openDetail(comment)}
                          className="rounded border px-2 py-1 text-xs hover:bg-stone-100"
                        >
                          Details
                        </button>
                        <div className="flex flex-wrap gap-2">
                          {comment.status !== "APPROVED" ? (
                            <button
                              type="button"
                              onClick={() => updateStatus(comment.id, "APPROVED")}
                              className="rounded bg-emerald-700 px-2 py-1 text-xs text-white hover:bg-emerald-800"
                            >
                              Approve
                            </button>
                          ) : null}
                          {comment.status !== "REJECTED" ? (
                            <button
                              type="button"
                              onClick={() => updateStatus(comment.id, "REJECTED")}
                              className="rounded border px-2 py-1 text-xs hover:bg-stone-100"
                            >
                              Reject
                            </button>
                          ) : null}
                          {comment.status !== "SPAM" ? (
                            <button
                              type="button"
                              onClick={() => updateStatus(comment.id, "SPAM")}
                              className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                            >
                              Spam
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </DataTable>
        )}
      </main>

      <BlogCommentDetailDialog
        comment={selectedComment}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
