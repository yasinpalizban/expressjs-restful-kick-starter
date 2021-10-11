import { HttpException } from "../../../core/exceptions/HttpException";
import { isEmpty } from "./../../shared/utils/is.empty";
import { StatusCodes } from "http-status-codes";
import { default as i18n } from "i18next";
import PermissionModel from "../models/permission.model";
import { IPermission, IPermissionPagination } from "../interfaces/permission.interface";
import { PermissionEntity } from "../entities/permission.entity";
import { ServiceInterface } from "./../../shared/interfaces/service.interface";
import { UrlQueryParam } from "./../../shared/libraries/url.query.param";
import { AggregatePipeLine } from "./../../shared/interfaces/url.query.param.interface";
import { IPagination } from "./../../shared/interfaces/pagination";
import { ObjectId } from "bson";

export default class PermissionService implements ServiceInterface {
  public permissionModel = PermissionModel;

  public async index(urlQueryParam: UrlQueryParam): Promise<IPermissionPagination> {
    const defaultPipeline: AggregatePipeLine[] = [{
      $project: { users: 0, groups: 0 }
    }];

    const pipeLine: AggregatePipeLine[] = urlQueryParam.decodeQueryParam().getPipeLine(defaultPipeline);
    // @ts-ignore
    let pagination: IPagination = await this.permissionModel.aggregatePaginate(this.permissionModel.aggregate(pipeLine),
      urlQueryParam.OptionPagination);
    const data: IPermission[] = pagination.docs;
    delete pagination.docs;
    return { data: data, pagination: pagination };
  }

  public async show(id: string): Promise<IPermission[]> {
    if (isEmpty(id)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));

    const dataById: IPermission[] = await this.permissionModel.aggregate([
      {
        $match: { _id: new ObjectId(id) }

      },
      {
        $project: { users: 0, groups: 0 }
      }
    ]);
    if (!dataById) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.exist"));

    return dataById;
  }

  public async create(data: PermissionEntity): Promise<void> {
    if (isEmpty(data)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));


    const createData: IPermission = await this.permissionModel.create({ ...data });

    if (!createData) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));


  }

  public async update(id: string, data: PermissionEntity): Promise<void> {
    if (isEmpty(data)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));


    await this.permissionModel.findByIdAndUpdate(id, data, { new: true });

  }

  public async delete(id: string): Promise<void> {
    if (isEmpty(id)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    const deleteById: IPermission = await this.permissionModel.findByIdAndDelete(id);

  }
}

