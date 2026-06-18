import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import ConsultaionsController from './consultaions.controller';

const routes = Router();

routes.post('/', Authorize(['doctor']), ConsultaionsController.createConsultaion);

export default routes;
