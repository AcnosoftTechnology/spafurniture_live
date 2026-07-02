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
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https:;
      font-src 'self' data:;
      frame-src 'self' https://www.google.com https://maps.google.com https://e.issuu.com https://issuu.com https://*.issuu.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com;
    `.replace(/\n/g, " "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  /** Match WordPress / spafurniture.in URLs (e.g. /products/wooden-shirodhara-stand/) */
  trailingSlash: true,
  /** Auth.js calls /api/auth/session (no slash); avoid 308 → HTML parse errors in the client. */
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ["sanitize-html"],
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
      source: "/massage-tables",
      destination: "/massage-beds/",
      permanent: true,
     },
     {
        source: "/product/:slug",
        destination: "/products/:slug/",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/:slug/",
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
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
