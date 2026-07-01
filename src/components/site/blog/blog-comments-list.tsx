"use client";

import { format } from "date-fns";
import { User } from "lucide-react";
import type { BlogCommentNode } from "@/lib/blog-comment-tree";

function formatCommentDate(value: Date | string) {
  return format(new Date(value), "do MMMM yyyy").toUpperCase();
}

type BlogCommentsListProps = {
  comments: BlogCommentNode[];
  totalCount: number;
  onReply: (comment: BlogCommentNode) => void;
};

function CommentItem({
  comment,
  onReply,
}: {
  comment: BlogCommentNode;
  onReply: (comment: BlogCommentNode) => void;
}) {
  return (
    <li className="esth-blog-comment">
      <div className="esth-blog-comment-avatar" aria-hidden>
        <User className="esth-blog-comment-avatar-icon" strokeWidth={1.5} />
      </div>
      <div className="esth-blog-comment-body">
        <p className="esth-blog-comment-author">{comment.authorName}</p>
        <div className="esth-blog-comment-meta">
          <time dateTime={new Date(comment.createdAt).toISOString()}>
            {formatCommentDate(comment.createdAt)}
          </time>
          <span className="esth-blog-comment-meta-sep" aria-hidden>
            |
          </span>
          <button
            type="button"
            className="esth-blog-comment-reply-link"
            onClick={() => onReply(comment)}
          >
            Reply
          </button>
        </div>
        <p className="esth-blog-comment-text">{comment.content}</p>

        {comment.children.length > 0 ? (
          <ol className="esth-blog-comment-children">
            {comment.children.map((child) => (
              <CommentItem key={child.id} comment={child} onReply={onReply} />
            ))}
          </ol>
        ) : null}
      </div>
    </li>
  );
}

export function BlogCommentsList({ comments, totalCount, onReply }: BlogCommentsListProps) {
  return (
    <section className="esth-blog-comments" aria-labelledby="blog-comments-title">
      <h2 id="blog-comments-title" className="esth-blog-comments-title">
        Comments ({totalCount})
      </h2>

      {comments.length === 0 ? null : (
        <ol className="esth-blog-comments-list">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReply={onReply} />
          ))}
        </ol>
      )}
    </section>
  );
}
