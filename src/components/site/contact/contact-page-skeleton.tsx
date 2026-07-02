import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import { ShimmerSkeleton } from "@/components/ui/skeleton";

type ContactPageSkeletonProps = {
  variant?: "contact" | "distributors";
};

const FORM_FIELDS = 7;
const DISTRIBUTOR_REGION_LINES = 10;
const CONTACT_INFO_LINES = 4;

export function ContactPageSkeleton({ variant = "contact" }: ContactPageSkeletonProps) {
  const sidebarLines = variant === "distributors" ? DISTRIBUTOR_REGION_LINES : CONTACT_INFO_LINES;

  return (
    <main className="esth-contact-page esth-distributors-page" aria-hidden>
      <EsthPageShell className="esth-contact-shell">
        <header className="esth-contact-header">
          <ShimmerSkeleton className="esth-contact-shimmer-eyebrow" />
          <ShimmerSkeleton className="esth-contact-shimmer-title" />
          <ShimmerSkeleton className="esth-contact-shimmer-intro" />
          <ShimmerSkeleton className="esth-contact-shimmer-intro esth-contact-shimmer-intro--short" />
        </header>

        <div className="esth-contact-grid">
          <div className="esth-contact-form-col esth-contact-shimmer-form">
            {Array.from({ length: FORM_FIELDS }).map((_, index) => (
              <div key={index} className="esth-contact-shimmer-field">
                <ShimmerSkeleton className="esth-contact-shimmer-label" />
                <ShimmerSkeleton className="esth-contact-shimmer-input" />
              </div>
            ))}
            <ShimmerSkeleton className="esth-contact-shimmer-submit" />
          </div>

          <aside className="esth-contact-info-col esth-distributors-info esth-contact-shimmer-sidebar">
            <ShimmerSkeleton className="esth-contact-shimmer-sidebar-title" />
            <ul className="esth-contact-shimmer-list" aria-hidden>
              {Array.from({ length: sidebarLines }).map((_, index) => (
                <li key={index}>
                  <ShimmerSkeleton className="esth-contact-shimmer-list-line" />
                </li>
              ))}
            </ul>
            {variant === "distributors" ? (
              <>
                <ShimmerSkeleton className="esth-contact-shimmer-cta" />
                <ShimmerSkeleton className="esth-contact-shimmer-cta esth-contact-shimmer-cta--short" />
              </>
            ) : null}
            <ShimmerSkeleton className="esth-contact-shimmer-social-title" />
            <div className="esth-contact-shimmer-social-row">
              <ShimmerSkeleton className="esth-contact-shimmer-social-icon" />
              <ShimmerSkeleton className="esth-contact-shimmer-social-icon" />
              <ShimmerSkeleton className="esth-contact-shimmer-social-icon" />
            </div>
          </aside>
        </div>
      </EsthPageShell>
    </main>
  );
}
