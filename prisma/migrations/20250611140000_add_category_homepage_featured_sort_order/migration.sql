-- AlterTable
ALTER TABLE "Category" ADD COLUMN "homepageFeaturedSortOrder" INTEGER NOT NULL DEFAULT 0;

-- Preserve current homepage order based on general sort order
UPDATE "Category"
SET "homepageFeaturedSortOrder" = "sortOrder"
WHERE "homepageFeatured" = true;
