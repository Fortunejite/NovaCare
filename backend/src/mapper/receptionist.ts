import { ReceptionistDto } from "@app/shared"
import { Prisma } from "@prisma/client"

type ReceptionistWithDetails = Prisma.ReceptionistGetPayload<{
  include: {
    user: true,
  }
}>

export const receptionistMapper = (receptionist: ReceptionistWithDetails): ReceptionistDto => ({
  id: receptionist.id,
  firstName: receptionist.firstName,
  lastName: receptionist.lastName,
  email: receptionist.user.email,
  userId: receptionist.user.id,
  gender: receptionist.gender,
  phoneNumber: receptionist.phoneNumber,
  address: receptionist.address,
  dateOfBirth: receptionist.dateOfBirth,
  createdAt: receptionist.createdAt,
})