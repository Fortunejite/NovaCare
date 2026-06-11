import { Request, Response, NextFunction } from "express";
import StaffService from "./staff.service";

class StaffController {
  static async getAllStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const staffs = await StaffService.getAllStaff(page, limit);
      res.status(200).json(staffs);
    } catch (error) {
      next(error);
    }
  }

  static async getStaffSummary(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const summary = await StaffService.getStaffSummary();
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }
}

export default StaffController;
