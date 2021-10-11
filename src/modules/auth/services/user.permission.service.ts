import { HttpException } from "../../../core/exceptions/HttpException";
import { isEmpty } from "./../../shared/utils/is.empty";
import { StatusCodes } from "http-status-codes";
import { default as i18n } from "i18next";
import PermissionModel from "../models/permission.model";
import { ServiceInterface } from "./../../shared/interfaces/service.interface";
import { IUserPermission, IUserPermissionPagination } from "../interfaces/user.permission.interface";
import { ObjectId } from "bson";
import { IPermission } from "../interfaces/permission.interface";
import { UserPermissionEntity } from "../entities/user.permission.entity";
import { UrlQueryParam } from "./../../shared/libraries/url.query.param";
import { IPagination } from "./../../shared/interfaces/pagination";
import { AggregatePipeLine } from "./../../shared/interfaces/url.query.param.interface";
import { paginationFields } from "@/modules/shared/utils/pagntaion.fields";

export default class UserPermissionService implements ServiceInterface {
  public permissionModel = PermissionModel;
  private nestId: string;

  constructor() {
    this.nestId = "";
  }

  public setNestId(id: string) {
    this.nestId = id;
    return this;
  }

  public async index(urlQueryParam: UrlQueryParam): Promise<IUserPermissionPagination> {

    const defaultPipeline: AggregatePipeLine[] =
      [
        {
          $project: {
            users: {
              $slice: ["$users", urlQueryParam.OptionPagination.page
                , urlQueryParam.OptionPagination.limit]
            },
            permission: "$name", permissionId: "$_id", _id: 0

          }

        }
        ,
        { $unwind: "$users" },

        {
          $replaceRoot: { newRoot: { $mergeObjects: ["$users", "$$ROOT"] } }
        },
        { $project: { users: 0 } },
        {
          $lookup: {
            from: "users",
            pipeline: [
              { $project: { _id: 0, userName: 1, firstName: 1, lastName: 1 } }
            ],
            localField: "userId",
            foreignField: "_id",
            as: "auth_user"
          }
        },
        {
          $addFields: {
            "userName": {
              "$arrayElemAt": ["$auth_user.userName", 0]
            }, "lastName": {
              "$arrayElemAt": ["$auth_user.lastName", 0]
            }, "firstName": {
              "$arrayElemAt": ["$auth_user.firstName", 0]
            }
          }
        },
        {
          $project: {
            auth_user: 0
          }
        }


      ];
    const defaultPagination: AggregatePipeLine[] = [
      {
        $project: {
          _id: 0,
          totalDocs: { $size: "$users" }
        }
      },
      {
        $addFields: paginationFields(urlQueryParam.OptionPagination.limit, urlQueryParam.OptionPagination.page)

      }];

    if (!isEmpty(this.nestId)) {

      defaultPipeline.unshift({ $match: { "_id": new ObjectId(this.nestId) } });
      defaultPagination.unshift({ $match: { "_id": new ObjectId(this.nestId) } });
    }

    let pipeLine: AggregatePipeLine[] = urlQueryParam.decodeQueryParam().getPipeLine(defaultPipeline);
    const data: IUserPermission[] = await this.permissionModel.aggregate(pipeLine);
    pipeLine = urlQueryParam.resetPipeLine().decodeQueryParam().getPipeLine(defaultPagination);
    let pagination: IPagination[] = await this.permissionModel.aggregate(pipeLine);


    return { data: data, pagination: pagination[0] };

  }

  public async show(id: string): Promise<IUserPermission[]> {
    if (isEmpty(id) && isEmpty(this.nestId)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));
    const pipeline: AggregatePipeLine[] =
      [
        { $match: { "_id": new ObjectId(this.nestId) } },

        { $unwind: "$users" },
        { $match: { "users._id": new ObjectId(id) } },
        { $project: { users: 1, permission: "$name", permissionId: "$_id", _id: 0 } },
        {
          $replaceRoot: { newRoot: { $mergeObjects: ["$users", "$$ROOT"] } }
        },
        { $project: { users: 0 } },
        {
          $lookup: {
            from: "users",
            pipeline: [
              { $project: { _id: 0, userName: 1, firstName: 1, lastName: 1 } }
            ],
            localField: "userId",
            foreignField: "_id",
            as: "auth_user"
          }
        },
        {
          $addFields: {
            "userName": {
              "$arrayElemAt": ["$auth_user.userName", 0]
            }, "lastName": {
              "$arrayElemAt": ["$auth_user.lastName", 0]
            }, "firstName": {
              "$arrayElemAt": ["$auth_user.firstName", 0]
            }
          }
        },
        { $project: { auth_user: 0 } }


      ];


    const data: IUserPermission[] = await this.permissionModel.aggregate(pipeline);

    if (!data) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));

    return data;
  }

  public async create(data: UserPermissionEntity): Promise<void> {
    if (isEmpty(data) && isEmpty(this.nestId)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));


    const createData: IPermission = await this.permissionModel.findByIdAndUpdate(this.nestId, { $push: { "users": data } },
      { new: true, projection: { _id: 0, users: 1 } });

    if (!createData) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));


  }

  public async update(id: string, data: UserPermissionEntity): Promise<void> {
    if (isEmpty(data) && isEmpty(id) && isEmpty(this.nestId)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));


    await this.permissionModel.updateOne({
        _id: this.nestId,
        users: { $elemMatch: { _id: id } }
      }, { $set: { "users.$": data } },
      { new: true, projection: { _id: 0, users: 1 } });


  }

  public async delete(id: string): Promise<void> {
    if (isEmpty(id) && isEmpty(this.nestId)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    await this.permissionModel.updateOne({
        _id: this.nestId,
        users: { $elemMatch: { _id: id } }
      },
      { $pull: { "users": { _id: id } } },
      { new: true, projection: { _id: 0, users: 1 } });

  }
}
