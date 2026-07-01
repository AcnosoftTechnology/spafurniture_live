export type SitemapUrlEntry = {
  loc: string;
  lastmod: Date;
  images: string[];
};

export type SitemapIndexEntry = {
  loc: string;
  lastmod: Date;
};

export type SitemapData = {
  baseUrl: string;
  posts: SitemapUrlEntry[];
  pages: SitemapUrlEntry[];
  products: SitemapUrlEntry[];
};

export type SitemapGenerateResult = {
  generatedAt: string;
  counts: {
    posts: number;
    pages: number;
    products: number;
    total: number;
  };
  files: string[];
};
