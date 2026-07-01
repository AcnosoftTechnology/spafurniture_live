import { ClientsPageView } from "@/components/site/clients/clients-page-view";
import { getClientsPageData } from "@/features/clients/get-clients-data";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata() {
  const { seo } = await getClientsPageData();
  return buildPageMetadata({
    title: seo.seoTitle || seo.title || "Our Clients",
    metaDescription:
      seo.metaDescription ||
      "Esthetica supplies luxury spa furniture to leading hotels, resorts and wellness brands across India and worldwide.",
    keywords: seo.keywords,
    canonicalUrl: seo.canonicalUrl,
    ogTitle: seo.ogTitle,
    ogDescription: seo.ogDescription,
    ogImage: seo.ogImage,
    robots: seo.robots,
  });
}

export default async function ClientsPage() {
  const { content } = await getClientsPageData();
  return <ClientsPageView content={content} />;
}
