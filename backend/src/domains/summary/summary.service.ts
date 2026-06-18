import { prisma } from "@/lib/prisma";
import { DoctorSummaryDto } from "@app/shared";

class SummaryService {
  static async getDoctorSummary(doctorId: string): Promise<DoctorSummaryDto> {
    const now = new Date();
    const [todayScheduledAppointments, todayCompletedAppointments] = await Promise.all([
      prisma.appointment.count({
        where: {
          doctorId,
          datetime: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: "completed",
          datetime: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),
    ])

    return {
      todayCompletedAppointments,
      todayScheduledAppointments,
    }
  }
}

export default SummaryService;