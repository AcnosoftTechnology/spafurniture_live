// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { mediaUrl } from "@/lib/utils";
// import type { NavItem } from "@/components/site/site-header";
// import type { SiteConfig } from "@/features/settings/schemas/site-config.schema";
// import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";

// function normalizePath(path: string) {
//   const trimmed = path.replace(/\/+$/, "") || "/";
//   return trimmed === "" ? "/" : trimmed;
// }

// function isNavLinkActive(pathname: string, url?: string | null) {
//   if (!url) return false;
//   const target = normalizePath(url);
//   const current = normalizePath(pathname);
//   if (target === "/") return current === "/";
//   return current === target || current.startsWith(`${target}/`);
// }

// export function EsthHeader({
//   menuLinks,
//   site,
//   homepageHeader,
// }: {
//   menuLinks: NavItem[];
//   site: SiteConfig;
//   homepageHeader: HomepageContent["header"];
// }) {
//   const pathname = usePathname();
//   const isHomePage = pathname === "/";
//   const [isOpen, setIsOpen] = useState(false);

//   const logoPath = site.branding.siteLogoPath || homepageHeader.logoPath;
//   const shippingPath = site.branding.shippingLogoPath || homepageHeader.shippingLogoPath;
//   const ctaLabel = (
//     site.header.exploreCtaLabel ||
//     homepageHeader.exploreCtaLabel ||
//     "explore our products"
//   ).toLowerCase();
//   const ctaHref = site.header.exploreCtaHref || homepageHeader.exploreCtaHref;

//   const overlayLinks = menuLinks.filter(
//     (item) => item.label.trim().toLowerCase() !== "home",
//   );

//   useEffect(() => {
//     setIsOpen(false);
//   }, [pathname]);

//   useEffect(() => {
//     document.body.classList.toggle("esth-menu-open", isOpen);
//     return () => document.body.classList.remove("esth-menu-open");
//   }, [isOpen]);

//   return (
//     <section className="header-section">
//           <header className={`main-header wolfe-type-2 ${isOpen ? "menu-open site-header-active" : ""}`}>
//         <div className="header-inner wolfe-head-top">
//           <div className="site-logo logo">
//             <Link href="/">
//               <Image
//                 src={mediaUrl(logoPath)}
//                 alt={site.name || "Spa Furniture Logo"}
//                 width={300}
//                 height={100}
//                 priority
//                 className="esth-header-logo-img h-auto"
//               />
//             </Link>
//           </div>

//           {shippingPath ? (
//             <div
//               className={`shipping-text sticky-header-icon ${isHomePage ? "shipping-text--desktop" : "shipping-text--mobile-only"}`}
//             >
//               <Link href="/">
//                 <Image
//                   src={mediaUrl(shippingPath)}
//                   alt="Worldwide shipping"
//                   width={180}
//                   height={38}
//                   className="esth-header-shipping-img mx-auto h-auto w-full"
//                   sizes="(max-width: 768px) 88px, 180px"
//                 />
//               </Link>
//             </div>
//           ) : null}

//           <Link href={ctaHref} className="explore-btn explore">
//             {ctaLabel}
//           </Link>

//           <button
//             className={`menu-toggle navbar-toggle ${isOpen ? "active" : ""}`}
//             type="button"
//             aria-label={isOpen ? "Close menu" : "Open menu"}
//             aria-expanded={isOpen}
//             onClick={() => setIsOpen((prev) => !prev)}
//           >
//             <span />
//             <span />
//             <span />
//           </button>
//         </div>

//         <nav
//           className={`slide-menu ${isOpen ? "active" : ""}`}
//           aria-label="Main navigation"
//           aria-hidden={!isOpen}
//         >
//             <div className="menu-inner">
//               {overlayLinks.map((item, index) => {
//                 const hasChildren = Boolean(item.children?.length);
//                 const active = isNavLinkActive(pathname, item.url);

//                 return (
//                   <div
//                     key={item.label}
//                     className={`esth-nav-item ${hasChildren ? "esth-nav-item--has-children" : ""}`}
//                     style={{ transitionDelay: isOpen ? `${80 + index * 55}ms` : "0ms" }}
//                   >
//                     <Link
//                       href={item.url ?? "#"}
//                       className={active ? "is-active" : undefined}
//                       onClick={() => setIsOpen(false)}
//                     >
//                       {item.label.toUpperCase()}
//                     </Link>
//                     {hasChildren ? (
//                       <div className="esth-nav-dropdown" role="group" aria-label={`${item.label} submenu`}>
//                         {item.children!.map((child) => (
//                           <Link
//                             key={`${item.label}-${child.label}`}
//                             href={child.url ?? "#"}
//                             className={isNavLinkActive(pathname, child.url) ? "is-active" : undefined}
//                             onClick={() => setIsOpen(false)}
//                           >
//                             {child.label}
//                           </Link>
//                         ))}
//                       </div>
//                     ) : null}
//                   </div>
//                 );
//               })}
//             </div>
//           </nav>
//       </header>
//     </section>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mediaUrl } from "@/lib/utils";
import type { NavItem } from "@/components/site/site-header";
import type { SiteConfig } from "@/features/settings/schemas/site-config.schema";
import type { HomepageContent } from "@/features/homepage/schemas/homepage-content.schema";

function normalizePath(path: string) {
  const trimmed = path.replace(/\/+$/, "") || "/";
  return trimmed === "" ? "/" : trimmed;
}

function isNavLinkActive(pathname: string, url?: string | null) {
  if (!url) return false;

  const target = normalizePath(url);
  const current = normalizePath(pathname);

  if (target === "/") return current === "/";

  return current === target || current.startsWith(`${target}/`);
}

export function EsthHeader({
  menuLinks,
  site,
  homepageHeader,
}: {
  menuLinks: NavItem[];
  site: SiteConfig;
  homepageHeader: HomepageContent["header"];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const logoPath =
    site.branding.siteLogoPath || homepageHeader.logoPath;

  const shippingPath =
    site.branding.shippingLogoPath ||
    homepageHeader.shippingLogoPath;

  const ctaLabel = (
    site.header.exploreCtaLabel ||
    homepageHeader.exploreCtaLabel ||
    "explore our products"
  ).toLowerCase();

  const ctaHref =
    site.header.exploreCtaHref ||
    homepageHeader.exploreCtaHref;

  const overlayLinks = menuLinks.filter(
    (item) => item.label.trim().toLowerCase() !== "home"
  );

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("esth-menu-open", isOpen);

    return () => {
      document.body.classList.remove("esth-menu-open");
    };
  }, [isOpen]);

  return (
    <section className="header-section">
      <header
        className={`main-header wolfe-type-2 ${
          isOpen ? "menu-open site-header-active" : ""
        }`}
      >
        <div className="header-inner wolfe-head-top">
          <div className="site-logo logo">
            <Link href="/">
              <Image
                src={mediaUrl(logoPath)}
                alt={site.name || "Spa Furniture Logo"}
                width={300}
                height={100}
                priority
                className="esth-header-logo-img h-auto"
              />
            </Link>
          </div>

          {shippingPath ? (
            <div className="shipping-text sticky-header-icon shipping-text--desktop">
              <Link href="/">
                <Image
                  src={mediaUrl(shippingPath)}
                  alt="Worldwide shipping"
                  width={180}
                  height={38}
                  className="esth-header-shipping-img mx-auto h-auto w-full"
                  sizes="(max-width: 768px) 88px, 180px"
                />
              </Link>
            </div>
          ) : null}

          <Link href={ctaHref} className="explore-btn explore">
            {ctaLabel}
          </Link>

          <button
            className={`menu-toggle navbar-toggle ${
              isOpen ? "active" : ""
            }`}
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav
          className={`slide-menu ${isOpen ? "active" : ""}`}
          aria-label="Main navigation"
          aria-hidden={!isOpen}
        >
          <div className="menu-inner">
            {overlayLinks.map((item, index) => {
              const hasChildren = Boolean(item.children?.length);
              const active = isNavLinkActive(pathname, item.url);

              return (
                <div
                  key={`${item.label}-${index}`}
                  className={`esth-nav-item ${
                    hasChildren
                      ? "esth-nav-item--has-children"
                      : ""
                  }`}
                  style={{
                    transitionDelay: isOpen
                      ? `${80 + index * 55}ms`
                      : "0ms",
                  }}
                >
                  <Link
                    href={item.url ?? "#"}
                    className={active ? "is-active" : undefined}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label.toUpperCase()}
                  </Link>

                  {hasChildren ? (
                    <div
                      className="esth-nav-dropdown"
                      role="group"
                      aria-label={`${item.label} submenu`}
                    >
                      {item.children!.map(
                        (child, childIndex) => (
                          <Link
                            key={`${item.label}-${child.label}-${childIndex}`}
                            href={child.url ?? "#"}
                            className={
                              isNavLinkActive(
                                pathname,
                                child.url
                              )
                                ? "is-active"
                                : undefined
                            }
                            onClick={() => setIsOpen(false)}
                          >
                            {child.label}
                          </Link>
                        )
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </nav>
      </header>
    </section>
  );
}