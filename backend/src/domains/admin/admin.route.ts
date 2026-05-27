import { Router } from 'express';
import { Authorize } from '@/middlewares/auth.middleware';

const routes = Router();
routes.use(Authorize(['admin']));

export default routes;
