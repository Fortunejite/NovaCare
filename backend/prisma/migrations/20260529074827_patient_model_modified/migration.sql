/*
  Warnings:

  - You are about to drop the column `materialStatus` on the `patients` table. All the data in the column will be lost.
  - Added the required column `maritalStatus` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "materialStatus",
ADD COLUMN     "maritalStatus" TEXT NOT NULL,
ALTER COLUMN "allergies" DROP NOT NULL,
ALTER COLUMN "medicalHistory" DROP NOT NULL;
