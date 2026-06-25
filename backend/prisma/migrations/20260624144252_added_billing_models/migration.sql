/*
  Warnings:

  - You are about to drop the column `amount` on the `bills` table. All the data in the column will be lost.
  - The `status` column on the `bills` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[appointmentId]` on the table `bills` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointmentId` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Made the column `quantity` on table `prescribed_items` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Services" AS ENUM ('consultation', 'lab_test', 'prescription');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('unpaid', 'paid', 'partially_paid');

-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'progress';

-- AlterTable
ALTER TABLE "bills" DROP COLUMN "amount",
ADD COLUMN     "appointmentId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BillStatus" NOT NULL DEFAULT 'unpaid';

-- AlterTable
ALTER TABLE "prescribed_items" ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "bill_items" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "service" "Services" NOT NULL,
    "serviceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bill_items_serviceId_key" ON "bill_items"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "bills_appointmentId_key" ON "bills"("appointmentId");

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
