import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import ConsultaionsController from './consultaions.controller';

const routes = Router();

routes.get('/', Authorize(['doctor']), ConsultaionsController.getConsultaions);
routes.post('/', Authorize(['doctor']), ConsultaionsController.createConsultaion);
routes.get('/:id', Authorize(['doctor']), ConsultaionsController.getConsultaionById);
routes.patch('/:id', Authorize(['doctor']), ConsultaionsController.updateConsultaion);
routes.patch('/:id/status', Authorize(['doctor']), ConsultaionsController.markConsultationAsCompleted);

export default routes;
