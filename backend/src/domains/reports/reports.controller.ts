import { NextFunction, Request, Response } from 'express';
import ReportsService from './reports.service';
import { generateAdminOverviewReportPdf } from '@/services/report/adminOverviewReport';

class ReportsController {
  static async generateAdminOverview(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const report = await ReportsService.getAdminOverviewReport();
      generateAdminOverviewReportPdf(report, res);
    } catch (error) {
      next(error);
    }
  }
}

export default ReportsController;
