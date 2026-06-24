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
      const { page = 1, limit = 10, patientId, doctorId, date } = req.query;
      
      const appointments = await AppointmentService.fetchAppointments({
        page: Number(page),
        limit: Number(limit),
        patientId: patientId as string,
        doctorId: doctorId as string,
        date: date as string,
        role: req.user.role,
        userId: req.user.id,
      });
      res.status(200).json(appointments);
    } catch (error) {
      next(error);
    }
  }

  static async fetchTodayAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const appointments = await AppointmentService.fetchTodayDoctorAppointments(req.user.id);
      res.status(200).json(appointments);
    } catch (error) {
      next(error);
    }
  }

  static async fetchAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await AppointmentService.fetchAppointment({
        appointmentId: id as string,
        role: req.user.role,
        userId: req.user.id,
      });
      res.status(200).json(appointment);
    } catch (error) {
      next(error);
    }
  }

  static async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedAppointment = await AppointmentService.updateAppointment({
        appointmentId: id as string,
        payload: req.body,
        role: req.user.role,
        userId: req.user.id,
      });
      res.status(200).json(updatedAppointment);
    } catch (error) {
      next(error);
    }
  }
}

export default AppointmentController;
