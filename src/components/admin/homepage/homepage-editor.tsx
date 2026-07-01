"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaField, type MediaFieldValue } from "@/components/admin/cms/media-field";
import { LogoListField } from "@/components/admin/cms/logo-list-field";
import { CertificationListField } from "@/components/admin/cms/certification-list-field";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";
import type { AdminHomepageEditorData } from "@/features/homepage/get-homepage-data";

function pathToMedia(path: string, mediaId?: string | null, alt?: string | null): MediaFieldValue | null {
  if (!path) return null;
  return { path, mediaId: mediaId ?? null, alt: alt ?? null };
}

function ParagraphList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {items.map((paragraph, index) => (
        <div key={index} className="flex gap-2">
          <Textarea
            rows={2}
            value={paragraph}
            onChange={(e) => {
              const next = [...items];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, i) => i !== index))}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
        Add paragraph
      </Button>
    </div>
  );
}

type HomepageEditorCategory = AdminHomepageEditorData["categories"][number];

function getFeaturedCategories(categories: HomepageEditorCategory[]) {
  return categories
    .filter((cat) => cat.homepageFeatured)
    .sort((a, b) => a.homepageFeaturedSortOrder - b.homepageFeaturedSortOrder);
}

function applyFeaturedOrder(
  categories: HomepageEditorCategory[],
  orderedFeatured: HomepageEditorCategory[],
): HomepageEditorCategory[] {
  const orderMap = new Map(orderedFeatured.map((cat, index) => [cat.id, index]));
  return categories.map((cat) =>
    cat.homepageFeatured
      ? { ...cat, homepageFeaturedSortOrder: orderMap.get(cat.id) ?? cat.homepageFeaturedSortOrder }
      : { ...cat, homepageFeaturedSortOrder: 0 },
  );
}

function moveFeaturedCategory(
  categories: HomepageEditorCategory[],
  from: number,
  to: number,
): HomepageEditorCategory[] {
  if (to < 0 || to >= getFeaturedCategories(categories).length) return categories;
  const featured = getFeaturedCategories(categories);
  const nextFeatured = [...featured];
  const [item] = nextFeatured.splice(from, 1);
  nextFeatured.splice(to, 0, item);
  return applyFeaturedOrder(categories, nextFeatured);
}

function setCategoryFeatured(
  categories: HomepageEditorCategory[],
  id: string,
  featured: boolean,
): HomepageEditorCategory[] {
  if (featured) {
    const maxOrder = categories.reduce(
      (max, cat) => (cat.homepageFeatured ? Math.max(max, cat.homepageFeaturedSortOrder) : max),
      -1,
    );
    return categories.map((cat) =>
      cat.id === id
        ? { ...cat, homepageFeatured: true, homepageFeaturedSortOrder: maxOrder + 1 }
        : cat,
    );
  }

  return categories.map((cat) =>
    cat.id === id ? { ...cat, homepageFeatured: false, homepageFeaturedSortOrder: 0 } : cat,
  );
}

function setCategoryMenuLabel(
  categories: HomepageEditorCategory[],
  id: string,
  menuLabel: string,
): HomepageEditorCategory[] {
  return categories.map((cat) => (cat.id === id ? { ...cat, menuLabel } : cat));
}

export function HomepageEditor({ initialData }: { initialData: AdminHomepageEditorData }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<AdminHomepageEditorData>(initialData);
  const featuredCategories = useMemo(
    () => getFeaturedCategories(payload.categories),
    [payload.categories],
  );
  const availableCategories = useMemo(
    () => payload.categories.filter((cat) => !cat.homepageFeatured),
    [payload.categories],
  );
  const productNavCategories = useMemo(
    () =>
      [...payload.categories]
        .filter((cat) => cat.showInProductNav)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [payload.categories],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/homepage");
      const json = (await res.json()) as { data?: AdminHomepageEditorData; error?: { message?: string } };

      if (!res.ok || !json.data) {
        throw new Error(json.error?.message ?? "Failed to load homepage data");
      }

      setPayload(json.data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load homepage data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/v1/admin/homepage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: payload.content,
        page: payload.page,
        faqs: payload.faqs,
        featuredCategoryIds: featuredCategories.map((cat) => cat.id),
        categoryMenuLabels: payload.categories.map((cat) => ({
          id: cat.id,
          menuLabel: cat.menuLabel.trim() || null,
        })),
      }),
    });
    setSaving(false);

    const json = (await res.json()) as { error?: { message?: string } };
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to save homepage");
      return;
    }
    toast.success("Homepage saved");
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Loading homepage editor...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
        <Button type="button" variant="outline" className="mt-3" onClick={loadData}>
          Retry
        </Button>
      </div>
    );
  }

  const { content, page } = payload;

  function setContent(next: HomepageContent) {
    setPayload({ ...payload, content: next });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">Manage homepage sections, SEO, FAQs, and featured categories.</p>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save homepage"}
        </Button>
      </div>

      <Tabs defaultValue="seo">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="intro">Intro</TabsTrigger>
          <TabsTrigger value="speciality">Speciality</TabsTrigger>
          <TabsTrigger value="howWeDo">How We Do</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Page title</Label>
              <Input value={page.title} onChange={(e) => setPayload({ ...payload, page: { ...page, title: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>SEO title</Label>
              <Input value={page.seoTitle} onChange={(e) => setPayload({ ...payload, page: { ...page, seoTitle: e.target.value } })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Meta description</Label>
            <Textarea value={page.metaDescription} onChange={(e) => setPayload({ ...payload, page: { ...page, metaDescription: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <Label>Keywords (comma separated)</Label>
            <Input
              value={page.keywords.join(", ")}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  page: { ...page, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) },
                })
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>OG title</Label>
              <Input value={page.ogTitle} onChange={(e) => setPayload({ ...payload, page: { ...page, ogTitle: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Robots</Label>
              <Input value={page.robots} onChange={(e) => setPayload({ ...payload, page: { ...page, robots: e.target.value } })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>OG description</Label>
            <Textarea value={page.ogDescription} onChange={(e) => setPayload({ ...payload, page: { ...page, ogDescription: e.target.value } })} />
          </div>
          <MediaField
            label="OG image"
            value={page.ogImagePreview}
            onChange={(media) =>
              setPayload({
                ...payload,
                page: {
                  ...page,
                  ogImageId: media?.mediaId ?? null,
                  ogImagePreview: media ? { path: media.path, webpPath: media.webpPath, mediaId: media.mediaId } : null,
                },
              })
            }
            previewClassName="h-32 w-56"
          />
        </TabsContent>

        <TabsContent value="hero" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <MediaField
            label="Hero image"
            value={pathToMedia(content.hero.imagePath, content.hero.mediaId, content.hero.alt)}
            onChange={(media) =>
              setContent({
                ...content,
                hero: {
                  ...content.hero,
                  imagePath: media?.path ?? "",
                  mediaId: media?.mediaId ?? null,
                  alt: media?.alt ?? content.hero.alt,
                },
              })
            }
            previewClassName="h-40 w-full max-w-md"
          />
          <div className="space-y-2">
            <Label>Alt text</Label>
            <Input
              value={content.hero.alt}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, alt: e.target.value } })}
            />
          </div>
        </TabsContent>

        <TabsContent value="intro" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <Label>Background text</Label>
            <Textarea
              value={content.backgroundText.text}
              onChange={(e) =>
                setContent({ ...content, backgroundText: { ...content.backgroundText, text: e.target.value } })
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Products tag</Label>
              <Input
                value={content.productsIntro.tag}
                onChange={(e) =>
                  setContent({ ...content, productsIntro: { ...content.productsIntro, tag: e.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Products heading (use \n for line break)</Label>
              <Input
                value={content.productsIntro.heading}
                onChange={(e) =>
                  setContent({ ...content, productsIntro: { ...content.productsIntro, heading: e.target.value } })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Products intro body</Label>
            <Textarea
              value={content.productsIntro.body}
              onChange={(e) =>
                setContent({ ...content, productsIntro: { ...content.productsIntro, body: e.target.value } })
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="speciality" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-2">
            <Label>Tag</Label>
            <Input
              value={content.speciality.tag}
              onChange={(e) => setContent({ ...content, speciality: { ...content.speciality, tag: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={content.speciality.title}
              onChange={(e) => setContent({ ...content, speciality: { ...content.speciality, title: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={content.speciality.description}
              onChange={(e) =>
                setContent({ ...content, speciality: { ...content.speciality, description: e.target.value } })
              }
            />
          </div>
          <div className="space-y-4">
            <Label>Speciality cards</Label>
            {content.speciality.cards.map((card, index) => (
              <div key={index} className="rounded-lg border border-stone-200 p-4">
                <div className="space-y-2">
                  <Label>Card title</Label>
                  <Input
                    value={card.title}
                    onChange={(e) => {
                      const cards = [...content.speciality.cards];
                      cards[index] = { ...card, title: e.target.value };
                      setContent({ ...content, speciality: { ...content.speciality, cards } });
                    }}
                  />
                </div>
                <div className="mt-3">
                  <MediaField
                    label="Card image"
                    value={pathToMedia(card.imagePath, card.mediaId)}
                    onChange={(media) => {
                      const cards = [...content.speciality.cards];
                      cards[index] = {
                        ...card,
                        imagePath: media?.path ?? "",
                        mediaId: media?.mediaId ?? null,
                      };
                      setContent({ ...content, speciality: { ...content.speciality, cards } });
                    }}
                    previewClassName="h-24 w-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="howWeDo" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tag</Label>
              <Input
                value={content.howWeDo.tag}
                onChange={(e) => setContent({ ...content, howWeDo: { ...content.howWeDo, tag: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={content.howWeDo.title}
                onChange={(e) => setContent({ ...content, howWeDo: { ...content.howWeDo, title: e.target.value } })}
              />
            </div>
          </div>
          <ParagraphList
            label="Paragraphs"
            items={content.howWeDo.paragraphs}
            onChange={(paragraphs) => setContent({ ...content, howWeDo: { ...content.howWeDo, paragraphs } })}
          />
          <LogoListField
            label="Process logos"
            items={content.howWeDo.logos}
            onChange={(logos) => setContent({ ...content, howWeDo: { ...content.howWeDo, logos } })}
          />
        </TabsContent>

        <TabsContent value="clients" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tag</Label>
              <Input
                value={content.clients.tag}
                onChange={(e) => setContent({ ...content, clients: { ...content.clients, tag: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={content.clients.title}
                onChange={(e) => setContent({ ...content, clients: { ...content.clients, title: e.target.value } })}
              />
            </div>
          </div>
          <ParagraphList
            label="Paragraphs"
            items={content.clients.paragraphs}
            onChange={(paragraphs) => setContent({ ...content, clients: { ...content.clients, paragraphs } })}
          />
          <LogoListField
            label="Client logos"
            items={content.clients.logos}
            onChange={(logos) => setContent({ ...content, clients: { ...content.clients, logos } })}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>CTA label</Label>
              <Input
                value={content.clients.cta?.label ?? ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    clients: {
                      ...content.clients,
                      cta: { label: e.target.value, href: content.clients.cta?.href ?? "/contact-us/" },
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>CTA link</Label>
              <Input
                value={content.clients.cta?.href ?? ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    clients: {
                      ...content.clients,
                      cta: { label: content.clients.cta?.label ?? "SEE ALL", href: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="footer" className="mt-4 space-y-4 rounded-xl border border-stone-200 bg-white p-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            Site logo, favicon, footer logo, contact, and navigation are managed in{" "}
            <Link href="/admin/settings/" className="font-medium text-stone-900 underline">
              Settings
            </Link>
            .
          </div>
          <CertificationListField
            label="Certification badges"
            items={content.footer.certifications}
            onChange={(certifications) => setContent({ ...content, footer: { ...content.footer, certifications } })}
          />
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Textarea
              value={content.footer.tagline}
              onChange={(e) => setContent({ ...content, footer: { ...content.footer, tagline: e.target.value } })}
            />
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="mt-4 space-y-4">
          {payload.faqs.map((faq, index) => (
            <div key={index} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={faq.question}
                  onChange={(e) => {
                    const faqs = [...payload.faqs];
                    faqs[index] = { ...faq, question: e.target.value };
                    setPayload({ ...payload, faqs });
                  }}
                />
              </div>
              <div className="mt-2 space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={faq.answer}
                  onChange={(e) => {
                    const faqs = [...payload.faqs];
                    faqs[index] = { ...faq, answer: e.target.value };
                    setPayload({ ...payload, faqs });
                  }}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setPayload({ ...payload, faqs: [...payload.faqs, { question: "", answer: "", sortOrder: payload.faqs.length, schemaEnabled: true }] })}
          >
            Add FAQ
          </Button>
        </TabsContent>

        <TabsContent value="categories" className="mt-4 space-y-6 rounded-xl border border-stone-200 bg-white p-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Product menu labels</h3>
              <p className="mt-1 text-xs text-stone-500">
                Short name shown in the product category tabs and menus. Leave blank to use the category title.
                Enable &quot;Show in product tabs&quot; on each category to list it here.
              </p>
            </div>

            {productNavCategories.length === 0 ? (
              <p className="rounded-lg border border-dashed py-6 text-center text-sm text-stone-400">
                No categories in the product tab bar yet. Edit a category and enable &quot;Show in product tabs&quot;.
              </p>
            ) : (
              <div className="space-y-2">
                {productNavCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="grid gap-2 rounded-lg border border-stone-200 bg-stone-50/60 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">{cat.title}</p>
                      <p className="truncate text-xs text-stone-400">/{cat.slug}/</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`menu-label-${cat.id}`} className="text-xs text-stone-500">
                        Menu label
                      </Label>
                      <Input
                        id={`menu-label-${cat.id}`}
                        value={cat.menuLabel}
                        placeholder={cat.title}
                        onChange={(e) =>
                          setPayload({
                            ...payload,
                            categories: setCategoryMenuLabel(payload.categories, cat.id, e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-900">Featured on homepage</h3>
            <p className="mt-1 text-xs text-stone-500">
              Order controls which category block appears first, second, and so on on the home page.
            </p>
          </div>

          {featuredCategories.length === 0 ? (
            <p className="rounded-lg border border-dashed py-8 text-center text-sm text-stone-400">
              No featured categories yet. Enable one below.
            </p>
          ) : (
            <div className="space-y-2">
              {featuredCategories.map((cat, index) => (
                <div
                  key={cat.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/60 p-3"
                >
                  <span className="w-6 shrink-0 text-center text-xs font-semibold text-stone-400">
                    {index + 1}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === 0}
                      onClick={() =>
                        setPayload({
                          ...payload,
                          categories: moveFeaturedCategory(payload.categories, index, index - 1),
                        })
                      }
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === featuredCategories.length - 1}
                      onClick={() =>
                        setPayload({
                          ...payload,
                          categories: moveFeaturedCategory(payload.categories, index, index + 1),
                        })
                      }
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <label className="flex min-w-0 flex-1 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked
                      onChange={() =>
                        setPayload({
                          ...payload,
                          categories: setCategoryFeatured(payload.categories, cat.id, false),
                        })
                      }
                    />
                    <span className="font-medium">{cat.title}</span>
                    <span className="text-stone-400">/{cat.slug}/</span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {availableCategories.length > 0 ? (
            <div className="space-y-2 border-t border-stone-100 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Add to homepage
              </h4>
              {availableCategories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() =>
                      setPayload({
                        ...payload,
                        categories: setCategoryFeatured(payload.categories, cat.id, true),
                      })
                    }
                  />
                  <span>{cat.title}</span>
                  <span className="text-stone-400">/{cat.slug}/</span>
                </label>
              ))}
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
