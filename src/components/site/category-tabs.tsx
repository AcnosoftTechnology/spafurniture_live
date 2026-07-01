"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "./product-card";

type TabProduct = {
  id: string;
  title: string;
  slug: string;
  shortDesc?: string | null;
  priceDisplay?: string | null;
  featured?: boolean;
  gallery?: { media: { path: string } }[];
};

type CategoryTab = { id: string; label: string; slug: string };

export function CategoryTabs({
  tabs,
  productsByTab,
}: {
  tabs: CategoryTab[];
  productsByTab: Record<string, TabProduct[]>;
}) {
  const [active, setActive] = useState(tabs[0]?.slug ?? "all");
  const allProducts = Object.values(productsByTab).flat();
  const uniqueProducts = Array.from(new Map(allProducts.map((p) => [p.id, p])).values());

  return (
    <Tabs value={active} onValueChange={setActive}>
      <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
        <TabsTrigger value="all" className="rounded-full border border-stone-200 data-[state=active]:bg-stone-900 data-[state=active]:text-white">
          All
        </TabsTrigger>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.slug}
            className="rounded-full border border-stone-200 data-[state=active]:bg-stone-900 data-[state=active]:text-white"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="all" className="mt-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {uniqueProducts.map((p) => (
            <ProductCard
              key={p.id}
              title={p.title}
              slug={p.slug}
              shortDesc={p.shortDesc}
              priceDisplay={p.priceDisplay}
              imagePath={p.gallery?.[0]?.media?.path}
              featured={p.featured}
            />
          ))}
        </div>
      </TabsContent>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.slug} className="mt-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(productsByTab[tab.slug] ?? []).map((p) => (
              <ProductCard
                key={p.id}
                title={p.title}
                slug={p.slug}
                shortDesc={p.shortDesc}
                priceDisplay={p.priceDisplay}
                imagePath={p.gallery?.[0]?.media?.path}
                featured={p.featured}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
