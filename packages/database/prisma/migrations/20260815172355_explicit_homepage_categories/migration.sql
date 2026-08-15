-- AlterTable
ALTER TABLE "HomepageSection" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "HomepageFeaturedCategory" (
    "id" TEXT NOT NULL,
    "homepageId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HomepageFeaturedCategory_pkey" PRIMARY KEY ("id")
);

-- Preserve Data: Copy existing relationships from the implicit join table
INSERT INTO "HomepageFeaturedCategory" ("id", "homepageId", "categoryId", "displayOrder")
SELECT 
    md5("B" || '_' || "A"), 
    "B", 
    "A", 
    (ROW_NUMBER() OVER(PARTITION BY "B" ORDER BY "A")) - 1 
FROM "_HomepageCategories";

-- DropForeignKey
ALTER TABLE "_HomepageCategories" DROP CONSTRAINT "_HomepageCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_HomepageCategories" DROP CONSTRAINT "_HomepageCategories_B_fkey";

-- DropTable
DROP TABLE "_HomepageCategories";

-- CreateIndex
CREATE UNIQUE INDEX "HomepageFeaturedCategory_homepageId_categoryId_key" ON "HomepageFeaturedCategory"("homepageId", "categoryId");

-- AddForeignKey
ALTER TABLE "HomepageFeaturedCategory" ADD CONSTRAINT "HomepageFeaturedCategory_homepageId_fkey" FOREIGN KEY ("homepageId") REFERENCES "Homepage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageFeaturedCategory" ADD CONSTRAINT "HomepageFeaturedCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageSection" ADD CONSTRAINT "HomepageSection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
