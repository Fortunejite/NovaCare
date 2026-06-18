import { NextFunction, Request, Response } from "express";
import ConsultaionService from "./consultations.service";

class ConsultaionsController {
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
