import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import SummaryController from './summary.controller';

const routes = Router();

routes.get('/doctor', Authorize(['doctor']), SummaryController.getDoctorSummary);

export default routes;
