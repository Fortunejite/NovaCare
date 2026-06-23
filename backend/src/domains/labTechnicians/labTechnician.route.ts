import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import LabTechnicianController from './labTechnician.controller';

const routes = Router();

routes.post('/', Authorize(['admin']), LabTechnicianController.createLabTechnician);
routes.get('/', Authorize(['admin']), LabTechnicianController.getAllLabTechnicians);
routes.get('/me', Authorize(['labTechnician']), LabTechnicianController.getMe);
routes.get('/:id', Authorize(['admin']), LabTechnicianController.getLabTechnicianById);
routes.put('/:id', Authorize(['admin']), LabTechnicianController.updateLabTechnician);

export default routes;
