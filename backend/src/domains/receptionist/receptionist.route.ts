import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import ReceptionistController from './receptionist.controller';

const routes = Router();
routes.use(Authorize(['receptionist']));

routes.post('/patients', ReceptionistController.createPatient);
routes.get('/patients', ReceptionistController.getAllPatients);
routes.get('/patients/:id', ReceptionistController.getPatientById);
routes.put('/patients/:id', ReceptionistController.updatePatient);


export default routes;
