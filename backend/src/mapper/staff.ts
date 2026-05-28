import { StaffDto } from "@app/shared";
import { Prisma } from "@prisma/client";

type UserWithProfiles = Prisma.UserGetPayload<{
  include: {
    doctor: true;
  }
}>

const getProfile = (staff: UserWithProfiles) => {
  switch (staff.role) {
    case 'doctor':
      return staff.doctor;
    default:
      return null;
  }
}

export const staffMapper = (staff: UserWithProfiles): StaffDto => {
  const profile = getProfile(staff)
  return {
    id: staff.id,
    email: staff.email,
    role: staff.role,
    profileId: profile ? profile.id : null,
    firstName: profile ? profile.firstName : null,
    lastName: profile ? profile.lastName : null,
  };
};