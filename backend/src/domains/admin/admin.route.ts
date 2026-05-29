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

routes.post('/receptionists', AdminController.createReceptionist);
routes.get('/receptionists', AdminController.getAllReceptionists);
routes.get('/receptionists/:id', AdminController.getReceptionistById);
routes.put('/receptionists/:id', AdminController.updateReceptionist);

routes.post('/pharmacists', AdminController.createPharmacist);
routes.get('/pharmacists', AdminController.getAllPharmacists);
routes.get('/pharmacists/:id', AdminController.getPharmacistById);
routes.put('/pharmacists/:id', AdminController.updatePharmacist);

routes.post('/lab-technicians', AdminController.createLabTechnician);
routes.get('/lab-technicians', AdminController.getAllLabTechnicians);
routes.get('/lab-technicians/:id', AdminController.getLabTechnicianById);
routes.put('/lab-technicians/:id', AdminController.updateLabTechnician);

routes.get('/staff', AdminController.getAllStaff);

export default routes;
