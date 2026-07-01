"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminProductsIndexEditorData } from "@/features/products-index/get-products-index-data";
import type {
  ProductsIndexBlock,
  ProductsIndexLayout,
} from "@/features/products-index/schemas/products-index-layout.schema";

type ProductOption = AdminProductsIndexEditorData["products"][number];
type NavCategory = AdminProductsIndexEditorData["navCategories"][number];

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ProductIdsField({
  label,
  productIds,
  products,
  onChange,
  maxItems,
}: {
  label: string;
  productIds: string[];
  products: ProductOption[];
  onChange: (ids: string[]) => void;
  maxItems?: number;
}) {
  const [query, setQuery] = useState("");
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          !productIds.includes(p.id) &&
          (p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [products, productIds, query]);

  const addProduct = (id: string) => {
    if (maxItems && productIds.length >= maxItems) {
      toast.error(`Maximum ${maxItems} products allowed.`);
      return;
    }
    if (!productIds.includes(id)) onChange([...productIds, id]);
    setQuery("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          placeholder="Search products by name or slug…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-stone-200 bg-white shadow-md dark:border-stone-700 dark:bg-stone-900">
            {suggestions.map((p) => (
              <button
                key={p.id}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-stone-50 dark:hover:bg-stone-800"
                onClick={() => addProduct(p.id)}
              >
                <span>{p.title}</span>
                <span className="text-stone-400">{p.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {productIds.length === 0 ? (
        <p className="text-xs text-stone-500">No products selected.</p>
      ) : (
        <ul className="space-y-1 rounded-md border border-stone-200 p-2 dark:border-stone-700">
          {productIds.map((id, index) => {
            const product = byId.get(id);
            return (
              <li
                key={id}
                className="flex items-center gap-2 rounded bg-stone-50 px-2 py-1.5 text-xs dark:bg-stone-900"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                <span className="min-w-0 flex-1 truncate">{product?.title ?? id}</span>
                <div className="flex shrink-0 gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === 0}
                    onClick={() => onChange(moveItem(productIds, index, index - 1))}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === productIds.length - 1}
                    onClick={() => onChange(moveItem(productIds, index, index + 1))}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-600"
                    onClick={() => onChange(productIds.filter((pid) => pid !== id))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CategoryOrderField({
  featuredCategoryIds,
  navCategories,
  onChange,
}: {
  featuredCategoryIds: string[];
  navCategories: NavCategory[];
  onChange: (ids: string[]) => void;
}) {
  const navOnly = navCategories.filter((c) => c.showInProductNav);
  const ordered = featuredCategoryIds.length
    ? featuredCategoryIds
        .map((id) => navOnly.find((c) => c.id === id))
        .filter((c): c is NavCategory => Boolean(c))
    : navOnly;

  const toggleCategory = (id: string) => {
    if (featuredCategoryIds.length === 0) {
      onChange(navOnly.filter((c) => c.id !== id).map((c) => c.id));
      return;
    }
    if (featuredCategoryIds.includes(id)) {
      onChange(featuredCategoryIds.filter((cid) => cid !== id));
    } else {
      onChange([...featuredCategoryIds, id]);
    }
  };

  const moveCategory = (from: number, to: number) => {
    const ids = ordered.map((c) => c.id);
    onChange(moveItem(ids, from, to));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500">
        Categories shown as large spotlight blocks between product grids (every 20 products).
        Leave all selected for default order, or pick specific categories and reorder them.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([])}
        >
          Use all nav categories
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(navOnly.map((c) => c.id))}
        >
          Select all
        </Button>
      </div>
      <ul className="space-y-1 rounded-md border border-stone-200 p-2 dark:border-stone-700">
        {ordered.map((cat, index) => {
          const checked =
            featuredCategoryIds.length === 0 || featuredCategoryIds.includes(cat.id);
          return (
            <li
              key={cat.id}
              className="flex items-center gap-2 rounded bg-stone-50 px-2 py-1.5 text-xs dark:bg-stone-900"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCategory(cat.id)}
                className="h-3.5 w-3.5"
              />
              <span className="min-w-0 flex-1 truncate">{cat.title}</span>
              <div className="flex shrink-0 gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => moveCategory(index, index - 1)}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === ordered.length - 1}
                  onClick={() => moveCategory(index, index + 1)}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BlockEditor({
  block,
  index,
  total,
  products,
  navCategories,
  onChange,
  onRemove,
  onMove,
}: {
  block: ProductsIndexBlock;
  index: number;
  total: number;
  products: ProductOption[];
  navCategories: NavCategory[];
  onChange: (block: ProductsIndexBlock) => void;
  onRemove: () => void;
  onMove: (from: number, to: number) => void;
}) {
  const title = block.type === "grid" ? "Product grid" : "Category spotlight";

  return (
    <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-stone-400" />
          <span className="text-sm font-medium">
            {index + 1}. {title}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {block.type === "grid" ? (
        <ProductIdsField
          label="Products (display order)"
          productIds={block.productIds}
          products={products}
          onChange={(productIds) => onChange({ ...block, productIds })}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={block.categoryId}
                onValueChange={(categoryId) => onChange({ ...block, categoryId })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {navCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category card side</Label>
              <Select
                value={block.side}
                onValueChange={(side) =>
                  onChange({ ...block, side: side as "left" | "right" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ProductIdsField
            label="Products in this category row"
            productIds={block.productIds}
            products={products}
            onChange={(productIds) => onChange({ ...block, productIds })}
          />
        </div>
      )}
    </div>
  );
}

export function ProductsIndexEditor({
  initialData,
}: {
  initialData: AdminProductsIndexEditorData;
}) {
  const [layout, setLayout] = useState<ProductsIndexLayout>(initialData.layout);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/products-index/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = (await res.json()) as { data: { layout: ProductsIndexLayout } };
      setLayout(json.data.layout);
      toast.success("Products page layout saved.");
    } catch {
      toast.error("Could not save layout.");
    } finally {
      setSaving(false);
    }
  }, [layout]);

  const updateBlocks = (blocks: ProductsIndexBlock[]) => {
    setLayout((prev) => ({ ...prev, blocks }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-900/50">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Control what appears on the <strong>All Products</strong> tab at{" "}
          <code className="text-xs">/products/</code>. Use <strong>Auto</strong> for
          infinite scroll with all published products, or <strong>Manual</strong> to
          hand-pick products and category spotlight rows in exact order.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Display mode</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={layout.mode === "auto" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayout((prev) => ({ ...prev, mode: "auto" }))}
          >
            Auto (all products + scroll)
          </Button>
          <Button
            type="button"
            variant={layout.mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayout((prev) => ({ ...prev, mode: "manual" }))}
          >
            Manual (curated blocks)
          </Button>
        </div>
      </div>

      {layout.mode === "auto" ? (
        <div className="space-y-2">
          <Label>Featured category order</Label>
          <CategoryOrderField
            featuredCategoryIds={layout.featuredCategoryIds}
            navCategories={initialData.navCategories}
            onChange={(featuredCategoryIds) =>
              setLayout((prev) => ({ ...prev, featuredCategoryIds }))
            }
          />
          <p className="text-xs text-stone-500">
            Product order in auto mode follows each product&apos;s <em>Sort order</em> field
            in the product editor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateBlocks([...layout.blocks, { type: "grid", productIds: [] }])
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add product grid
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateBlocks([
                  ...layout.blocks,
                  {
                    type: "category",
                    categoryId: initialData.navCategories[0]?.id ?? "",
                    side: "left",
                    productIds: [],
                  },
                ])
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add category spotlight
            </Button>
          </div>

          {layout.blocks.length === 0 ? (
            <p className="rounded-md border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
              No blocks yet. Add product grids and category spotlight rows in the order
              they should appear on the page.
            </p>
          ) : (
            <div className="space-y-4">
              {layout.blocks.map((block, index) => (
                <BlockEditor
                  key={`${block.type}-${index}`}
                  block={block}
                  index={index}
                  total={layout.blocks.length}
                  products={initialData.products}
                  navCategories={initialData.navCategories}
                  onChange={(next) => {
                    const blocks = [...layout.blocks];
                    blocks[index] = next;
                    updateBlocks(blocks);
                  }}
                  onRemove={() =>
                    updateBlocks(layout.blocks.filter((_, i) => i !== index))
                  }
                  onMove={(from, to) => updateBlocks(moveItem(layout.blocks, from, to))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end border-t border-stone-200 pt-4 dark:border-stone-700">
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save layout"}
        </Button>
      </div>
    </div>
  );
}
