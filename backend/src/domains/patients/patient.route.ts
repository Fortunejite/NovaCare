import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import PatientController from './patient.controller';

const routes = Router();

routes.post('/patients', Authorize(['receptionist']), PatientController.createPatient);
routes.get('/patients', Authorize(['receptionist']), PatientController.getAllPatients);
routes.get('/patients/:id', Authorize(['receptionist']), PatientController.getPatientById);
routes.put('/patients/:id', Authorize(['receptionist']), PatientController.updatePatient);


export default routes;
