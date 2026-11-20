-- AlterTable
ALTER TABLE "user" ADD COLUMN     "resetOtpExpiry" TIMESTAMP(3),
ADD COLUMN     "resetOtpHash" TEXT;
