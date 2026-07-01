import Link from "next/link";
import type { SiteConfig } from "@/lib/site-settings";

export function SiteFooter({ site }: { site?: SiteConfig }) {
  const email = site?.contact?.email ?? "info@spafurniture.in";
  const phone = site?.contact?.phone ?? "+919873144051";

  return (
    <footer className="border-t border-stone-700 bg-[#2b2b2b] text-stone-300">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 border-b border-stone-700 pb-8 text-xs text-stone-500">
          <span>GEPIL</span>
          <span>HEMS</span>
          <span>ISO 9001</span>
          <span>Google Reviews</span>
          <span>FIEO</span>
          <span>Made in India</span>
          <span>15 Years in Business</span>
        </div>

        <div className="py-10 text-center">
          <p className="font-display text-lg text-white">Reach us today</p>
          <p className="mt-4 text-sm text-stone-400">
            <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
            {" / "}
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-white">{phone}</a>
          </p>
          <p className="mt-4 text-xs text-stone-500">
            <strong className="text-stone-400">Worldwide Delivery</strong> through our network of distributors available globally.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4 border-t border-stone-700 pt-8">
          <div className="md:col-span-2">
            <p className="font-display text-lg font-semibold text-white">Esthetica</p>
            <p className="mt-2 max-w-sm text-sm text-stone-400">
              Premium spa and salon furniture manufacturer. Enquiry-based catalogue for B2B clients worldwide.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Products</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/massage-beds" className="hover:text-white">Massage Beds</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Company</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/contact-us" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-stone-700 pt-6 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} Esthetica Spa and Salon Resources Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
