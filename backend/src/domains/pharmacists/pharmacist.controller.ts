import { Request, Response, NextFunction } from 'express';
import PharmacistService from './pharmacist.service';

class PharmacistController {
  static async createPharmacist(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const pharmacist = await PharmacistService.createPharmacist(req.body);
      res.status(201).json(pharmacist);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPharmacists(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const pharmacists = await PharmacistService.getAllPharmacists(
        page,
        limit,
      );
      res.status(200).json(pharmacists);
    } catch (error) {
      next(error);
    }
  }

  static async getPharmacistById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const pharmacist = await PharmacistService.getPharmacistById(
        req.params.id as string,
      );
      res.status(200).json(pharmacist);
    } catch (error) {
      next(error);
    }
  }

  static async updatePharmacist(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const pharmacist = await PharmacistService.updatePharmacist(
        req.params.id as string,
        req.body,
      );
      res.status(200).json(pharmacist);
    } catch (error) {
      next(error);
    }
  }
}

export default PharmacistController;
