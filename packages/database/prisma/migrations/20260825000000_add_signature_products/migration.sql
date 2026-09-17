-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isSignature" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN     "signatureOrder" INTEGER;
