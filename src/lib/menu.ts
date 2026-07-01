import { prisma } from "@/lib/prisma";
import type { NavItem } from "@/components/site/site-header";

const defaultNav: NavItem[] = [
  { label: "Home", url: "/" },
  {
    label: "Products",
    url: "/products",
    children: [
      { label: "All Products", url: "/products" },
      { label: "Massage Beds", url: "/massage-beds" },
    ],
  },
  { label: "About", url: "/about" },
  { label: "Clients", url: "/clients" },
  { label: "Brochure", url: "/brochure" },
  { label: "Blog", url: "/blog" },
  { label: "Contact", url: "/contact-us" },
];

export async function getMainMenu(): Promise<NavItem[]> {
  try {
    const menu = await prisma.menu.findUnique({
      where: { name: "main" },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { sortOrder: "asc" },
          include: { children: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    if (!menu?.items.length) return defaultNav;
    return menu.items.map((item) => ({
      label: item.label,
      url: item.url,
      children: item.children.map((c) => ({ label: c.label, url: c.url })),
      megaPanel: item.megaPanel as NavItem["megaPanel"],
    }));
  } catch {
    return defaultNav;
  }
}
