import { ContactPageView } from "@/components/site/contact/contact-page-view";
import { JsonLd } from "@/components/site/seo/json-ld";
import { getHomepageContent } from "@/features/homepage/get-homepage-data";
import { getSiteConfig } from "@/lib/site-settings";
import { buildContactPageSchemas } from "@/lib/seo/build-schemas";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata({
    title: "Contact Us",
    metaDescription: "Contact Esthetica for spa furniture enquiries, quotes and international orders.",
  }, "/contact-us/");
}

export default async function ContactPage() {
  const [site, homepage] = await Promise.all([getSiteConfig(), getHomepageContent()]);
  const socialLinks = site.social.length ? site.social : homepage.footer.social;
  const schemaScript = await buildContactPageSchemas(site);

  return (
    <>
      <JsonLd data={schemaScript} />
      <ContactPageView site={site} socialLinks={socialLinks} />
    </>
  );
}
