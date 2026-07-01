-- Live fix: BlogComment columns missing (parentId, ip, geo fields, etc.)
--
-- RECOMMENDED (after git pull):
--   npm run db:migrate:deploy
--   npx prisma generate
--
-- If migrate deploy fails, run this SQL then mark migration applied:
--   psql "$DATABASE_URL" -f scripts/fix-blog-comment-columns.sql
--   npx prisma migrate resolve --applied 20250608120000_blog_comment_reply_fields
--   npx prisma generate

ALTER TABLE "BlogComment" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN IF NOT EXISTS "ip" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN IF NOT EXISTS "pageUrl" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN IF NOT EXISTS "geoCountry" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN IF NOT EXISTS "geoRegion" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN IF NOT EXISTS "geoCity" TEXT;

CREATE INDEX IF NOT EXISTS "BlogComment_postId_parentId_idx"
  ON "BlogComment"("postId", "parentId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BlogComment_parentId_fkey'
  ) THEN
    ALTER TABLE "BlogComment"
      ADD CONSTRAINT "BlogComment_parentId_fkey"
      FOREIGN KEY ("parentId") REFERENCES "BlogComment"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
