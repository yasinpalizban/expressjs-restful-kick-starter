import config from "config";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { default as i18n } from "i18next";
import { StatusCodes } from "http-status-codes";
import { DataStoredInToken } from "../interfaces/jwt.token.interface";
import { RequestWithUser } from "../interfaces/reqeust.with.user.interface";
import UserModel from "../models/user.model";
import PermissionModel from "../models/permission.model";
import { RoleRouteService } from "../services/role.route.service";
import { routeController } from "../uitls/route.controller";
import { IPermission } from "../interfaces/permission.interface";

import { IUserPermission } from "../interfaces/user.permission.interface";
import { IGroupPermission } from "../interfaces/group.permission.interface";
import { isEmpty } from "./../../shared/utils/is.empty";
import { ObjectId } from "bson";
import { ErrorType } from "../enums/error.type.enum";
import { IUserLogIn } from "../interfaces/Log.in.interface";

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {

  try {

    const Authorization = req.header("Authorization").split("Bearer ")[1] || req.cookies["Authorization"] || null;

    if (isEmpty(Authorization)) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: i18n.t("middleWear.authToken"),
        type: ErrorType.Login
      });
    }
    const ruleRoute = new RoleRouteService();
    const secretKey: string = config.get("jwt.secretKey");
    const verificationResponse = (await jwt.verify(Authorization, secretKey)) as DataStoredInToken;
    const userId = verificationResponse._id;

    let findUser: IUserLogIn[] = await UserModel.aggregate([
      {
        $match: { "_id": new ObjectId(userId) }
      },
      {
        $lookup: {
          from: "auth_groups",
          localField: "_id",
          foreignField: "members.userId",
          as: "_group"
        }
      },
      { $unwind: "$_group" },
      {
        $addFields: {
          role: {
            _id: "$_group._id",
            name: "$_group.name"
          }
        }
      },
      {
        $group: {
          _id: "$_id",
          root: { $mergeObjects: "$$ROOT" }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$root", "$$ROOT"]
          }
        }
      },
      {
        $project: {
          root: 0,
          _group: 0
        }
      }
    ]);


    if (isEmpty(findUser)) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: i18n.t("middleWear.wrongAuth"),
        type: ErrorType.Login
      });
    }
    req.user = findUser[0];


    const controllerName = routeController(req.route.path);
    const permissions: IPermission = await PermissionModel.findOne({ active: true, name: controllerName });

    if (isEmpty(permissions)) {

      const controllerRole: [] | null = ruleRoute.getRoleAccess(controllerName);

      if (controllerRole == null) {
        return next();
      }
      for (const role of controllerRole) {
        if (role == findUser[0].role.name) {
          return next();
        }
      }

    } else {

      const typeMethod = req.method;
      const userPermission: IUserPermission[] = permissions["users"];
      const groupPermission: IGroupPermission[] = permissions["groups"];

      for (const isUser of userPermission) {

        if (isUser.userId == findUser[0]._id && isUser.actions.search(typeMethod.toLowerCase()) !== -1) {

          return next();
        }
      }

      for (const isGroup of groupPermission) {

        if (isGroup.groupId == findUser[0].role._id && isGroup.actions.search(typeMethod.toLowerCase()) !== -1) {

          return next();
        }
      }

    }
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: i18n.t("middleWear.notEnoughPrivilege"),
      type: ErrorType.Permission
    });

  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: i18n.t("middleWear.wrongAuth"),
      type: ErrorType.Login
    });
  }
};

export default authMiddleware;
