import { HttpException } from "../../../core/exceptions/HttpException";
import { isEmpty } from "./../../shared/utils/is.empty";
import { StatusCodes } from "http-status-codes";
import { default as i18n } from "i18next";
import PermissionModel from "../models/permission.model";
import { ServiceInterface } from "./../../shared/interfaces/service.interface";
import { IGroupPermission, IGroupPermissionPagination } from "../interfaces/group.permission.interface";
import { GroupPermissionEntity } from "../entities/group.permission.entity";
import { ObjectId } from "bson";
import { IPermission } from "../interfaces/permission.interface";
import { UrlQueryParam } from "./../../shared/libraries/url.query.param";
import { IPagination } from "./../../shared/interfaces/pagination";
import { AggregatePipeLine } from "./../../shared/interfaces/url.query.param.interface";
import { paginationFields } from "@/modules/shared/utils/pagntaion.fields";

export default class GroupPermissionService implements ServiceInterface {
  public permissionModel = PermissionModel;
  private nestId: string;

  constructor() {
    this.nestId = "";
  }

  public setNestId(id: string) {
    this.nestId = id;
    return this;
  }

  public async index(urlQueryParam: UrlQueryParam): Promise<IGroupPermissionPagination> {

    const defaultPipeline: AggregatePipeLine[] =
      [
        {
          $project: {
            groups: {
              $slice: ["$groups", urlQueryParam.OptionPagination.page
                , urlQueryParam.OptionPagination.limit]
            },
            permission: "$name", permissionId: "$_id", _id: 0

          }

        }
        ,
        { $unwind: "$groups" },

        {
          $replaceRoot: { newRoot: { $mergeObjects: ["$groups", "$$ROOT"] } }
        },
        { $project: { groups: 0 } },
        {
          $lookup: {
            from: "auth_groups",
            pipeline: [
              { $project: { _id: 0, name: 1 } }
            ],
            localField: "groupId",
            foreignField: "_id",
            as: "auth_group"
          }
        },
        {
          $addFields: {
            "group": {
              "$arrayElemAt": ["$auth_group.name", 0]
            }
          }
        },
        {
          $project: {
            auth_group: 0
          }
        }


      ];

    const defaultPagination: AggregatePipeLine[] = [

      {
        $project: {
          _id: 0,
          totalDocs: { $size: "$groups" }
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
    const data: IGroupPermission[] = await this.permissionModel.aggregate(pipeLine);
    pipeLine = urlQueryParam.resetPipeLine().decodeQueryParam().getPipeLine(defaultPagination);
    const pagination: IPagination[] = await this.permissionModel.aggregate(pipeLine);

    return { data: data, pagination: pagination[0] };

  }

  public async show(id: string): Promise<IGroupPermission[]> {
    if (isEmpty(id) && isEmpty(this.nestId)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));

    const pipeline: AggregatePipeLine[] =
      [
        { $match: { "_id": new ObjectId(this.nestId) } },

        { $unwind: "$groups" },
        { $match: { "groups._id": new ObjectId(id) } },
        { $project: { groups: 1, permission: "$name", permissionId: "$_id", _id: 0 } },
        {
          $replaceRoot: { newRoot: { $mergeObjects: ["$groups", "$$ROOT"] } }
        },
        { $project: { groups: 0 } },
        {
          $lookup: {
            from: "auth_groups",
            pipeline: [
              { $project: { _id: 0, name: 1 } }
            ],
            localField: "groupId",
            foreignField: "_id",
            as: "auth_group"
          }
        },
        {
          $addFields: {
            "group": {
              "$arrayElemAt": ["$auth_group.name", 0]
            }
          }
        },
        { $project: { auth_group: 0 } }


      ];


    const data: IGroupPermission[] = await this.permissionModel.aggregate(pipeline);

    if (!data) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));

    return data;
  }

  public async create(data: GroupPermissionEntity): Promise<void> {
    if (isEmpty(data) && isEmpty(this.nestId)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));


    const createData: IPermission = await this.permissionModel.findByIdAndUpdate(this.nestId, { $push: { "groups": data } },
      { new: true, projection: { _id: 0, groups: 1 } });

    if (!createData) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));


  }

  public async update(id: string, data: GroupPermissionEntity): Promise<void> {
    if (isEmpty(data) && isEmpty(this.nestId) && isEmpty(id)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));


    await this.permissionModel.updateOne({
        _id: this.nestId,
        groups: { $elemMatch: { _id: id } }
      }, { $set: { "groups.$": data } },
      { new: true, projection: { _id: 0, groups: 1 } });


  }

  public async delete(id: string): Promise<void> {
    if (isEmpty(this.nestId) && isEmpty(id)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    await this.permissionModel.updateOne({
        _id: this.nestId,
        groups: { $elemMatch: { _id: id } }
      },
      { $pull: { "groups": { _id: id } } },
      { new: true, projection: { _id: 0, groups: 1 } });


  }
}
