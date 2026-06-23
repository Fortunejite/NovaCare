import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import SummaryController from './summary.controller';

const routes = Router();

routes.get('/doctor', Authorize(['doctor']), SummaryController.getDoctorSummary);
routes.get('/pharmacist', Authorize(['pharmacist']), SummaryController.getPharmacistSummary);
routes.get('/lab-technician', Authorize(['labTechnician']), SummaryController.getLabTechnicianSummary);

export default routes;
