import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import AppointmentController from './appointment.controller';

const routes = Router();

routes.post('/', Authorize(['receptionist']), AppointmentController.createAppointment);
routes.get('/', Authorize(['receptionist']), AppointmentController.fetchAppointments);

export default routes;
