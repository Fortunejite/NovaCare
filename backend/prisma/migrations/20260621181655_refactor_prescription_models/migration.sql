/*
  Warnings:

  - You are about to drop the column `doctorId` on the `lab_requests` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `lab_requests` table. All the data in the column will be lost.
  - You are about to drop the column `dosage` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `medicationId` on the `prescriptions` table. All the data in the column will be lost.
  - Added the required column `consultationId` to the `lab_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `labTechnicianId` to the `lab_requests` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `testType` on the `lab_requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LabTestType" AS ENUM ('blood_test', 'urine_test', 'x_ray', 'mri', 'ct_scan', 'ecg', 'ultrasound', 'biopsy', 'genetic_test', 'allergy_test', 'pathology_test');

-- DropForeignKey
ALTER TABLE "lab_requests" DROP CONSTRAINT "lab_requests_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "lab_requests" DROP CONSTRAINT "lab_requests_patientId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_medicationId_fkey";

-- AlterTable
ALTER TABLE "lab_requests" DROP COLUMN "doctorId",
DROP COLUMN "patientId",
ADD COLUMN     "consultationId" TEXT NOT NULL,
ADD COLUMN     "labTechnicianId" TEXT NOT NULL,
DROP COLUMN "testType",
ADD COLUMN     "testType" "LabTestType" NOT NULL;

-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "dosage",
DROP COLUMN "duration",
DROP COLUMN "frequency",
DROP COLUMN "medicationId";

-- CreateTable
CREATE TABLE "PrescribedItem" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescribedItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PrescribedItem" ADD CONSTRAINT "PrescribedItem_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescribedItem" ADD CONSTRAINT "PrescribedItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_requests" ADD CONSTRAINT "lab_requests_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_requests" ADD CONSTRAINT "lab_requests_labTechnicianId_fkey" FOREIGN KEY ("labTechnicianId") REFERENCES "lab_technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
