import { prisma } from '@/lib/prisma';
import { pageResponseMapper } from '@/mapper/pagedResponse';
import { staffMapper } from '@/mapper/staff';

class StaffController {
  static async getAllStaff(page = 1, limit = 10) {
    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: { notIn: ['admin', 'patient'] } },
        include: { doctor: true },
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
}

export default StaffController;
