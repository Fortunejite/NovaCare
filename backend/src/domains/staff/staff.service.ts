import { prisma } from '@/lib/prisma';
import { pageResponseMapper } from '@app/shared';
import { staffMapper } from './staff.mapper';

class StaffService {
  static async getAllStaff(page = 1, limit = 10) {
    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: { notIn: ['admin', 'patient'] } },
        include: { doctor: true, pharmacist: true, receptionist: true, labTechnician: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({
        where: { role: { notIn: ['admin', 'patient'] } },
      }),
    ]);

    return pageResponseMapper({
      data: staff.map(staffMapper),
      page,
      limit,
      total,
    });
  }

  static async getStaffSummary() {
    const [doctors, pharmacists, receptionists, labTechnicians] = await Promise.all([
      prisma.user.count({ where: { role: 'doctor' } }),
      prisma.user.count({ where: { role: 'pharmacist' } }),
      prisma.user.count({ where: { role: 'receptionist' } }),
      prisma.user.count({ where: { role: 'labTechnician' } }),
    ]);

    return {
      doctors,
      pharmacists,
      receptionists,
      labTechnicians,
    };
  }
}

export default StaffService;
