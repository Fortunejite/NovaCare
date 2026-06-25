import { Request, Response, NextFunction } from 'express';
import PrescriptionsService from './prescriptions.service';

class PrescriptionsController {
  static async createPrescription(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const prescription = await PrescriptionsService.createPrescription(
        req.body,
        req.user.id,
      );
      res.status(201).json(prescription);
    } catch (error) {
      next(error);
    }
  }

  static async getPrescriptionById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const prescription = await PrescriptionsService.getPrescriptionById(
        id as string,
      );
      res.json(prescription);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPrescriptions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const userId = req.user.id;
      const prescriptions = await PrescriptionsService.getAllPrescriptions({
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        userId,
      });
      res.json(prescriptions);
    } catch (error) {
      next(error);
    }
  }

  static async addPrescriptionItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const payload = req.body;
      const prescription = await PrescriptionsService.addPrescriptionItem(
        id as string,
        payload,
      );
      res.json(prescription);
    } catch (error) {
      next(error);
    }
  }

  static async updatePrescriptionItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id, itemId } = req.params;
      const payload = req.body;
      const prescription = await PrescriptionsService.updatePrescriptionItem(
        id as string,
        itemId as string,
        payload,
      );
      res.json(prescription);
    } catch (error) {
      next(error);
    }
  }
  static async deletePrescriptionItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id, itemId } = req.params;
      await PrescriptionsService.deletePrescriptionItem(
        id as string,
        itemId as string,
      );
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  static async dispensePrescription(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await PrescriptionsService.dispensePrescription(req.body, id as string, userId);
      res.status(200).json({ message: 'Prescription marked as dispensed' });
    } catch (error) {
      next(error);
    }
  }

  static async cancelPrescription(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
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
