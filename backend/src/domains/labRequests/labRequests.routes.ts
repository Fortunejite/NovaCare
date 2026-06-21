import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import LabRequestsController from './labRequests.controller';

const routes = Router();

routes.post('/', Authorize(['doctor']), LabRequestsController.createLabRequest);
routes.get('/', Authorize(['labTechnician', 'doctor']), LabRequestsController.getAllLabRequests);
routes.get('/:id', Authorize(['labTechnician', 'doctor']), LabRequestsController.getLabRequestById);
routes.post('/:id/result', Authorize(['labTechnician']), LabRequestsController.generateLabResult);

export default routes;
