import { Request, Response, NextFunction } from "express";
import DepartmentController from "./department.controller";
import AuthController from "./auth.controller";
import DoctorController from "./doctor.controller";
import StaffController from "./staff.controller";
import ReceptionistController from "./receptionist.controller";
import PharmacistController from "./pharmacist.controller";
import LabTechnicianController from "./labTechnician.controller";

class AdminController {
  static async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentController.createDepartment(req.body);
      res.status(201).json(department);
    } catch (error) {
      next(error);
    }
  }

  static async getAllDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await DepartmentController.getAllDepartments();
      res.status(200).json(departments);
    } catch (error) {
      next(error);
    }
  }

  static async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentController.getDepartmentById(req.params.id as string);
      res.status(200).json(department);
    } catch (error) {
      next(error);
    }
  }

  static async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentController.updateDepartment(req.params.id as string, req.body);
      res.status(200).json(department);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      await DepartmentController.deleteDepartment(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getAllStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const staffs = await StaffController.getAllStaff(page, limit);
      res.status(200).json(staffs);
    } catch (error) {
      next(error);
    }
  }

  static async getStaffSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await StaffController.getStaffSummary();
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  static async disableUser(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthController.blockUser(req.body.email);
      res.status(200).json({ message: 'User disabled successfully' });
    } catch (error) {
      next(error);
    }
  }


  static async createDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorController.createDoctor(req.body);
      res.status(201).json(doctor);
    } catch (error) {
      next(error);
    }
  }

  static async getAllDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const doctors = await DoctorController.getAllDoctors(page, limit);
      res.status(200).json(doctors);
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorById(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorController.getDoctorById(req.params.id as string);
      res.status(200).json(doctor);
    } catch (error) {
      next(error);
    }
  }

  static async updateDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorController.updateDoctor(req.params.id as string, req.body);
      res.status(200).json(doctor);
    } catch (error) {
      next(error);
    }
  }


  static async createReceptionist(req: Request, res: Response, next: NextFunction) {
    try {
      const receptionist = await ReceptionistController.createReceptionist(req.body);
      res.status(201).json(receptionist);
    } catch (error) {
      next(error);
    }
  }

  static async getAllReceptionists(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const receptionists = await ReceptionistController.getAllReceptionists(page, limit);
      res.status(200).json(receptionists);
    } catch (error) {
      next(error);
    }
  }

  static async getReceptionistById(req: Request, res: Response, next: NextFunction) {
    try {
      const receptionist = await ReceptionistController.getReceptionistById(req.params.id as string);
      res.status(200).json(receptionist);
    } catch (error) {
      next(error);
    }
  }

  static async updateReceptionist(req: Request, res: Response, next: NextFunction) {
    try {
      const receptionist = await ReceptionistController.updateReceptionist(req.params.id as string, req.body);
      res.status(200).json(receptionist);
    } catch (error) {
      next(error);
    }
  }


  static async createPharmacist(req: Request, res: Response, next: NextFunction) {
    try {
      const pharmacist = await PharmacistController.createPharmacist(req.body);
      res.status(201).json(pharmacist);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPharmacists(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const pharmacists = await PharmacistController.getAllPharmacists(page, limit);
      res.status(200).json(pharmacists);
    } catch (error) {
      next(error);
    }
  }

  static async getPharmacistById(req: Request, res: Response, next: NextFunction) {
    try {
      const pharmacist = await PharmacistController.getPharmacistById(req.params.id as string);
      res.status(200).json(pharmacist);
    } catch (error) {
      next(error);
    }
  }

  static async updatePharmacist(req: Request, res: Response, next: NextFunction) {
    try {
      const pharmacist = await PharmacistController.updatePharmacist(req.params.id as string, req.body);
      res.status(200).json(pharmacist);
    } catch (error) {
      next(error);
    }
  }


  static async createLabTechnician(req: Request, res: Response, next: NextFunction) {
    try {
      const labTechnician = await LabTechnicianController.createLabTechnician(req.body);
      res.status(201).json(labTechnician);
    } catch (error) {
      next(error);
    }
  }

  static async getAllLabTechnicians(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;

      const labTechnicians = await LabTechnicianController.getAllLabTechnicians(page, limit);
      res.status(200).json(labTechnicians);
    } catch (error) {
      next(error);
    }
  }

  static async getLabTechnicianById(req: Request, res: Response, next: NextFunction) {
    try {
      const labTechnician = await LabTechnicianController.getLabTechnicianById(req.params.id as string);
      res.status(200).json(labTechnician);
    } catch (error) {
      next(error);
    }
  }

  static async updateLabTechnician(req: Request, res: Response, next: NextFunction) {
    try {
      const labTechnician = await LabTechnicianController.updateLabTechnician(req.params.id as string, req.body);
      res.status(200).json(labTechnician);
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;