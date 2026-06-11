import { PharmacistDto } from "@app/shared"
import { Prisma } from "@prisma/client"

type PharmacistWithDetails = Prisma.PharmacistGetPayload<{
  include: {
    user: true,
  }
}>

export const pharmacistMapper = (pharmacist: PharmacistWithDetails): PharmacistDto => ({
  id: pharmacist.id,
  firstName: pharmacist.firstName,
  lastName: pharmacist.lastName,
  email: pharmacist.user.email,
  userId: pharmacist.user.id,
  gender: pharmacist.gender,
  phoneNumber: pharmacist.phoneNumber,
  address: pharmacist.address,
  qualification: pharmacist.qualification,
  licenseNumber: pharmacist.licenseNumber,
  createdAt: pharmacist.createdAt,
})