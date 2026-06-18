import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import MedicineController from './medicine.controller';

const routes = Router();

routes.post('/', Authorize(['pharmacist']), MedicineController.createMedicine);
routes.get('/', Authorize(['pharmacist', 'doctor']), MedicineController.getMedicines);
routes.get('/:id', Authorize(['pharmacist', 'doctor']), MedicineController.getMedicineById);
routes.put('/:id', Authorize(['pharmacist']), MedicineController.updateMedicine);
routes.delete('/:id', Authorize(['pharmacist']), MedicineController.deleteMedicine);

export default routes;