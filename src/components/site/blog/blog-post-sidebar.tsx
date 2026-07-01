import Link from "next/link";
import { Share2 } from "lucide-react";
import { blogArchivePathFromKey } from "@/lib/blog-archive";
import type { BlogArchiveMonth } from "@/lib/services/blog.service";
import { BlogSidebarSearch } from "@/components/site/blog/blog-sidebar-search";
import { BlogSidebarNewsletter } from "@/components/site/blog/blog-sidebar-newsletter";
import { BlogSidebarTags } from "@/components/site/blog/blog-sidebar-tags";
import { blogPostPath, blogCategoryPath } from "@/lib/blog-paths";
import type { BlogCategoryPathInput } from "@/lib/blog-paths";

type BlogPostSidebarProps = {
  recentPosts: { slug: string; title: string }[];
  categories: BlogCategoryPathInput[];
  archives: BlogArchiveMonth[];
  tags: { id: string; name: string; slug: string }[];
  social: { platform: string; href: string }[];
};

export function BlogPostSidebar({ recentPosts, categories, archives, tags, social }: BlogPostSidebarProps) {
  return (
    <aside className="esth-blog-post-sidebar" aria-label="Blog sidebar">
      <div className="esth-blog-widget">
        <BlogSidebarSearch />
      </div>

      {recentPosts.length > 0 ? (
        <div className="esth-blog-widget esth-blog-widget--nav-list">
          <h2 className="esth-blog-widget-title esth-blog-widget-title--accent">Recent Posts</h2>
          <ul className="esth-blog-widget-list esth-blog-widget-list--ref">
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <Link href={blogPostPath(post.slug)}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {archives.length > 0 ? (
        <div className="esth-blog-widget esth-blog-widget--nav-list">
          <h2 className="esth-blog-widget-title esth-blog-widget-title--accent">Archives</h2>
          <ul className="esth-blog-widget-list esth-blog-widget-list--ref">
            {archives.map((item) => (
              <li key={item.key}>
                <Link href={item.href ?? blogArchivePathFromKey(item.key) ?? `/blog/?archive=${item.key}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {categories.length > 0 ? (
        <div className="esth-blog-widget esth-blog-widget--nav-list">
          <h2 className="esth-blog-widget-title esth-blog-widget-title--accent">Categories</h2>
          <ul className="esth-blog-widget-list esth-blog-widget-list--ref">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={blogCategoryPath(cat)}>{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="esth-blog-widget">
        <BlogSidebarNewsletter />
      </div>

      <BlogSidebarTags tags={tags} />

      {social.length > 0 ? (
        <div className="esth-blog-widget">
          <h2 className="esth-blog-widget-title">Follow Us</h2>
          <ul className="esth-blog-widget-social">
            {social.map((item) => (
              <li key={`${item.platform}-${item.href}`}>
                <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.platform}>
                  <Share2 className="h-4 w-4" aria-hidden />
                  <span>{item.platform}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
