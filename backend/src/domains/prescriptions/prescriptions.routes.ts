import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import PrescriptionsController from './prescriptions.controller';

const routes = Router();

routes.get('/', Authorize(['pharmacist']), PrescriptionsController.getAllPrescriptions);
routes.get('/:id', Authorize(['doctor', 'pharmacist']), PrescriptionsController.getPrescriptionById);
routes.post('/:id/items', Authorize(['doctor']), PrescriptionsController.addPrescriptionItem);
routes.put('/:id/items/:itemId', Authorize(['doctor']), PrescriptionsController.updatePrescriptionItem);
routes.delete('/:id/items/:itemId', Authorize(['doctor']), PrescriptionsController.deletePrescriptionItem);
routes.post('/:id/dispense', Authorize(['pharmacist']), PrescriptionsController.dispensePrescription);
routes.post('/:id/cancel', Authorize(['doctor']), PrescriptionsController.cancelPrescription);

export default routes;
