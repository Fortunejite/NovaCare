import { prisma } from '@/lib/prisma';
import {
  AdminOverviewReportData,
  formatCurrency,
} from '@/services/report/adminOverviewReport';
import { Role } from '@prisma/client';

const countRows = <T extends string>(
  rows: Array<Record<T, string> & { _count: number }>,
  key: T,
) =>
  rows.map((row) => ({
    label: row[key],
    value: row._count,
  }));

class ReportsService {
  static async getAdminOverviewReport(): Promise<AdminOverviewReportData> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const [
      totalUsers,
      activeUsers,
      totalPatients,
      totalAppointments,
      todayAppointments,
      totalConsultations,
      totalLabRequests,
      totalPrescriptions,
      totalMedications,
      lowStockMedications,
      staffByRole,
      patientsByStatus,
      appointmentsByStatus,
      appointmentsByType,
      labRequestsByStatus,
      labRequestsByType,
      prescriptionsByStatus,
      billStatusGroups,
      billItemsTotal,
      paymentTotal,
      topDepartments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: { datetime: { gte: startOfDay, lt: endOfDay } },
      }),
      prisma.consultation.count(),
      prisma.labRequest.count(),
      prisma.prescription.count(),
      prisma.medication.count({ where: { deletedAt: null } }),
      prisma.medication.count({
        where: { deletedAt: null, stockQuantity: { lte: 10 } },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
        where: { role: { not: Role.patient } },
      }),
      prisma.patient.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.appointment.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.appointment.groupBy({ by: ['type'], _count: { _all: true } }),
      prisma.labRequest.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.labRequest.groupBy({ by: ['testType'], _count: { _all: true } }),
      prisma.prescription.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.bill.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.billItem.aggregate({ _sum: { amount: true } }),
      prisma.paymentRecord.aggregate({ _sum: { amount: true } }),
      prisma.department.findMany({
        include: { _count: { select: { doctors: true } } },
        orderBy: { doctors: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    const billedAmount = billItemsTotal._sum.amount ?? 0;
    const paidAmount = paymentTotal._sum.amount ?? 0;

    return {
      generatedAt: new Date(),
      totals: [
        { label: 'Users', value: totalUsers },
        { label: 'Active Users', value: activeUsers },
        { label: 'Patients', value: totalPatients },
        { label: 'Appointments', value: totalAppointments },
        { label: 'Appointments Today', value: todayAppointments },
        { label: 'Consultations', value: totalConsultations },
        { label: 'Lab Requests', value: totalLabRequests },
        { label: 'Prescriptions', value: totalPrescriptions },
      ],
      staffByRole: staffByRole.map((row) => ({
        label: row.role,
        value: row._count._all,
      })),
      patientsByStatus: patientsByStatus.map((row) => ({
        label: row.status,
        value: row._count._all,
      })),
      appointmentsByStatus: appointmentsByStatus.map((row) => ({
        label: row.status,
        value: row._count._all,
      })),
      appointmentsByType: appointmentsByType.map((row) => ({
        label: row.type,
        value: row._count._all,
      })),
      labRequestsByStatus: labRequestsByStatus.map((row) => ({
        label: row.status,
        value: row._count._all,
      })),
      labRequestsByType: labRequestsByType.map((row) => ({
        label: row.testType,
        value: row._count._all,
      })),
      prescriptionsByStatus: prescriptionsByStatus.map((row) => ({
        label: row.status,
        value: row._count._all,
      })),
      billing: [
        ...billStatusGroups.map((row) => ({
          label: `${row.status} Bills`,
          value: row._count._all,
        })),
        { label: 'Total Billed', value: formatCurrency(billedAmount) },
        { label: 'Total Paid', value: formatCurrency(paidAmount) },
        {
          label: 'Outstanding Balance',
          value: formatCurrency(Math.max(billedAmount - paidAmount, 0)),
        },
      ],
      inventory: [
        { label: 'Active Medications', value: totalMedications },
        { label: 'Low Stock Medications', value: lowStockMedications },
      ],
      topDepartments: topDepartments.map((department) => ({
        label: department.name,
        value: `${department._count.doctors} doctors`,
      })),
    };
  }
}

export default ReportsService;
