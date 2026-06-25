import { NextFunction, Request, Response } from "express";
import BillService from "./bills.service";
import { generateBillReceiptPdf } from "@/services/receipt/billReceipt";

class BillController {
  static async generateBillReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.body;
      const bill = await BillService.generateBillReceipt(appointmentId);
      
      generateBillReceiptPdf(bill!, res);
    } catch (error) {
      next(error);
    }
  }
}

export default BillController;