-- AlterTable
ALTER TABLE "Product" ADD COLUMN "dimensionsMediaId" TEXT;
ALTER TABLE "Product" ADD COLUMN "featuresMediaId" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_dimensionsMediaId_fkey" FOREIGN KEY ("dimensionsMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_featuresMediaId_fkey" FOREIGN KEY ("featuresMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
