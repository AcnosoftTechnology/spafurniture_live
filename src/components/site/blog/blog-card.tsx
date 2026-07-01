import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, ImageOff } from "lucide-react";
import { mediaUrl } from "@/lib/utils";
import { stripHtml } from "@/lib/services/wxr-seo";
import type { BlogViewMode } from "@/components/site/blog/blog-view";
import { blogPostPath } from "@/lib/blog-paths";
import { cn } from "@/lib/utils";

export type BlogCardPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  featuredMedia?: { path: string; webpPath?: string | null } | null;
};

function BlogCardMedia({
  imageSrc,
  title,
  view,
}: {
  imageSrc: string | null;
  title: string;
  view: BlogViewMode;
}) {
  const sizes =
    view === "list"
      ? "(max-width: 767px) 100vw, 320px"
      : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

  if (imageSrc) {
    return (
      <div className="esth-blog-card-media">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="esth-blog-card-image"
          sizes={sizes}
        />
      </div>
    );
  }

  return (
    <div className="esth-blog-card-media esth-blog-card-media--empty" aria-hidden>
      <ImageOff className="esth-blog-card-placeholder-icon" strokeWidth={1.25} />
      <span>No image</span>
    </div>
  );
}

export function BlogCard({ post, view }: { post: BlogCardPost; view: BlogViewMode }) {
  const imageSrc = post.featuredMedia
    ? mediaUrl(post.featuredMedia.webpPath ?? post.featuredMedia.path)
    : null;
  const excerpt = post.excerpt ? stripHtml(post.excerpt) : "";
  const dateLabel = post.publishedAt
    ? format(new Date(post.publishedAt), "MMM d, yyyy")
    : "";

  if (view === "list") {
    return (
      <article className="esth-blog-card esth-blog-card--list">
        <Link href={blogPostPath(post.slug)} className="esth-blog-card-link esth-blog-card-link--list">
          <BlogCardMedia imageSrc={imageSrc} title={post.title} view="list" />
          <div className="esth-blog-list-body">
            <h2 className="esth-blog-list-title">{post.title}</h2>
            {excerpt ? <p className="esth-blog-list-excerpt">{excerpt}</p> : null}
            <span className="esth-blog-list-readmore">
              Read more
              <ArrowRight className="esth-blog-list-readmore-icon" strokeWidth={1.5} aria-hidden />
            </span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="esth-blog-card esth-blog-card--grid">
      <Link href={blogPostPath(post.slug)} className="esth-blog-card-link esth-blog-card-link--grid">
        <BlogCardMedia imageSrc={imageSrc} title={post.title} view="grid" />
        {dateLabel ? (
          <time
            className="esth-blog-card-date"
            dateTime={new Date(post.publishedAt!).toISOString()}
          >
            {dateLabel}
          </time>
        ) : null}
        <h2 className="esth-blog-card-title">{post.title}</h2>
        {excerpt ? <p className="esth-blog-card-excerpt">{excerpt}</p> : null}
      </Link>
    </article>
  );
}
