import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import AdminController from './admin.controller';

const routes = Router();
routes.use(Authorize(['admin']));

routes.post('/departments', AdminController.createDepartment);
routes.get('/departments', AdminController.getAllDepartments);
routes.get('/departments/:id', AdminController.getDepartmentById);
routes.put('/departments/:id', AdminController.updateDepartment);
routes.delete('/departments/:id', AdminController.deleteDepartment);

routes.post('/users/disable', AdminController.disableUser);

routes.post('/doctors', AdminController.createDoctor);
routes.get('/doctors', AdminController.getAllDoctors);
routes.get('/doctors/:id', AdminController.getDoctorById);
routes.put('/doctors/:id', AdminController.updateDoctor);

routes.get('/staff', AdminController.getAllStaff);

export default routes;
