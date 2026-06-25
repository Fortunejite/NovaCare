import { BadRequestError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { labTypeCosts } from '../labRequests';
import { BillItem, Prisma, Services } from '@prisma/client';

class BillService {
  static async generatePrescriptionBill(prescriptionId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        prescribedItems: { include: { medication: true } },
      },
    });

    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    if (prescription.status !== 'dispensed') {
      throw new BadRequestError('Prescription is not dispensed');
    }

    const totalAmount = prescription.prescribedItems.reduce((total, item) => {
      return total + item.medication.price * item.quantity;
    }, 0);

    return {
      amount: totalAmount,
      description: 'Prescription Dispensing',
    };
  }

  static async generateLabTestBill(labRequestId: string) {
    const labRequest = await prisma.labRequest.findUnique({
      where: { id: labRequestId },
    });

    if (!labRequest) {
      throw new NotFoundError('Lab request not found');
    }

    if (labRequest.status !== 'completed') {
      throw new BadRequestError('Lab request is not completed');
    }

    return {
      amount: labTypeCosts[labRequest.testType],
      description: `Lab Test: ${labRequest.testType}`,
    };
  }

  static async generateConsultationBill(consultationId: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { appointment: { include: { doctor: true } } },
    });

    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    if (
      consultation.appointment.status !== 'completed' &&
      consultation.appointment.status !== 'progress'
    ) {
      throw new BadRequestError('Appointment must be in progress or completed');
    }

    return {
      amount: consultation.appointment.doctor.consultationFee,
      description: 'Consultation Fee',
    };
  }

  static async addBillItem(payload: {
    billId: string;
    service: Services;
    serviceId: string;
    tx: Prisma.TransactionClient;
  }) {
    const { billId, service, serviceId, tx } = payload;
    const bill = await tx.bill.findUnique({
      where: { id: billId },
    });

    if (!bill) {
      throw new NotFoundError('Bill not found');
    }

    if (bill.status === 'paid') {
      throw new BadRequestError('Cannot add items to a paid bill');
    }

    switch (service) {
      case 'consultation':
        const consultationBill = await this.generateConsultationBill(serviceId);
        return tx.billItem.create({
          data: {
            billId,
            service,
            serviceId,
            description: consultationBill.description,
            amount: consultationBill.amount,
          },
        });

      case 'lab_test':
        const labBill = await this.generateLabTestBill(serviceId);
        return tx.billItem.create({
          data: {
            billId,
            service,
            serviceId,
            description: labBill.description,
            amount: labBill.amount,
          },
        });

      case 'prescription':
        const prescriptionBill = await this.generatePrescriptionBill(serviceId);
        return tx.billItem.create({
          data: {
            billId,
            service,
            serviceId,
            description: prescriptionBill.description,
            amount: prescriptionBill.amount,
          },
        });

      default:
        throw new BadRequestError('Invalid service type');
    }
  }

  static async syncBill(payload: {
    billId: string;
    billItems: BillItem[];
    services: {
      service: Services;
      serviceId: string;
    }[];
  }) {
    const { billItems, billId, services } = payload;
    const billedServiceIds = billItems.map((item) => item.serviceId);

    const pendingServicesToAdd = services.filter(
      (service) => !billedServiceIds.includes(service.serviceId),
    );
    const servicesPromise = pendingServicesToAdd.map((service) =>
      this.addBillItem({
        billId: billId,
        service: service.service,
        serviceId: service.serviceId,
        tx: prisma,
      }),
    );
    await Promise.all(servicesPromise);
  }

  static async generateBillReceipt(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        consultation: {
          include: {
            prescriptions: { include: { prescribedItems: true } },
            labRequests: true,
          },
        },
        bill: { include: { billItems: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (appointment.status !== 'completed' && appointment.status !== 'progress') {
      throw new BadRequestError('Appointment must be in progress or completed');
    }

    const { bill, consultation } = appointment;

    if (!consultation) {
      throw new NotFoundError(
        'Doctor consultation not found for this appointment. Contact the doctor to create a consultation for this appointment',
      );
    }

    if (!bill) {
      throw new NotFoundError('Bill not found');
    }

    const { prescriptions, labRequests } = consultation;
    const services = [
      ...prescriptions.map((prescription) => ({
        service: 'prescription' as Services,
        serviceId: prescription.id,
        isCompleted: prescription.status === 'dispensed',
      })),
      ...labRequests.map((labRequest) => ({
        service: 'lab_test' as Services,
        serviceId: labRequest.id,
        isCompleted: labRequest.status === 'completed',
      })),
      {
        service: 'consultation' as Services,
        serviceId: consultation.id,
        isCompleted: appointment.status === 'completed' || appointment.status === 'progress',
      },
    ].filter((service) => service.isCompleted);

    await this.syncBill({
      billId: bill.id,
      billItems: bill.billItems,
      services,
    });
    
    return prisma.bill.findUnique({
      where: { id: bill.id },
      include: { billItems: true },
    });
  }
}

export default BillService;
