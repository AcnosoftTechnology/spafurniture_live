-- AlterTable
ALTER TABLE "Category" ADD COLUMN "showInProductNav" BOOLEAN NOT NULL DEFAULT false;

-- Keep existing core catalogue tabs visible until admin changes them
UPDATE "Category"
SET "showInProductNav" = true
WHERE "slug" IN (
  'massage-tables',
  'pedicure-manicure',
  'spa-stools',
  'spa-carts',
  'loungers',
  'salon-furniture',
  'accessories'
);
