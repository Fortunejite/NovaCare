import { Request, Response, NextFunction } from "express";
import DoctorService from "./doctor.service";

class DoctorController {
  static async createDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.createDoctor(req.body);
      res.status(201).json(doctor);
    } catch (error) {
      next(error);
    }
  }

  static async getAllDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const doctors = await DoctorService.getAllDoctors(page, limit);
      res.status(200).json(doctors);
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorById(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.getDoctorById(req.params.id as string);
      res.status(200).json(doctor);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.getDoctorByUserId(req.user.id);
      res.status(200).json(doctor);
    } catch (error) {
      next(error);
    }
  }

  static async updateDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.updateDoctor(req.params.id as string, req.body);
      res.status(200).json(doctor);
    } catch (error) {
      next(error);
    }
  }
}

export default DoctorController;
