import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import PatientController from './patient.controller';

const routes = Router();

routes.post('/', Authorize(['receptionist']), PatientController.createPatient);
routes.get('/', Authorize(['receptionist']), PatientController.getAllPatients);
routes.get('/:id', Authorize(['receptionist']), PatientController.getPatientById);
routes.put('/:id', Authorize(['receptionist']), PatientController.updatePatient);


export default routes;
