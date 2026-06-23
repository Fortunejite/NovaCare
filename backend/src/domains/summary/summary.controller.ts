import { NextFunction, Request, Response } from "express";
import SummaryService from "./summary.service";

class SummaryController {
  static async getDoctorSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const summary = await SummaryService.getDoctorSummary(user.id);
      res.status(201).json(summary);
    } catch (error) {
      next(error);
    }
  }

  static async getPharmacistSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const summary = await SummaryService.getPharmacistSummary(user.id);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  static async getLabTechnicianSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const summary = await SummaryService.getLabTechnicianSummary(user.id);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }
}

export default SummaryController;
