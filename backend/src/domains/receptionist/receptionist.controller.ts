import { NextFunction, Request, Response } from 'express';
import PatientController from "./patient.controller";

class ReceptionistController {
  static async createPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientController.createPatient(req.body);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const search = typeof query.search === 'string' ? query.search : undefined;

      const patients = await PatientController.getAllPatients(page, limit, search);
      res.status(200).json(patients);
    } catch (error) {
      next(error);
    }
  }

  static async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientController.getPatientById(req.params.id as string);
      res.status(200).json(patient);
    } catch (error) {
      next(error);
    }
  }

  static async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientController.updatePatient(req.params.id as string, req.body);
      res.status(200).json(patient);
    } catch (error) {
      next(error);
    }
  }
}

export default ReceptionistController;