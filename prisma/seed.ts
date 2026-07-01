import { PrismaClient, UserRole, ContentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultAboutContent } from "../src/features/about/schemas/about-content.schema";
import { defaultClientsPageContent } from "../src/features/clients/schemas/clients-content.schema";
import { defaultBrochurePageContent } from "../src/features/brochure/schemas/brochure-content.schema";
import { defaultHomepageContent } from "../src/features/homepage/schemas/homepage-content.schema";

const prisma = new PrismaClient();

async function ensureMedia(path: string, filename: string) {
  const existing = await prisma.media.findFirst({ where: { path } });
  if (existing) return existing;
  return prisma.media.create({
    data: { filename, path, mime: "image/png", size: 0 },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@spafurniture.local" },
    update: {
      passwordHash,
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
      status: "ACTIVE",
    },
    create: {
      email: "admin@spafurniture.local",
      passwordHash,
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
    },
  });

  const menu = await prisma.menu.upsert({
    where: { name: "main" },
    update: {},
    create: { name: "main" },
  });

  const menuItems = [
    { label: "Home", url: "/", sortOrder: 0 },
    { label: "Products", url: "/products", sortOrder: 1 },
    { label: "About", url: "/about", sortOrder: 2 },
    { label: "Clients", url: "/clients", sortOrder: 3 },
    { label: "Brochure", url: "/brochure", sortOrder: 4 },
    { label: "Blog", url: "/blog", sortOrder: 5 },
    { label: "Contact", url: "/contact-us", sortOrder: 6 },
  ];

  const existingItems = await prisma.menuItem.count({ where: { menuId: menu.id } });
  if (existingItems === 0) {
    for (const item of menuItems) {
      await prisma.menuItem.create({ data: { ...item, menuId: menu.id } });
    }
    await prisma.menuItem.create({
      data: {
        menuId: menu.id,
        label: "Massage Beds",
        url: "/massage-beds",
        sortOrder: 1,
        parentId: (
          await prisma.menuItem.findFirst({ where: { menuId: menu.id, label: "Products" } })
        )?.id,
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "site" },
    update: {},
    create: {
      key: "site",
      value: {
        name: "Esthetica Spa Furniture",
        tagline: "Premium spa & salon furniture",
        branding: {
          siteLogoPath: "/assets/images/header/Spa-furniture-logo-2.png",
          faviconPath: "",
          adminLogoPath: "",
          shippingLogoPath: "/assets/images/header/World-Wide-Shipping-Logo.png",
          footerLogoPath: "/assets/images/footer/logo-footer.png",
        },
        header: {
          exploreCtaLabel: "Explore Our Products",
          exploreCtaHref: "/products/",
        },
        contact: {
          businessName: "ESTHETICA SPA AND SALON RESOURCES PVT. LTD",
          email: "info@spafurniture.in",
          phone: "+919873144051",
          whatsapp: "+919873144051",
          address:
            "Plot No. 249, Sector 6, IMT Manesar, Gurgaon-122050, Haryana, India",
        },
        social: [
          { platform: "facebook", href: "#" },
          { platform: "instagram", href: "#" },
          { platform: "linkedin", href: "#" },
        ],
        features: { blogComments: false, productReviews: true },
      },
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "massage-beds" },
    update: { homepageFeatured: true },
    create: {
      title: "Massage Beds",
      slug: "massage-beds",
      description: "Massage beds are the centre of any treatment room. Premium hardwood, comfy cushioning, and adjustable settings make our massage beds a cut above the rest.",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      sortOrder: 1,
      homepageFeatured: true,
      seoTitle: "Massage Beds | Esthetica Spa Furniture",
      metaDescription: "Explore our range of professional massage beds.",
    },
  });

  const categorySeeds = [
    {
      slug: "spa-stools",
      title: "Spa Stools",
      description: "Spa stools are a versatile addition to any wellness setting. Compact, portable, and comfortable.",
      sortOrder: 2,
      imagePath: "/assets/images/furniture/pro3.png",
    },
    {
      slug: "spa-trolleys",
      title: "Spa Trolleys",
      description: "Keep your essential tools and products organized and within reach with our stylish and functional spa trolleys.",
      sortOrder: 3,
      imagePath: "/assets/images/furniture/pro2.png",
    },
  ] as const;

  for (const item of categorySeeds) {
    const thumb = await ensureMedia(item.imagePath, item.imagePath.split("/").pop() ?? "image.png");
    await prisma.category.upsert({
      where: { slug: item.slug },
      update: { homepageFeatured: true, thumbMediaId: thumb.id },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        sortOrder: item.sortOrder,
        homepageFeatured: true,
        thumbMediaId: thumb.id,
      },
    });
  }

  const massageThumb = await ensureMedia("/assets/images/furniture/11.png", "11.png");
  await prisma.category.update({
    where: { id: category.id },
    data: { thumbMediaId: massageThumb.id },
  });

  await prisma.product.upsert({
    where: { slug: "wooden-shirodhara-stand" },
    update: {},
    create: {
      title: "Wooden Shirodhara Stand With Head Rest Support",
      slug: "wooden-shirodhara-stand",
      shortDesc:
        "Wooden Shirodhara stand with height-adjustable head support, oil collection and drainage. Solid wood with Italian PU coatings. Dhara pot 3.5L with flow control valve.",
      dimensions: "L 61 x W 71 x H 214 cm",
      priceDisplay: "Enquire for price",
      featured: true,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      categories: {
        create: { categoryId: category.id, isPrimary: true },
      },
      features: {
        create: [
          { label: "Height-adjustable wooden head support", value: "", sortOrder: 0 },
          { label: "Oil collection and drainage system", value: "", sortOrder: 1 },
          { label: "4 wheels for easy mobility", value: "", sortOrder: 2 },
          { label: "3.5L dhara pot with flow control valve", value: "", sortOrder: 3 },
        ],
      },
      seoTitle: "Buy Ayurveda Wooden Shiridhara Stand with Head Support",
      canonicalUrl: "https://www.spafurniture.in/products/wooden-shirodhara-stand/",
    },
  });

  await prisma.page.upsert({
    where: { slug: "about" },
    update: {
      title: "About Us",
      status: ContentStatus.PUBLISHED,
      seoTitle: "About Esthetica | Spa & Wellness Furniture Manufacturer",
      metaDescription:
        "Established in 2011, Esthetica manufactures premium spa, wellness and medical furniture from a 34,000 sq ft facility in Manesar, India.",
      publishedAt: new Date(),
    },
    create: {
      title: "About Us",
      slug: "about",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      seoTitle: "About Esthetica | Spa & Wellness Furniture Manufacturer",
      metaDescription:
        "Established in 2011, Esthetica manufactures premium spa, wellness and medical furniture from a 34,000 sq ft facility in Manesar, India.",
    },
  });

  await prisma.page.upsert({
    where: { slug: "clients" },
    update: {
      title: "Our Clients",
      status: ContentStatus.PUBLISHED,
      seoTitle: "Our Clients | Trusted Spa Furniture Partner – Esthetica",
      metaDescription:
        "Esthetica supplies luxury spa furniture to leading hotels, resorts and wellness brands across India and worldwide.",
      publishedAt: new Date(),
    },
    create: {
      title: "Our Clients",
      slug: "clients",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      seoTitle: "Our Clients | Trusted Spa Furniture Partner – Esthetica",
      metaDescription:
        "Esthetica supplies luxury spa furniture to leading hotels, resorts and wellness brands across India and worldwide.",
    },
  });

  await prisma.page.upsert({
    where: { slug: "brochure" },
    update: {
      title: "Brochure",
      status: ContentStatus.PUBLISHED,
      seoTitle: "Spa Furniture Brochure | Esthetica",
      metaDescription:
        "Browse the Esthetica spa furniture digital brochure and download the PDF catalogue.",
      publishedAt: new Date(),
    },
    create: {
      title: "Brochure",
      slug: "brochure",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      seoTitle: "Spa Furniture Brochure | Esthetica",
      metaDescription:
        "Browse the Esthetica spa furniture digital brochure and download the PDF catalogue.",
    },
  });

  await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      title: "Esthetica Spa Furniture",
      slug: "home",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      seoTitle: "Luxury Spa Furniture Manufacturer | Esthetica",
      metaDescription:
        "Premium spa and salon furniture — massage beds, spa tables, trolleys, loungers and wellness furniture manufactured in India with worldwide delivery.",
      keywords: ["spa furniture", "massage beds", "spa tables", "salon furniture"],
      robots: "index,follow",
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "homepage" },
    update: {},
    create: { key: "homepage", value: defaultHomepageContent },
  });

  await prisma.siteSetting.upsert({
    where: { key: "about" },
    update: {},
    create: { key: "about", value: defaultAboutContent },
  });

  await prisma.siteSetting.upsert({
    where: { key: "clients" },
    update: {},
    create: { key: "clients", value: defaultClientsPageContent },
  });

  await prisma.siteSetting.upsert({
    where: { key: "brochure" },
    update: {},
    create: { key: "brochure", value: defaultBrochurePageContent },
  });

  await prisma.faq.deleteMany({ where: { entityType: "HOMEPAGE", entityId: "home" } });
  await prisma.faq.createMany({
    data: [
      {
        entityType: "HOMEPAGE",
        entityId: "home",
        question: "What products do you offer under your spa furniture category?",
        answer: "We offer a comprehensive range of spa furniture, including tables, trolleys, loungers, stools, and accessories.",
        sortOrder: 0,
      },
      {
        entityType: "HOMEPAGE",
        entityId: "home",
        question: "Do you manufacture luxury spa furniture?",
        answer: "Yes, we specialize in premium luxury spa furniture crafted with modern aesthetics and durability.",
        sortOrder: 1,
      },
      {
        entityType: "HOMEPAGE",
        entityId: "home",
        question: "Do you supply massage beds internationally?",
        answer: "Yes, we provide worldwide delivery through our global distributor network.",
        sortOrder: 2,
      },
    ],
  });

  console.log("Seed complete. Admin:", admin.email, "/ Admin@123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
