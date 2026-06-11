import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import StaffController from './staff.controller';

const routes = Router();

routes.get('/', Authorize(['admin']), StaffController.getAllStaff);
routes.get('/summary', Authorize(['admin']), StaffController.getStaffSummary);

export default routes;
