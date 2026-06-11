import { Request, Response, NextFunction } from 'express';
import LabTechnicianService from './labTechnician.service';

class LabTechnicianController {
  static async createLabTechnician(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const labTechnician = await LabTechnicianService.createLabTechnician(
        req.body,
      );
      res.status(201).json(labTechnician);
    } catch (error) {
      next(error);
    }
  }

  static async getAllLabTechnicians(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const labTechnicians = await LabTechnicianService.getAllLabTechnicians(
        page,
        limit,
      );
      res.status(200).json(labTechnicians);
    } catch (error) {
      next(error);
    }
  }

  static async getLabTechnicianById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const labTechnician = await LabTechnicianService.getLabTechnicianById(
        req.params.id as string,
      );
      res.status(200).json(labTechnician);
    } catch (error) {
      next(error);
    }
  }

  static async updateLabTechnician(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const labTechnician = await LabTechnicianService.updateLabTechnician(
        req.params.id as string,
        req.body,
      );
      res.status(200).json(labTechnician);
    } catch (error) {
      next(error);
    }
  }
}

export default LabTechnicianController;
