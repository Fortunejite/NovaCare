import { Request, Response, NextFunction } from "express";
import ReceptionistService from "./receptionist.service";

class ReceptionistController {
  static async createReceptionist(req: Request, res: Response, next: NextFunction) {
    try {
      const receptionist = await ReceptionistService.createReceptionist(req.body);
      res.status(201).json(receptionist);
    } catch (error) {
      next(error);
    }
  }

  static async getAllReceptionists(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const receptionists = await ReceptionistService.getAllReceptionists(page, limit);
      res.status(200).json(receptionists);
    } catch (error) {
      next(error);
    }
  }

  static async getReceptionistById(req: Request, res: Response, next: NextFunction) {
    try {
      const receptionist = await ReceptionistService.getReceptionistById(req.params.id as string);
      res.status(200).json(receptionist);
    } catch (error) {
      next(error);
    }
  }

  static async updateReceptionist(req: Request, res: Response, next: NextFunction) {
    try {
      const receptionist = await ReceptionistService.updateReceptionist(req.params.id as string, req.body);
      res.status(200).json(receptionist);
    } catch (error) {
      next(error);
    }
  }
}

export default ReceptionistController;