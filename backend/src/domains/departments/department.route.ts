import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';
import DepartmentController from './department.controller';

const routes = Router();

routes.post('/', Authorize(['admin']), DepartmentController.createDepartment);
routes.get('/', Authorize(['admin']), DepartmentController.getAllDepartments);
routes.get('/:id', Authorize(['admin']), DepartmentController.getDepartmentById);
routes.put('/:id', Authorize(['admin']), DepartmentController.updateDepartment);
routes.delete('/:id', Authorize(['admin']), DepartmentController.deleteDepartment);

export default routes;
