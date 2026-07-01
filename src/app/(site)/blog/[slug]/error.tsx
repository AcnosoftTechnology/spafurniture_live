"use client";

import Link from "next/link";

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="esth-blog-page-main">
      <div className="esth-page-shell esth-page-section py-16 text-center">
        <h1 className="font-display text-2xl text-stone-900">Could not load this article</h1>
        <p className="mt-3 text-sm text-stone-500">
          {process.env.NODE_ENV === "development" ? error.message : "Please try again in a moment."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full border border-stone-300 px-5 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            Try again
          </button>
          <Link href="/blog/" className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white hover:bg-stone-800">
            Back to blog
          </Link>
        </div>
      </div>
    </main>
  );
}
