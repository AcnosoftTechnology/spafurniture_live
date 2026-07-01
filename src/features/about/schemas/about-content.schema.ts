import { z } from "zod";

const imageRefSchema = z.object({
  imagePath: z.string(),
  mediaId: z.string().nullable().optional(),
  alt: z.string().optional(),
});

export const aboutBannerEffectSchema = z.enum(["fade", "slide", "zoom", "flip", "cube", "signature"]);
export type AboutBannerEffect = z.infer<typeof aboutBannerEffectSchema>;

export const aboutBannerSlideSchema = z.object({
  imagePath: z.string(),
  mediaId: z.string().nullable().optional(),
  alt: z.string().default("Esthetica team"),
  overlayText: z.string(),
});

export const aboutTeamBannerSchema = z.object({
  autoplaySeconds: z.number().min(2).max(60).default(6),
  transitionEffect: aboutBannerEffectSchema.default("fade"),
  slides: z.array(aboutBannerSlideSchema).min(1),
});

export type AboutBannerSlide = z.infer<typeof aboutBannerSlideSchema>;
export type AboutTeamBanner = z.infer<typeof aboutTeamBannerSchema>;

export const aboutContentSchema = z.object({
  intro: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
  }),
  teamBanner: aboutTeamBannerSchema,
  body: z.object({
    subheading: z.string(),
    paragraphs: z.array(z.string()),
    gallery: z.array(imageRefSchema),
  }),
  cta: z.object({
    text: z.string(),
    buttonLabel: z.string(),
    buttonHref: z.string(),
    backgroundImagePath: z.string(),
    mediaId: z.string().nullable().optional(),
  }),
});

export type AboutContent = z.infer<typeof aboutContentSchema>;

export const defaultAboutContent: AboutContent = {
  intro: {
    eyebrow: "ABOUT US",
    title: "Who we are",
    body: "Welcome to Esthetica – Your pinnacle of elegance and functionality in Spa, Wellness, and Healthcare Furniture. Established in 2011, Esthetica takes pride in being a distinguished manufacturer of premium spa and wellness furniture. Over the years, we have evolved into a leading brand, expanding our expertise to include the production of top-quality Medical Furniture.",
  },
  teamBanner: {
    autoplaySeconds: 6,
    transitionEffect: "signature",
    slides: [
      {
        imagePath: "/uploads/2016/06/about.jpg",
        alt: "Esthetica team",
        overlayText:
          "We are a team of professionals and skilled craftsmen committed to producing high-quality Treatment tables for spas, wellness centres and medical clinics.",
      },
    ],
  },
  body: {
    subheading:
      "We deliver a diverse product range on time, every time with quick lead times using modern woodworking machines",
    paragraphs: [
      "Our commitment to excellence has made us a trusted choice for distributors, spa management companies, and spa consultants worldwide, with our products being loved, used, and recommended on a global scale.",
      "At the heart of our success is a state-of-the-art manufacturing facility spanning 34,000 square feet, equipped with cutting-edge technology and operated by a skilled team of more than 100 dedicated professionals.",
      "Our mission at Esthetica is clear – to manufacture top-of-the-line furniture for the spa, wellness, and healthcare sectors. We prioritize using the finest raw materials and adhering to the best manufacturing practices, ensuring that each product not only meets but exceeds industry standards.",
      "What sets us apart is our relentless pursuit of perfection. We go beyond merely crafting furniture; we curate experiences. Every design is a thoughtful blend of aesthetics and practicality, resulting in furniture that elevates the ambiance of spas, wellness centers, and healthcare facilities alike.",
      'Esthetica remains dedicated to pushing the boundaries of what is possible in <a href="/massage-tables/">spa</a> and <a href="https://www.estheticamedicalfurniture.com/" target="_blank" rel="noopener noreferrer">healthcare furniture</a>. We invite you to explore our range of meticulously crafted products and join us in the pursuit of creating spaces that redefine comfort, style, and sophistication.',
      "Esthetica – Where Form Meets Function, and Luxury is a Standard.",
    ],
    gallery: [
      { imagePath: "/assets/images/1.jpg", alt: "Woodworking" },
      { imagePath: "/assets/images/2.jpg", alt: "Craftsmanship" },
      { imagePath: "/assets/images/3.jpg", alt: "Manufacturing" },
      { imagePath: "/assets/images/4.jpg", alt: "Upholstery" },
    ],
  },
  cta: {
    text: "We are always ready to work for exciting and ambitious clients. If you love our products, please get in touch.",
    buttonLabel: "Let's Collaborate",
    buttonHref: "/contact-us/",
    backgroundImagePath: "/assets/images/bg/bg-icon.png",
  },
};

export const ABOUT_SETTING_KEY = "about";
export const ABOUT_PAGE_ID_KEY = "about_page_id";
