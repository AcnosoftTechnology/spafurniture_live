"use client";

import { useMemo, useState } from "react";
import { buildCommentTree, countCommentsInTree, type BlogCommentNode } from "@/lib/blog-comment-tree";
import { BlogCommentsList } from "@/components/site/blog/blog-comments-list";
import { BlogCommentReply } from "@/components/site/blog/blog-comment-reply";

export type BlogCommentItem = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
  parentId: string | null;
};

type BlogCommentsSectionProps = {
  postId: string;
  postTitle: string;
  comments: BlogCommentItem[];
};

export function BlogCommentsSection({ postId, postTitle, comments }: BlogCommentsSectionProps) {
  const [replyTo, setReplyTo] = useState<{ id: string; authorName: string } | null>(null);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
  const commentCount = useMemo(() => countCommentsInTree(commentTree), [commentTree]);

  function handleReply(comment: BlogCommentNode) {
    setReplyTo({ id: comment.id, authorName: comment.authorName });
    const form = document.getElementById("blog-reply-title");
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="esth-blog-comments-area">
      <BlogCommentsList comments={commentTree} totalCount={commentCount} onReply={handleReply} />
      <BlogCommentReply
        postId={postId}
        postTitle={postTitle}
        parentId={replyTo?.id ?? null}
        replyingTo={replyTo?.authorName ?? null}
        onCancelReply={() => setReplyTo(null)}
        onSubmitted={() => setReplyTo(null)}
      />
    </div>
  );
}
