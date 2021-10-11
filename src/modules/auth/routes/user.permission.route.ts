import { Router } from "express";
import { Routes } from "../../../core/interfaces/routes.interface";
import authMiddleware from "../middlewares/auth.middleware";
import validationMiddleware from "../../../core/middlewares/validation.middleware";
import UserPermissionController from "../controllers/user.permission.controller";
import { UserPermissionValidation } from "../validations/user.permission.validation";

export default class GroupPermissionRoute implements Routes {
  public pathNested = "/api/permission/:id/userPermission";
  public path = "/api/userPermission";

  public router = Router({ mergeParams: true });
  public controller = new UserPermissionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.pathNested}`, authMiddleware, this.controller.index);
    this.router.get(`${this.pathNested}/:subId`, authMiddleware, this.controller.show);
    this.router.post(`${this.pathNested}`, authMiddleware, validationMiddleware(UserPermissionValidation , "body"), this.controller.create);
    this.router.put(`${this.pathNested}/:subId`, authMiddleware, validationMiddleware(UserPermissionValidation , "body", true), this.controller.update);
    this.router.delete(`${this.pathNested}/:subId`, authMiddleware, this.controller.delete);

    this.router.get(`${this.path}`, authMiddleware, this.controller.index);
  }
}

