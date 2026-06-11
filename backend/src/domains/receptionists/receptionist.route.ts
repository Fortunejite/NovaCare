import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import ReceptionistController from './receptionist.controller';

const routes = Router();

routes.post('/', Authorize(['admin']), ReceptionistController.createReceptionist);
routes.get('/', Authorize(['admin']), ReceptionistController.getAllReceptionists);
routes.get('/:id', Authorize(['admin']), ReceptionistController.getReceptionistById);
routes.put('/:id', Authorize(['admin']), ReceptionistController.updateReceptionist);

export default routes;
