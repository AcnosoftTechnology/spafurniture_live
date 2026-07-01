"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { FileText, Mail } from "lucide-react";
import { SocialPlatformIcon } from "@/components/site/social-platform-icon";
import { ProductCarousel } from "@/components/site/product-carousel";
import { ProductDetailPager, type NextProductPreview } from "@/components/site/product-detail-pager";
import { ProductDetailSkeleton } from "@/components/site/product-detail-skeleton";
import { ProductEnquiryModal } from "@/components/site/product-enquiry-modal";
import { ProductYoutubeModal } from "@/components/site/product-youtube-modal";
import { ProductSectionImageModal } from "@/components/site/product-section-image-modal";
import { ContentRenderer } from "@/components/site/content-renderer";
import { parseYoutubeVideoId } from "@/lib/youtube";
import { mediaUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
const MIN_SHIMMER_MS = 750;

export type ProductDetailData = {
  id: string;
  title: string;
  slug: string;
  shortDesc?: string | null;
  fullDesc?: unknown;
  dimensions?: string | null;
  dimensionsImage?: { path: string; webpPath?: string | null; alt?: string | null } | null;
  featuresImage?: { path: string; webpPath?: string | null; alt?: string | null } | null;
  brochureUrl?: string | null;
  brochureLabel?: string | null;
  brochureFilename?: string | null;
  youtubeUrl?: string | null;
  youtubeLabel?: string | null;
  gallery: { id: string; path: string }[];
  features: { id: string; label: string; value: string }[];
};

type SectionId = "description" | "dimensions" | "features";

type SectionImageState = {
  src: string;
  alt: string;
  title: string;
};

function SectionImagePreview({
  image,
  label,
  onOpen,
}: {
  image: { path: string; webpPath?: string | null; alt?: string | null };
  label: string;
  onOpen: () => void;
}) {
  const src = mediaUrl(image.webpPath ?? image.path);

    return (
      <button type="button" className="detailSectionImageButton" onClick={onOpen}>
        <span className="detailSectionImageFrame">
          <Image
            src={src}
            alt={image.alt ?? label}
            fill
            className="detailSectionImageThumb"
            sizes="(max-width: 767px) 100vw, 420px"
          />
        </span>
      </button>
    );
}

function parseDimensionLines(text: string): { label: string; value: string }[] {
  const chunks = text
    .split(/\r?\n+/)
    .flatMap((line) =>
      line
        .trim()
        .split(/(?=\b(?:Height|Length|Width|Depth|Safe Working Load|Load Bearing Capacity|Weight)\s*:)/i)
        .map((part) => part.trim())
        .filter(Boolean),
    );

  return chunks.map((line) => {
    const colon = line.indexOf(":");
    if (colon > 0) {
      return {
        label: line.slice(0, colon).trim(),
        value: line.slice(colon + 1).trim(),
      };
    }
    return { label: "Specification", value: line };
  });
}

export function ProductDetailView({
  product,
  nextProduct = null,
}: {
  product: ProductDetailData;
  nextProduct?: NextProductPreview | null;
}) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [sectionImage, setSectionImage] = useState<SectionImageState | null>(null);
  const [openSection, setOpenSection] = useState<SectionId | null>("description");
  const [pageReady, setPageReady] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const slides = product.gallery.map((g) => ({
    id: g.id,
    path: g.path,
    alt: product.title,
  }));

  const youtubeVideoId = useMemo(
    () => parseYoutubeVideoId(product.youtubeUrl),
    [product.youtubeUrl],
  );
  const youtubeButtonLabel = product.youtubeLabel?.trim() || "See Video";
  const fullDescHtml =
    typeof product.fullDesc === "string" ? product.fullDesc.trim() : "";
  const fullDescDoc =
    product.fullDesc &&
    typeof product.fullDesc === "object" &&
    (product.fullDesc as { content?: unknown[] }).content?.length
      ? product.fullDesc
      : null;
  const hasFullDescription = Boolean(fullDescHtml || fullDescDoc);

  const descriptionContent = hasFullDescription ? (
    <ContentRenderer
      content={fullDescHtml || fullDescDoc}
      className="detailRichContent"
    />
  ) : product.shortDesc?.trim() ? (
    <p className="detailDescriptionCopy whitespace-pre-wrap">{product.shortDesc}</p>
  ) : null;

  const openSectionImage = useCallback(
    (image: { path: string; webpPath?: string | null; alt?: string | null }, title: string) => {
      setSectionImage({
        src: mediaUrl(image.webpPath ?? image.path),
        alt: image.alt ?? title,
        title,
      });
    },
    [],
  );

const featuresContent =
  product.featuresImage || product.features.length > 0 ? (
    <div className="detailFeaturesWrapper">


      {product.features.length > 0 && (
        <ul className="detailFeatureList">
          {product.features.map((f) => (
            <li key={f.id}>
              {f.value ? (
                <>
                  <span className="font-medium">{f.label}:</span> {f.value}
                </>
              ) : (
                f.label
              )}
            </li>
          ))}
        </ul>
      )}

      {product.featuresImage && (
        <div className="mb-4">
          <SectionImagePreview
            image={product.featuresImage}
            label={`${product.title} features`}
            onOpen={() =>
              openSectionImage(
                product.featuresImage!,
                `${product.title} — Features`
              )
            }
          />
        </div>
      )}


    </div>
  ) : null;

  const dimensionsContent = product.dimensionsImage ? (
    <SectionImagePreview
      image={product.dimensionsImage}
      label={`${product.title} dimensions`}
      onOpen={() => openSectionImage(product.dimensionsImage!, `${product.title} — Dimensions`)}
    />
  ) : product.dimensions ? (
    (() => {
      const items = parseDimensionLines(product.dimensions);
      if (items.length > 1) {
        return (
          <div className="detailDimensionGrid">
            {items.map((item) => (
              <div key={`${item.label}-${item.value}`} className="detailDimensionItem">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        );
      }
      return <p className="detailDescriptionCopy whitespace-pre-wrap">{product.dimensions}</p>;
    })()
  ) : null;

  const sections = [
    descriptionContent && {
      id: "description" as const,
      title: "Description",
      content: descriptionContent,
    },
    featuresContent && {
      id: "features" as const,
      title: "Features",
      content: featuresContent,
    },
    dimensionsContent && {
      id: "dimensions" as const,
      title: "Dimensions",
      content: dimensionsContent,
    },
  ].filter(Boolean) as { id: SectionId; title: string; content: ReactNode }[];

  const descriptionSection = sections.find((s) => s.id === "description");
  const accordionSections = sections.filter((s) => s.id !== "description");

  function renderAccordionItem(section: { id: SectionId; title: string; content: ReactNode }) {
    const isOpen = openSection === section.id;
    return (
      <div key={section.id} className="detailAccordionItem">
        <button
          type="button"
          onClick={() => toggleSection(section.id)}
          className={`detailAccordionTrigger ${isOpen ? "detailAccordionTriggerActive" : ""}`}
          aria-expanded={isOpen}
        >
          <span>{section.title}</span>
          <span className="detailAccordionIcon" aria-hidden />
        </button>
        <div className={`detailAccordionPanelWrap ${isOpen ? "detailAccordionPanelWrap--open" : ""}`}>
          <div className="detailAccordionPanel">
            <div className="detailAccordionPanelInner">{section.content}</div>
          </div>
        </div>
      </div>
    );
  }
  function toggleSection(id: SectionId) {
    setOpenSection((current) => (current === id ? null : id));
  }

  const handleCarouselReady = useCallback(() => {
    setContentReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setPageReady(true), MIN_SHIMMER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (contentReady) setPageReady(true);
  }, [contentReady]);

  return (
    <div className="detailShell detailShell--page">
      <div
        className={cn("detailPageShimmer", pageReady && "detailPageShimmer--hidden")}
        aria-busy={!pageReady}
        aria-hidden={pageReady}
      >
        <ProductDetailSkeleton />
      </div>

      <div className={cn("detailPageContent", pageReady && "detailPageContent--visible")}>
      <main className="detailMainSection">
        <div className="detailContaine">
          <ProductDetailPager nextProduct={nextProduct} />
          <div className="detailContentGrid">
            <ProductCarousel slides={slides} onReady={handleCarouselReady} />

            <div className="detailInfoPanel">
              <span className="detailEyebrow">Explore Our Products</span>
              <h1 className="detailProductTitle">{product.title}</h1>

              {(descriptionSection || accordionSections.length > 0 || youtubeVideoId) && (
                <div className="detailAccordion">
                  {descriptionSection ? renderAccordionItem(descriptionSection) : null}
                  {youtubeVideoId ? (
                    <button
                      type="button"
                      onClick={() => setYoutubeOpen(true)}
                      className="detailSeeVideoButton"
                    >
                      <SocialPlatformIcon platform="youtube" className="detailSeeVideoButton-icon" />
                      <span>{youtubeButtonLabel}</span>
                    </button>
                  ) : null}
                  {accordionSections.map((section) => renderAccordionItem(section))}
                </div>
              )}

              <div className="detailActionStack">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="detailPrimaryButton"
                >
                  <Mail aria-hidden />
                  <span>Send Enquiry</span>
                </button>
                {product.brochureUrl ? (
                  <a
                    href={product.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={product.brochureFilename ?? undefined}
                    className="detailSecondaryButton"
                  >
                    <FileText className="detailPdfIcon" aria-hidden />
                    <span>{product.brochureLabel || "Download Cut Sheet"}</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>

      <ProductEnquiryModal
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
        productId={product.id}
        productTitle={product.title}
        imagePath={product.gallery[0]?.path}
      />
      {youtubeVideoId ? (
        <ProductYoutubeModal
          open={youtubeOpen}
          onOpenChange={setYoutubeOpen}
          videoId={youtubeVideoId}
          title={product.title}
        />
      ) : null}
      {sectionImage ? (
        <ProductSectionImageModal
          open={Boolean(sectionImage)}
          onOpenChange={(open) => {
            if (!open) setSectionImage(null);
          }}
          imageSrc={sectionImage.src}
          alt={sectionImage.alt}
          title={sectionImage.title}
        />
      ) : null}
    </div>
  );
}
