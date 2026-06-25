import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import ReportsController from './reports.controller';

const routes = Router();

routes.get('/overview', Authorize(['admin']), ReportsController.generateAdminOverview);

export default routes;
