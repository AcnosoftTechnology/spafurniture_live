"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-stone-500">Esthetica</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-stone-900 lg:text-6xl">
            Premium spa & salon furniture
          </h1>
          <p className="mt-6 text-lg text-stone-600">
            Engineered for wellness professionals. Browse our catalogue and enquire for pricing — dedicated B2B support.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-full bg-stone-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              View Products
            </Link>
            <Link
              href="/contact-us"
              className="rounded-full border border-stone-300 px-8 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-900"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
