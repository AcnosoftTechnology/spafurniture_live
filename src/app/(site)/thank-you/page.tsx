import Link from "next/link";
import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata({
    title: "Thank You",
    seoTitle: "Thank You - Esthetica",
    metaDescription: "Thanks for contacting Esthetica. We will reply to you as soon as possible.",
    robots: "noindex,follow",
  }, "/thank-you/");
}

export default function ThankYouPage() {
  return (
    <main className="esth-thankyou-page">
      <EsthPageShell className="esth-thankyou-shell">
        <div className="esth-thankyou-content">
          <p className="esth-thankyou-eyebrow">Message received</p>
          <h1 className="esth-thankyou-title">Thank You</h1>
          <p className="esth-thankyou-message">
            Thanks for contacting us. We will reply to you as soon as possible.
          </p>
          <Link href="/" className="esth-thankyou-btn">
            Back to home
          </Link>
        </div>
      </EsthPageShell>
    </main>
  );
}
