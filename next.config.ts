import type { NextConfig } from "next";

// const securityHeaders = [
//   { key: "X-DNS-Prefetch-Control", value: "on" },
//   { key: "X-Frame-Options", value: "SAMEORIGIN" },
//   { key: "X-Content-Type-Options", value: "nosniff" },
//   { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
//   {
//     key: "Content-Security-Policy",
//     value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;",
//   },
// ];

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // {
  //   key: "Content-Security-Policy",
  //   value: `
  //     default-src 'self';
  //     script-src 'self' 'unsafe-inline' 'unsafe-eval';
  //     style-src 'self' 'unsafe-inline';
  //     img-src 'self' data: blob: https:;
  //     font-src 'self' data:;
  //     frame-src 'self' https://www.google.com https://maps.google.com https://e.issuu.com https://issuu.com https://*.issuu.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com;
  //   `.replace(/\n/g, " "),
  // },

  {
  key: "Content-Security-Policy",
  value: `
    default-src 'self';

    script-src
      'self'
      'unsafe-inline'
      'unsafe-eval'
      https://www.google.com
      https://www.gstatic.com
      https://www.recaptcha.net;

    style-src
      'self'
      'unsafe-inline';

    img-src
      'self'
      data:
      blob:
      https:;

    font-src
      'self'
      data:;

    connect-src
      'self'
      https://www.google.com
      https://www.gstatic.com
      https://www.recaptcha.net;

    frame-src
      'self'
      https://www.google.com
      https://www.recaptcha.net
      https://maps.google.com
      https://e.issuu.com
      https://issuu.com
      https://*.issuu.com
      https://www.youtube.com
      https://youtube.com
      https://www.youtube-nocookie.com
      https://youtube-nocookie.com;
  `.replace(/\n/g, " "),
},
];

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * Keep title/canonical/OG in <head> for View Source + all crawlers.
   * Next 15+ otherwise streams generateMetadata into <body>.
   */
  htmlLimitedBots: /.*/,
  /** Match WordPress / spafurniture.in URLs (e.g. /products/wooden-shirodhara-stand/) */
  trailingSlash: true,
  /** Auth.js calls /api/auth/session (no slash); avoid 308 → HTML parse errors in the client. */
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ["sanitize-html", "archiver"],
  /** Default 1MB blocks large uploads via Server Actions (media allows up to 50MB). */
  experimental: {
    serverActions: {
      bodySizeLimit: "52mb",
    },
    /** Large PDF uploads through dev proxy / middleware. */
    proxyClientMaxBodySize: "52mb",
  },
  async rewrites() {
    const sitemapRewrites = [
      "sitemap.xml",
      "sitemap_index.xml",
      "post-sitemap.xml",
      "page-sitemap.xml",
      "products-sitemap.xml",
      "sitemap.xsl",
    ].flatMap((file) => [
      { source: `/${file}`, destination: `/api/site-sitemap/${file}/` },
      { source: `/${file}/`, destination: `/api/site-sitemap/${file}/` },
    ]);

    return [
      ...sitemapRewrites,
      {
        source: "/favicon.ico",
        destination: "/api/site-favicon",
      },
      {
        source: "/apple-touch-icon.png",
        destination: "/api/site-favicon",
      },
    ];
  },
  async redirects() {
    return [
     {
      source: "/manicure-pedicure-chairs/",
      destination: "/pedicure-manicure/",
      permanent: true,
     },
     {
        source: "/products/electric-spa-bed-isa/",
        destination: "https://www.spafurniture.com/products/isa-electric-spa-table/",
        permanent: true,
      },
      {
        source: "/products/electric-spa-bed-marut/",
        destination: "https://www.spafurniture.com/product/marut-electric-spa-table/",
        permanent: true,
      },
      {
        source: "/products/electric-massage-bed-mudit/",
        destination: "https://www.spafurniture.com/product/mudit-electric-spa-table/",
        permanent: true,
      },
      {
        source: "/products/ayurveda-table/",
        destination: "https://www.spafurniture.com/product/ayurveda-bed/",
        permanent: true,
      },
      {
        source: "/products/arindam-spa-massage-table/",
        destination: "https://www.spafurniture.com/products/arindam-spa-massage-bed/",
        permanent: true,
      },
      {
        source: "/products/facial-massage-table-tripti/",
        destination: "https://www.spafurniture.com/product/tripti-facial-massage-bed/",
        permanent: true,
      },
      {
        source: "/products/portable-massage-tables-akriti/",
        destination: "https://www.spafurniture.com/product/akriti-portable-massage-bed/",
        permanent: true,
      },
      {
        source: "/products/portable-reiki-massage-table/",
        destination: "https://www.spafurniture.com/product/soumaya-portable-massage-bed/",
        permanent: true,
      },
      {
        source: "/products/asmit-tilt-massage-table/",
        destination: "https://www.spafurniture.com/product/asmit-tilt-portable-massage-bed/",
        permanent: true,
      },
      {
        source: "/products/sparsh-pre-natal-massage-table/",
        destination: "https://www.spafurniture.com/product/sparsh-pre-natal-portable-massage-bed/",
        permanent: true,
      },
      {
        source: "/products/folding-massage-table/",
        destination: "https://www.spafurniture.com/product/aluminium-folding-massage-bed/",
        permanent: true,
      },

     {
        source: "/product/:slug",
        destination: "/products/:slug/",
        permanent: true,
      },
      {
        source: "/blog/category/:path*",
        destination: "/category/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
