import { HttpException } from "../../../core/exceptions/HttpException";
import { isEmpty } from "./../../shared/utils/is.empty";
import { StatusCodes } from "http-status-codes";
import { default as i18n } from "i18next";
import { UserEntity } from "../entities/user.entity";
import { IUser, IUserPagination } from "../../auth/interfaces/user.interface";
import UserModel from "../../auth/models/user.model";
import GroupModel from "../../auth/models/group.model";
import { ServiceInterface } from "./../../shared/interfaces/service.interface";
import { UrlQueryParam } from "./../../shared/libraries/url.query.param";
import { AggregatePipeLine } from "./../../shared/interfaces/url.query.param.interface";
import { IGroup } from "../../auth/interfaces/group.interface";
import { IPagination } from "@/modules/shared/interfaces/pagination";
import { ObjectId } from "bson";

export default class UserService implements ServiceInterface {
  public userModel = UserModel;
  public groupModel = GroupModel;

  public async index(urlQueryParam: UrlQueryParam): Promise<IUserPagination> {

    const defaultPipeLine: AggregatePipeLine[] = [
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
          group: "$_group.name"
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

    ];
    const pipeLine: AggregatePipeLine[] = urlQueryParam.decodeQueryParam().getPipeLine(defaultPipeLine);

    // @ts-ignore
    let pagination: IPagination = await this.userModel.aggregatePaginate(this.userModel.aggregate(pipeLine), urlQueryParam.OptionPagination);
    const data: IUser[] = pagination.docs;
    delete pagination.docs;

    return { data: data, pagination: pagination };
  }

  public async show(id: string): Promise<IUser[]> {
    if (isEmpty(id)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    const dataById: IUser[] = await this.userModel.aggregate([
      {
        $match: { _id: new ObjectId(id) }
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
          group: "$_group.name"
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
    if (!dataById) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.exist"));

    return dataById;
  }

  public async create(entity: UserEntity): Promise<void> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    if (entity.email) {
      const isEmailUserValid: IUser = await this.userModel.findOne({ email: entity.email });
      if (isEmailUserValid) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreEmail"));
    }
    if (entity.phone) {
      const isPhoneUserValid: IUser = await this.userModel.findOne({ phone: entity.phone });
      if (isPhoneUserValid) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.yourArePhone"));
    }
    const userRole: string = entity.role;
    delete entity.role;
    const createData: IUser = await this.userModel.create({ ...entity });

    if (!createData) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));

    const newRole: object = { userId: createData._id };

    await this.groupModel.findOneAndUpdate({ name: userRole }, { $push: { "members": newRole } });


  }

  public async update(id: string, entity: UserEntity): Promise<void> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));
    const userRole: string = entity.role;
    delete entity.role;

    const updateById: IUser = await this.userModel.findByIdAndUpdate(id, entity, { new: true });
    if (!updateById) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));

    const newRole: object = { userId: updateById._id };

    const oldRole: IGroup = await this.groupModel.findOne({ "members.userId": id }, { _id: 1, name: 1 });

    if (userRole != oldRole.name) {
      await this.groupModel.findOneAndUpdate({ _id: oldRole._id }, { $pull: { "members": { userId: id } } });

      await this.groupModel.findOneAndUpdate({ name: userRole }, { $push: { "members": newRole } });

    }


  }

  public async delete(id: string): Promise<void> {
    if (isEmpty(id)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    await this.userModel.findByIdAndDelete(id);

  }
}

