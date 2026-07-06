"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RegionalPageListItem } from "@/features/regional-pages/regional-page.service";

export function RegionalPagesList({ initialPages }: { initialPages: RegionalPageListItem[] }) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");

  async function createPage() {
    setCreating(true);
    const res = await fetch("/api/v1/admin/regional-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title }),
    });
    setCreating(false);

    const json = (await res.json()) as {
      data?: { slug: string; title: string };
      error?: { message?: string };
    };

    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to create page");
      return;
    }

    toast.success("Regional page created");
    setOpen(false);
    setSlug("");
    setTitle("");
    router.push(`/admin/regional-pages/${json.data?.slug}/`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Landing pages for UAE, Saudi Arabia, Qatar, or any new region. Each page uses the same
          layout: banner, bilingual intro, product sections, and client logos.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add region page</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New regional page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="region-title">Region name</Label>
                <Input
                  id="region-title"
                  placeholder="e.g. Kuwait"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug) {
                      setSlug(
                        e.target.value
                          .trim()
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, ""),
                      );
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region-slug">URL slug</Label>
                <Input
                  id="region-slug"
                  placeholder="e.g. kuwait"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                />
                <p className="text-xs text-stone-500">Public URL: /{slug || "your-slug"}/</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createPage} disabled={creating || !slug.trim() || !title.trim()}>
                {creating ? "Creating..." : "Create page"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.slug} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 font-medium text-stone-900">{page.title}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/${page.slug}/`}
                    target="_blank"
                    className="text-stone-600 underline hover:text-stone-900"
                  >
                    /{page.slug}/
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-stone-600">{page.status.toLowerCase()}</td>
                <td className="px-4 py-3 text-stone-500">
                  {new Date(page.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/regional-pages/${page.slug}/`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-stone-500">No regional pages yet.</p>
        ) : null}
      </div>
    </div>
  );
}
