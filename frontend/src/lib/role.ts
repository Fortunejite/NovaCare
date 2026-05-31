import { Role } from "@app/shared";

export const getUserDashboardPath = (role: Role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'doctor':
      return '/doctor';
    case 'receptionist':
      return '/receptionist';
    case 'pharmacist':
      return '/pharmacist';
    case 'labTechnician':
      return '/lab-technician';
    default:
      return '/';
  }
}