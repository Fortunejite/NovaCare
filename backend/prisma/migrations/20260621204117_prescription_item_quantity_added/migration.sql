/*
  Warnings:

  - You are about to drop the `PrescribedItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrescribedItem" DROP CONSTRAINT "PrescribedItem_medicationId_fkey";

-- DropForeignKey
ALTER TABLE "PrescribedItem" DROP CONSTRAINT "PrescribedItem_prescriptionId_fkey";

-- DropTable
DROP TABLE "PrescribedItem";

-- CreateTable
CREATE TABLE "prescribed_items" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" INTEGER,
    "prescriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescribed_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prescribed_items" ADD CONSTRAINT "prescribed_items_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescribed_items" ADD CONSTRAINT "prescribed_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
