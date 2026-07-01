-- AlterTable
ALTER TABLE "Category" ADD COLUMN "homepageFeatureBgMediaId" TEXT;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_homepageFeatureBgMediaId_fkey" FOREIGN KEY ("homepageFeatureBgMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
