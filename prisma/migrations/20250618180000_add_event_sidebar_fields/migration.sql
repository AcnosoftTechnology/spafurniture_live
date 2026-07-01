-- AlterTable
ALTER TABLE "Event" ADD COLUMN "findUsTitle" TEXT NOT NULL DEFAULT 'Find Us';
ALTER TABLE "Event" ADD COLUMN "findUsBody" TEXT NOT NULL DEFAULT 'Come and find Esthetica at a selection of upcoming, shows, events and exhibitions!';
ALTER TABLE "Event" ADD COLUMN "contactTitle" TEXT NOT NULL DEFAULT 'Get in Touch!';
ALTER TABLE "Event" ADD COLUMN "contactBody" TEXT NOT NULL DEFAULT 'Call and speak to our sales team today!';
ALTER TABLE "Event" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '+91 98731 44051';
ALTER TABLE "Event" ADD COLUMN "phoneHref" TEXT NOT NULL DEFAULT 'tel:+919873144051';
