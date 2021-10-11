import { HttpException } from "../../../core/exceptions/HttpException";
import { isEmpty } from "./../../shared/utils/is.empty";
import { StatusCodes } from "http-status-codes";
import { default as i18n } from "i18next";
import { ServiceInterface } from "./../../shared/interfaces/service.interface";
import { UrlQueryParam } from "./../../shared/libraries/url.query.param";
import GroupModel from "../models/group.model";
import { IGroup, IGroupPagination } from "../interfaces/group.interface";
import { AggregatePipeLine } from "./../../shared/interfaces/url.query.param.interface";
import { GroupEntity } from "../entities/group.entity";
import { IPagination } from "./../../shared/interfaces/pagination";
import { ObjectId } from "bson";

export default class GroupService implements ServiceInterface {
  public groupModel = GroupModel;

  public async index(urlQueryParam: UrlQueryParam): Promise<IGroupPagination> {
    const defaultPipeLine: AggregatePipeLine[] = [
      { $project: { members: 0 } }
    ];
    const pipeLine: AggregatePipeLine[] = urlQueryParam.decodeQueryParam().getPipeLine(defaultPipeLine);
    // @ts-ignore
    let pagination: IPagination = await this.groupModel.aggregatePaginate(this.groupModel.aggregate(pipeLine)
      , urlQueryParam.OptionPagination);
    const data: IGroup[] = pagination.docs;
    delete pagination.docs;
    return { data: data, pagination: pagination };
  }

  public async show(id: string): Promise<IGroup[]> {
    if (isEmpty(id)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));

    const dataById: IGroup[] = await this.groupModel.aggregate([
      { $match: { _id: new ObjectId(id) } },
      { $project: { members: 0 } }
    ]);

    if (!dataById) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.exist"));

    return dataById;
  }

  public async create(data: GroupEntity): Promise<void> {
    if (isEmpty(data)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));


    const createData: IGroup = await this.groupModel.create({ ...data });

    if (!createData) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));


  }

  public async update(id: string, data: GroupEntity): Promise<void> {
    if (isEmpty(data)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.validation"));


    await this.groupModel.updateOne({ _id: id }, data, { new: true });


  }

  public async delete(id: string): Promise<void> {
    if (isEmpty(id)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));


    await this.groupModel.findByIdAndDelete(id);

  }
}

