-- AlterTable
ALTER TABLE "Homepage" ADD COLUMN     "aboutImageId" TEXT;

-- AddForeignKey
ALTER TABLE "Homepage" ADD CONSTRAINT "Homepage_aboutImageId_fkey" FOREIGN KEY ("aboutImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
