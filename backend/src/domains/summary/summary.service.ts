import { prisma } from "@/lib/prisma";
import { DoctorSummaryDto, PharmacistSummaryDto } from "@app/shared";
import { NotFoundError } from "@/lib/errors";

class SummaryService {
  static async getDoctorSummary(doctorId: string): Promise<DoctorSummaryDto> {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: doctorId },
      select: { id: true },
    });

    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [
      todayScheduledAppointments,
      todayCompletedAppointments,
      todayPendingAppointments,
      totalConsultations,
      pendingLabRequests,
      pendingPrescriptions,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          datetime: { gte: todayStart, lt: todayEnd },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          status: "completed",
          datetime: { gte: todayStart, lt: todayEnd },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          status: "scheduled",
          datetime: { gte: todayStart, lt: todayEnd },
        },
      }),
      prisma.consultation.count({
        where: { appointment: { doctorId: doctor.id } },
      }),
      prisma.labRequest.count({
        where: {
          status: "pending",
          consultation: { appointment: { doctorId: doctor.id } },
        },
      }),
      prisma.prescription.count({
        where: {
          status: "pending",
          consultation: { appointment: { doctorId: doctor.id } },
        },
      }),
    ])

    return {
      todayCompletedAppointments,
      todayScheduledAppointments,
      todayPendingAppointments,
      totalConsultations,
      pendingLabRequests,
      pendingPrescriptions,
    }
  }

  static async getPharmacistSummary(userId: string): Promise<PharmacistSummaryDto> {
    const pharmacist = await prisma.pharmacist.findUnique({
      where: { userId },
    });

    if (!pharmacist) {
      throw new NotFoundError("Pharmacist not found");
    }

    const [totalDispensedByMe, totalPendingPrescriptions, totalMedications, outOfStockMedications] = await Promise.all([
      prisma.prescription.count({
        where: {
          pharmacistId: pharmacist.id,
          status: "dispensed",
        },
      }),
      prisma.prescription.count({
        where: {
          status: "pending",
        },
      }),
      prisma.medication.count({
        where: { deletedAt: null },
      }),
      prisma.medication.count({
        where: {
          stockQuantity: { lte: 0 },
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalDispensedByMe,
      totalPendingPrescriptions,
      totalMedications,
      outOfStockMedications,
    };
  }

  static async getLabTechnicianSummary(userId: string): Promise<any> {
    const labTechnician = await prisma.labTechnician.findUnique({ where: { userId } });

    if (!labTechnician) {
      throw new NotFoundError('Lab technician not found');
    }

    const [totalCompletedByMe, totalPendingAssignedToMe, totalPendingUnassigned, totalLabRequests] = await Promise.all([
      prisma.labRequest.count({ where: { labTechnicianId: labTechnician.id, status: 'completed' } }),
      prisma.labRequest.count({ where: { labTechnicianId: labTechnician.id, status: 'pending' } }),
      prisma.labRequest.count({ where: { labTechnicianId: null, status: 'pending' } }),
      prisma.labRequest.count({}),
    ]);

    return {
      totalCompletedByMe,
      totalPendingAssignedToMe,
      totalPendingUnassigned,
      totalLabRequests,
    };
  }
}

export default SummaryService;
