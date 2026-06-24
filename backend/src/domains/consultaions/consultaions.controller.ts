import { NextFunction, Request, Response } from "express";
import ConsultaionService from "./consultations.service";

class ConsultaionsController {
  static async getConsultaions(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const consultations = await ConsultaionService.getConsultations({
        userId: req.user.id,
        page: Number(page),
        limit: Number(limit),
      });
      res.status(200).json(consultations);
    } catch (error) {
      next(error);
    }
  }

  static async getConsultaionById(req: Request, res: Response, next: NextFunction) {
    try {
      const consultation = await ConsultaionService.getConsultationById(
        req.user.id,
        req.params.id as string,
      );
      res.status(200).json(consultation);
    } catch (error) {
      next(error);
    }
  }

  static async createConsultaion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const consultation = await ConsultaionService.createConsultaion(user.id, req.body);
      res.status(201).json(consultation);
    } catch (error) {
      next(error);
    }
  }
}

export default ConsultaionsController;
