import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import PharmacistController from './pharmacist.controller';

const routes = Router();

routes.post('/', Authorize(['admin']), PharmacistController.createPharmacist);
routes.get('/', Authorize(['admin']), PharmacistController.getAllPharmacists);
routes.get('/:id', Authorize(['admin']), PharmacistController.getPharmacistById);
routes.put('/:id', Authorize(['admin']), PharmacistController.updatePharmacist);

export default routes;
