import { Router } from "express";
import { Authorize } from "@/middlewares/auth.middleware";
import BillController from "./bills.controller";

const routes = Router();

routes.post('/generate-receipt', Authorize(['receptionist']), BillController.generateBillReceipt);

export default routes;