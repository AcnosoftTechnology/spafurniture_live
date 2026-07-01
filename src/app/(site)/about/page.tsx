import { permanentRedirect } from "next/navigation";
import { AboutPageView } from "@/components/site/about/about-page-view";
import {
  buildAboutPageMetadata,
  getAboutPageData,
  getAboutPublicSlug,
} from "@/features/about/get-about-data";

export const revalidate = 3600;

export async function generateMetadata() {
  return buildAboutPageMetadata();
}

export default async function AboutPage() {
  const slug = await getAboutPublicSlug();
  if (slug !== "about") {
    permanentRedirect(`/${slug}/`);
  }

  const { content } = await getAboutPageData();
  return <AboutPageView content={content} />;
}
