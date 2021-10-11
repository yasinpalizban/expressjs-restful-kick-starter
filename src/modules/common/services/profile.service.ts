import { HttpException } from "../../../core/exceptions/HttpException";
import { isEmpty } from "./../../shared/utils/is.empty";
import { StatusCodes } from "http-status-codes";
import { default as i18n } from "i18next";
import { UserEntity } from "../entities/user.entity";
import UserModel from "../../auth/models/user.model";
import { IUser } from "../../auth/interfaces/user.interface";
import { ServiceInterface } from "./../../shared/interfaces/service.interface";
import { deleteFile } from "./../../shared/utils/delete.file";
import { authConfig } from "./../../auth/configs/auth.config";
import { sharedConfig } from "./../../shared/configs/shared.config";

export default class ProfileService implements ServiceInterface {
  public userModel = UserModel;


  public async show(id: string): Promise<IUser> {

    const findUser: IUser = await this.userModel.findOne({ _id: id });
    if (!findUser) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.exist"));

    return findUser;
  }


  public async update(id: string, data: UserEntity): Promise<IUser> {
    if (isEmpty(data)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));


    const updateUserById: IUser = await this.userModel.findByIdAndUpdate(id, data,{ new: true});

    if (!updateUserById) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));
    if (updateUserById.image != authConfig.defaultUserProfile
      && data.image !== undefined)
      await deleteFile(sharedConfig.appRoot + updateUserById.image);
    return updateUserById;
  }

}

