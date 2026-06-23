-- DropForeignKey
ALTER TABLE "lab_requests" DROP CONSTRAINT "lab_requests_labTechnicianId_fkey";

-- AlterTable
ALTER TABLE "lab_requests" ALTER COLUMN "labTechnicianId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "lab_requests" ADD CONSTRAINT "lab_requests_labTechnicianId_fkey" FOREIGN KEY ("labTechnicianId") REFERENCES "lab_technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
