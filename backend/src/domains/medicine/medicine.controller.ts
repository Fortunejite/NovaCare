import { NextFunction, Request, Response } from 'express';
import MedicineService from './medicine.service';

class MedicineController {
  static async createMedicine(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;

      const medicine = await MedicineService.createMedicine(payload);
      res.status(201).json(medicine);
    } catch (error) {
      next(error);
    }
  }

  static async getMedicines(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, name } = req.query;
      const medicines = await MedicineService.getMedicines({
        page: Number(page),
        limit: Number(limit),
        name: name as string,
      });
      res.status(200).json(medicines);
    } catch (error) {
      next(error);
    }
  }

  static async getMedicineById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const medicine = await MedicineService.getMedicineById(id as string);
      res.status(200).json(medicine);
    } catch (error) {
      next(error);
    }
  }

  static async updateMedicine(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payload = req.body;

      const updatedMedicine = await MedicineService.updateMedicine(
        id as string,
        payload,
      );
      res.status(200).json(updatedMedicine);
    } catch (error) {
      next(error);
    }
  }

  static async deleteMedicine(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await MedicineService.deleteMedicine(id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default MedicineController;
