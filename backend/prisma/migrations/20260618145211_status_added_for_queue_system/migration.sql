/*
  Warnings:

  - The `status` column on the `lab_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LabRequestStatus" AS ENUM ('pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('pending', 'dispensed', 'cancelled');

-- AlterTable
ALTER TABLE "lab_requests" DROP COLUMN "status",
ADD COLUMN     "status" "LabRequestStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN     "pharmacistId" TEXT,
ADD COLUMN     "status" "PrescriptionStatus" NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "pharmacists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
