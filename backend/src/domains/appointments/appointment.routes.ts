import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import AppointmentController from './appointment.controller';

const routes = Router();

routes.post('/', Authorize(['receptionist']), AppointmentController.createAppointment);
routes.get('/', Authorize(['receptionist', 'doctor']), AppointmentController.fetchAppointments);
routes.get('/today', Authorize(['doctor']), AppointmentController.fetchTodayAppointments);
routes.get('/:id', Authorize(['receptionist', 'doctor']), AppointmentController.fetchAppointment);
routes.put('/:id', Authorize(['receptionist', 'doctor']), AppointmentController.updateAppointment);

export default routes;
