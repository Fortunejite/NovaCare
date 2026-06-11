import { LabTechnicianDto } from "@app/shared"
import { Prisma } from "@prisma/client"

type LabTechnicianWithDetails = Prisma.LabTechnicianGetPayload<{
  include: {
    user: true,
  }
}>

export const labTechnicianMapper = (labTechnician: LabTechnicianWithDetails): LabTechnicianDto => ({
  id: labTechnician.id,
  firstName: labTechnician.firstName,
  lastName: labTechnician.lastName,
  email: labTechnician.user.email,
  userId: labTechnician.user.id,
  gender: labTechnician.gender,
  phoneNumber: labTechnician.phoneNumber,
  address: labTechnician.address,
  qualification: labTechnician.qualification,
  createdAt: labTechnician.createdAt,
})