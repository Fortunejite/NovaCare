import { DoctorDto } from "@app/shared"
import { Prisma } from "@prisma/client"

type DoctorWithDetails = Prisma.DoctorGetPayload<{
  include: {
    user: true,
    department: true,
  }
}>

export const doctorMapper = (doctor: DoctorWithDetails): DoctorDto => ({
  id: doctor.id,
  firstName: doctor.firstName,
  lastName: doctor.lastName,
  departmentName: doctor.department.name,
  departmentDescription: doctor.department.description,
  departmentId: doctor.department.id,
  phoneNumber: doctor.phoneNumber,
  address: doctor.address,
  consultationFee: doctor.consultationFee,
  yearsOfExperience: doctor.yearsOfExperience,
  licenseNumber: doctor.licenseNumber,
  email: doctor.user.email,
  userId: doctor.user.id,
})