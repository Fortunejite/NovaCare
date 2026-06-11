import { NextFunction, Request, Response } from "express";
import AppointmentService from "./appointment.service";

class AppointmentController {
  static async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await AppointmentService.createAppointment(req.body, req.user.id);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  }

  static async fetchAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, patientId } = req.query;
      const appointments = await AppointmentService.fetchAppointments({
        page: Number(page),
        limit: Number(limit),
        patientId: patientId as string,
        role: req.user.role,
      });
      res.status(200).json(appointments);
    } catch (error) {
      next(error);
    }
  }
}

export default AppointmentController;