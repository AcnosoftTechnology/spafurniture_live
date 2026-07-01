import Link from "next/link";
import { blogTagPath } from "@/lib/blog-paths";

type Tag = { id: string; name: string; slug: string };

export function BlogSidebarTags({ tags }: { tags: Tag[] }) {
  if (!tags.length) return null;

  return (
    <div className="esth-blog-widget esth-blog-widget-tags-wrap">
      <h2 className="esth-blog-widget-title esth-blog-widget-title--accent">Tags</h2>
      <ul className="esth-blog-widget-tags">
        {tags.map((tag) => (
          <li key={tag.id}>
            <Link href={blogTagPath(tag.slug)} className="esth-blog-widget-tag">
              {tag.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
