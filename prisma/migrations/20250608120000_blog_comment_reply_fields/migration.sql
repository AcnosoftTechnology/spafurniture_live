-- AlterTable
ALTER TABLE "BlogComment" ADD COLUMN "parentId" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN "ip" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN "pageUrl" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN "geoCountry" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN "geoRegion" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN "geoCity" TEXT;

-- CreateIndex
CREATE INDEX "BlogComment_postId_parentId_idx" ON "BlogComment"("postId", "parentId");

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
