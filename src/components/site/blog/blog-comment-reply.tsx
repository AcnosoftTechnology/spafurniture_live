"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeBlogCommentFields } from "@/lib/sanitize-comment";

type BlogCommentReplyProps = {
  postId: string;
  postTitle: string;
  parentId?: string | null;
  replyingTo?: string | null;
  onCancelReply?: () => void;
  onSubmitted?: () => void;
};

export function BlogCommentReply({
  postId,
  postTitle,
  parentId = null,
  replyingTo = null,
  onCancelReply,
  onSubmitted,
}: BlogCommentReplyProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const authorName = String(formData.get("name") ?? "");
    const content = String(formData.get("comment") ?? "");

    const sanitized = sanitizeBlogCommentFields({ authorName, content });
    if (!sanitized.ok) {
      setError(sanitized.message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/v1/blog/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        parentId: parentId || null,
        authorName: sanitized.authorName,
        email: formData.get("email"),
        content: sanitized.content,
        website: formData.get("website") ?? "",
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message ?? "Could not submit your comment. Please try again.");
      return;
    }

    setSubmitted(true);
    onSubmitted?.();
    form.reset();
  }

  if (submitted) {
    return (
      <section className="esth-blog-reply" aria-live="polite">
        <p className="esth-blog-reply-notice">
          Thank you. Your {parentId ? "reply" : "comment"} on &ldquo;{postTitle}&rdquo; is awaiting
          moderation and will appear after approval.
        </p>
      </section>
    );
  }

  return (
    <section className="esth-blog-reply" aria-labelledby="blog-reply-title">
      <h2 id="blog-reply-title" className="esth-blog-reply-title">
        {parentId ? "Leave a Reply" : "Leave a Comment"}
      </h2>
      <p className="esth-blog-reply-hint">
        Your email address will not be published. Required fields are marked *. Comments must be
        plain text only — HTML, scripts, and code are not allowed.
      </p>

      {replyingTo ? (
        <p className="esth-blog-reply-context">
          Replying to <strong>{replyingTo}</strong>
          {onCancelReply ? (
            <button type="button" className="esth-blog-reply-cancel" onClick={onCancelReply}>
              Cancel reply
            </button>
          ) : null}
        </p>
      ) : null}

      <form className="esth-blog-reply-form" onSubmit={onSubmit}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        <label className="esth-blog-reply-label">
          <span className="esth-blog-reply-label-text">
            Name <span className="esth-blog-reply-required">*</span>
          </span>
          <Input name="name" required maxLength={100} className="esth-blog-reply-input" />
        </label>

        <label className="esth-blog-reply-label">
          <span className="esth-blog-reply-label-text">
            Your email <span className="esth-blog-reply-required">*</span>
          </span>
          <Input name="email" type="email" required className="esth-blog-reply-input" />
        </label>

        <label className="esth-blog-reply-label">
          <span className="esth-blog-reply-label-text">
            Comment <span className="esth-blog-reply-required">*</span>
          </span>
          <Textarea
            name="comment"
            rows={5}
            required
            maxLength={5000}
            className="esth-blog-reply-textarea"
            spellCheck
          />
        </label>

        {error ? <p className="esth-blog-reply-error">{error}</p> : null}

        <button type="submit" disabled={loading} className="esth-blog-reply-submit">
          {loading ? "Posting..." : parentId ? "Post Reply" : "Post Comment"}
        </button>
      </form>
    </section>
  );
}
