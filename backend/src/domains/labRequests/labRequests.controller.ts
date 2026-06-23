import { Request, Response, NextFunction } from 'express';
import LabRequestsService from './labRequests.service';

class LabRequestsController {
  static async createLabRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const labRequest = await LabRequestsService.createlabRequest(payload);
      res.status(201).json(labRequest);
    } catch (error) {
      next(error);
    }
  }

  static async getAllLabRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);
      const status = req.query.status as string | undefined;
      const userId = req.user.id;
      const response = await LabRequestsService.getAllLabRequests({ page, limit, status, userId });
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getLabRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const labRequest = await LabRequestsService.getLabRequestById(id as string);
      res.json(labRequest);
    } catch (error) {
      next(error);
    }
  }

  static async generateLabResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { result } = req.body;
      const userId = req.user.id;
      // optionally check user role/permission in middleware; here we just call service
      const updated = await LabRequestsService.generateLabResult(id as string, result as string, userId);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
}

export default LabRequestsController;