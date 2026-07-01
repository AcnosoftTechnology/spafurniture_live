export type WxrCategory = {
  domain: string;
  name: string;
  nicename: string;
};

export type WxrItem = {
  wpPostId: string;
  title: string;
  slug: string;
  postType: string;
  status: string;
  content: string;
  excerpt: string;
  date: string;
  /** WordPress dc:creator / author login display */
  creator: string;
  link: string;
  attachmentUrl: string;
  categories: WxrCategory[];
  postmeta: Record<string, string>;
  parentId: string;
};

export type ParseWxrOptions = {
  /** Only include these post types (lowercase) */
  postTypes?: string[];
  /** Exclude these post types */
  excludePostTypes?: string[];
};
