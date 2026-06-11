import { Request, Response, NextFunction } from "express";
import DepartmentService from "./department.service";

class DepartmentController {static async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.createDepartment(req.body);
      res.status(201).json(department);
    } catch (error) {
      next(error);
    }
  }

  static async getAllDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await DepartmentService.getAllDepartments();
      res.status(200).json(departments);
    } catch (error) {
      next(error);
    }
  }

  static async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.getDepartmentById(req.params.id as string);
      res.status(200).json(department);
    } catch (error) {
      next(error);
    }
  }

  static async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.updateDepartment(req.params.id as string, req.body);
      res.status(200).json(department);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      await DepartmentService.deleteDepartment(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }}

export default DepartmentController;