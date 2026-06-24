import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import DoctorController from './doctor.controller';

const routes = Router();

routes.post('/', Authorize(['admin']), DoctorController.createDoctor);
routes.get('/', Authorize(['admin', 'receptionist']), DoctorController.getAllDoctors);
routes.get('/me', Authorize(['doctor']), DoctorController.getMe);
routes.get('/:id', Authorize(['admin']), DoctorController.getDoctorById);
routes.put('/:id', Authorize(['admin']), DoctorController.updateDoctor);

export default routes;
