import { z } from "zod";

export const logoItemSchema = z.object({
  title: z.string(),
  imagePath: z.string(),
  mediaId: z.string().nullable().optional(),
});

export const homepageContentSchema = z.object({
  hero: z.object({
    imagePath: z.string(),
    alt: z.string().default("Spa furniture"),
    mediaId: z.string().nullable().optional(),
  }),
  backgroundText: z.object({
    text: z.string(),
    ctaLabel: z.string().default("OUR BACKGROUND"),
    ctaHref: z.string().default("/about/"),
  }),
  productsIntro: z.object({
    tag: z.string(),
    heading: z.string(),
    body: z.string(),
  }),
  speciality: z.object({
    tag: z.string(),
    title: z.string(),
    description: z.string(),
    cards: z.array(z.object({ title: z.string(), imagePath: z.string(), mediaId: z.string().nullable().optional() })),
  }),
  howWeDo: z.object({
    tag: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    logos: z.array(logoItemSchema),
  }),
  clients: z.object({
    tag: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    logos: z.array(logoItemSchema),
    cta: z.object({ label: z.string(), href: z.string() }).nullable().optional(),
  }),
  header: z.object({
    logoPath: z.string(),
    shippingLogoPath: z.string(),
    exploreCtaLabel: z.string(),
    exploreCtaHref: z.string(),
  }),
  footer: z.object({
    certifications: z.array(
      z.object({
        imagePath: z.string(),
        alt: z.string().optional(),
        href: z.string().optional(),
        openInNewTab: z.boolean().optional(),
      }),
    ),
    miniLogoPath: z.string(),
    tagline: z.string(),
    social: z.array(z.object({ platform: z.string(), href: z.string() })),
  }),
});

export type HomepageContent = z.infer<typeof homepageContentSchema>;

export const defaultHomepageContent: HomepageContent = {
  hero: {
    imagePath: "/assets/images/bg/spa-main.png",
    alt: "Spa bed",
  },
  backgroundText: {
    text: "Combining design innovation with aesthetics to redefine the standards of spa and wellness furniture. Our spa furniture adheres to the highest international quality standards, reflecting our unwavering commitment to delivering top-tier products.",
    ctaLabel: "OUR BACKGROUND",
    ctaHref: "/about/",
  },
  productsIntro: {
    tag: "OUR PRODUCTS",
    heading: "Crafted till\nPerfection",
    body: "Explore our extensive collection, featuring high-end electric massage beds, specialized spa beds, hydraulic massage tables, spa treatment tables, Ayurvedic massage tables, spa trolleys, spa stools, relaxation loungers, manicure tables, and luxury pedicure chairs. Each piece is meticulously crafted to enhance the ambience and functionality of your spa while redefining modern comfort and design.",
  },
  speciality: {
    tag: "OUR SPECIALITY",
    title: "Customised To Your Aesthetics",
    description:
      "Our manufacturing unit empowers you to personalize your furniture down to the last detail. Choose from a spectrum of wood stain colours and upholstery options to create a piece that seamlessly integrates with your space.",
    cards: [
      { title: "Wood Finish", imagePath: "/assets/images/speciality/wood.png" },
      { title: "Premium Finish", imagePath: "/assets/images/speciality/finish.png" },
      { title: "Upholstery", imagePath: "/assets/images/speciality/upholstery.png" },
    ],
  },
  howWeDo: {
    tag: "HOW WE DO",
    title: "What We Do",
    paragraphs: [
      "Esthetica specializes in precision manufacturing luxury spa furniture, including high-end spa tables, massage bed ranges, spa treatment tables, and Ayurveda tables.",
      "Our in-house team works closely with architects, designers, and spa consultants to deliver solutions that meet global standards.",
    ],
    logos: [
      { title: "Hotel Pietro di Luna, Italy", imagePath: "/assets/images/1.jpg" },
      { title: "ITC Grand Bharat", imagePath: "/assets/images/2.jpg" },
      { title: "Shangri-La Sentosa Spa, Singapore", imagePath: "/assets/images/3.jpg" },
      { title: "Six Senses, Dehradun", imagePath: "/assets/images/4.jpg" },
      { title: "Multipurpose Ayurveda Table", imagePath: "/assets/images/5.jpg" },
      { title: "Wai Ariki Hot Springs & Spa, New Zealand", imagePath: "/assets/images/6.jpg" },
      { title: "Grand Hyatt, Kochi", imagePath: "/assets/images/7.jpg" },
      { title: "Casa Cook, Greece", imagePath: "/assets/images/8.jpg" },
    ],
  },
  clients: {
    tag: "OUR CLIENTS",
    title: "Across The Globe",
    paragraphs: [
      "We are loved around the globe. Our products are used by world-class spa and hospitality brands like Marriott, Hyatt, ITC, Six Senses, Four Seasons and many luxury spa projects across the globe.",
    ],
    logos: [
      { title: "Ashok", imagePath: "/assets/images/clients/Ashok-logo.png" },
      { title: "Bodhi", imagePath: "/assets/images/clients/Bodhi-logonew.png" },
      { title: "Claridges", imagePath: "/assets/images/clients/Claridges-logonew.png" },
      { title: "Leeu", imagePath: "/assets/images/clients/Leeu-logo.png" },
      { title: "Marriot", imagePath: "/assets/images/clients/Marriot-logo.png" },
      { title: "Radisson", imagePath: "/assets/images/clients/Radisson-logo.png" },
      { title: "SSR", imagePath: "/assets/images/clients/SSR-logonew.png" },
      { title: "The Oberoi", imagePath: "/assets/images/clients/The-Oberoi-logonew.png" },
    ],
    cta: { label: "SEE ALL", href: "/contact-us/" },
  },
  header: {
    logoPath: "/assets/images/header/Spa-furniture-logo-2.png",
    shippingLogoPath: "/assets/images/header/World-Wide-Shipping-Logo.png",
    exploreCtaLabel: "Explore Our Products",
    exploreCtaHref: "/products/",
  },
  footer: {
    certifications: [
      { imagePath: "/assets/images/footer/FIEO-3.png", alt: "FIEO" },
      { imagePath: "/assets/images/footer/GEPIL-2.png", alt: "GEPIL" },
      { imagePath: "/assets/images/footer/Google-Reviews.png", alt: "Google Reviews" },
      { imagePath: "/assets/images/footer/HEMS-2.png", alt: "HEMS" },
      { imagePath: "/assets/images/footer/ISO-2.png", alt: "ISO" },
      { imagePath: "/assets/images/footer/MADE-IN-INDIA-2.png", alt: "Made in India" },
      { imagePath: "/assets/images/footer/new-15-years.png", alt: "15 Years" },
    ],
    miniLogoPath: "/assets/images/footer/logo-footer.png",
    tagline: "Worldwide Delivery Through Our Network of Distributors Available Globally.",
    social: [
      { platform: "facebook", href: "#" },
      { platform: "instagram", href: "#" },
      { platform: "youtube", href: "#" },
      { platform: "linkedin", href: "#" },
    ],
  },
};
