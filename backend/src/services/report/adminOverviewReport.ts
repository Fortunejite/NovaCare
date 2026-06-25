import PDFDocument from 'pdfkit';
import { Response } from 'express';

export interface LabelValue {
  label: string;
  value: string | number;
}

export interface AdminOverviewReportData {
  generatedAt: Date;
  totals: LabelValue[];
  staffByRole: LabelValue[];
  patientsByStatus: LabelValue[];
  appointmentsByStatus: LabelValue[];
  appointmentsByType: LabelValue[];
  labRequestsByStatus: LabelValue[];
  labRequestsByType: LabelValue[];
  prescriptionsByStatus: LabelValue[];
  billing: LabelValue[];
  inventory: LabelValue[];
  topDepartments: LabelValue[];
}

const titleCase = (value: string) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const drawSection = (
  doc: PDFKit.PDFDocument,
  title: string,
  rows: LabelValue[],
) => {
  doc.moveDown(0.8);
  doc.fontSize(14).fillColor('#0f766e').text(title, { underline: true });
  doc.moveDown(0.3);

  if (rows.length === 0) {
    doc.fontSize(10).fillColor('#64748b').text('No data available');
    return;
  }

  rows.forEach((row) => {
    doc
      .fontSize(10)
      .fillColor('#0f172a')
      .text(`${titleCase(row.label)}: `, { continued: true })
      .fillColor('#334155')
      .text(String(row.value));
  });
};

export const formatCurrency = currency;

export const generateAdminOverviewReportPdf = (
  data: AdminOverviewReportData,
  res: Response,
) => {
  const doc = new PDFDocument({ margin: 50 });
  const fileDate = data.generatedAt.toISOString().slice(0, 10);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="novacare_admin_report_${fileDate}.pdf"`,
  );

  doc.pipe(res);

  doc.fillColor('#0f172a').fontSize(22).text('NovaCare Admin Overview Report', {
    align: 'center',
  });
  doc.moveDown(0.4);
  doc
    .fontSize(10)
    .fillColor('#64748b')
    .text(`Generated: ${data.generatedAt.toLocaleString()}`, {
      align: 'center',
    });

  drawSection(doc, 'Executive Totals', data.totals);
  drawSection(doc, 'Staff By Role', data.staffByRole);
  drawSection(doc, 'Patients By Status', data.patientsByStatus);
  drawSection(doc, 'Appointments By Status', data.appointmentsByStatus);
  drawSection(doc, 'Appointments By Type', data.appointmentsByType);
  drawSection(doc, 'Lab Requests By Status', data.labRequestsByStatus);
  drawSection(doc, 'Lab Requests By Type', data.labRequestsByType);
  drawSection(doc, 'Prescriptions By Status', data.prescriptionsByStatus);
  drawSection(doc, 'Billing', data.billing);
  drawSection(doc, 'Medication Inventory', data.inventory);
  drawSection(doc, 'Top Departments', data.topDepartments);

  doc.end();
};
