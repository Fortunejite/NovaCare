import PDFDocument from 'pdfkit';
import { Response } from 'express'
import { Prisma } from '@prisma/client';

type BillWithItems = Prisma.BillGetPayload<{
  include: {
    billItems: true;
  };
}>;

export const generateBillReceiptPdf = (bill: BillWithItems, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="bill_receipt_${bill.id}.pdf"`);

  doc.pipe(res);

  doc.fontSize(20).text('Bill Receipt', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Bill ID: ${bill.id}`);
  doc.text(`Patient ID: ${bill.patientId}`);
  doc.text(`Status: ${bill.status}`);
  doc.text(`Created At: ${bill.createdAt}`);
  doc.text(`Updated At: ${bill.updatedAt}`);
  doc.moveDown();

  doc.fontSize(16).text('Bill Items:', { underline: true });
  bill.billItems.forEach((item, index) => {
    doc.fontSize(12).text(`${index + 1}. ${item.description} - $${item.amount.toFixed(2)}`);
  });

  const totalAmount = bill.billItems.reduce((total, item) => total + item.amount, 0);
  doc.moveDown();
  doc.fontSize(14).text(`Total Amount: $${totalAmount.toFixed(2)}`, { align: 'right' });

  doc.end();
};
