import { Router } from "express";
import { Authorize } from "@/middlewares/auth.middleware";
import AuthController from "./auth.controller";

const routes = Router();

routes.post("/login", AuthController.localLogin);
routes.post("/logout", Authorize(), AuthController.logout);
routes.get("/me", Authorize(), AuthController.getMe);
routes.post("/refresh", AuthController.refreshToken);
routes.post("/forgot-password", AuthController.forgotPassword);
routes.post("/reset-password", AuthController.resetPassword);

export default routes;