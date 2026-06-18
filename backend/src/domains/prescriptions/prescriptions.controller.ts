import { Request, Response, NextFunction } from 'express';
import PrescriptionsService from './prescriptions.service';

class PrescriptionsController {
  static async getPrescriptionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const prescription = await PrescriptionsService.getPrescriptionById(id as string);
      res.json(prescription);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.id;
      const prescriptions = await PrescriptionsService.getAllPrescriptions(userId, Number(page), Number(limit));
      res.json(prescriptions);
    } catch (error) {
      next(error);
    }
  }

  static async updatePrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payload = req.body;
      const prescription = await PrescriptionsService.updatePrescription(id as string, payload);
      res.json(prescription);
    } catch (error) {
      next(error);
    }
  }

  static async dispensePrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await PrescriptionsService.dispensePrescription(id as string, userId);
      res.status(200).json({ message: 'Prescription marked as dispensed' });
    } catch (error) {
      next(error);
    }
  }

  static async cancelPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await PrescriptionsService.cancelPrescription(id as string);
      res.status(200).json({ message: 'Prescription cancelled' });
    } catch (error) {
      next(error);
    }
  }
}

export default PrescriptionsController;