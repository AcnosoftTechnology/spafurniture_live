"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function BlogSidebarNewsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter your email");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/inquiries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GENERAL",
          name: "Newsletter",
          email: trimmed,
          subject: "Blog newsletter signup",
          message: "Subscriber requested blog newsletter updates from the sidebar form.",
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error?.message ?? "Could not subscribe");
      toast.success("Thank you — we received your request.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="esth-blog-widget-newsletter" onSubmit={onSubmit}>
      <h2 className="esth-blog-widget-title esth-blog-widget-title--accent">Newsletter</h2>
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ENTER YOUR EMAIL..."
        className="esth-blog-widget-newsletter-input"
        autoComplete="email"
        disabled={submitting}
        required
      />
      <button type="submit" className="esth-blog-widget-newsletter-btn" disabled={submitting} aria-label="Subscribe">
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );
}
