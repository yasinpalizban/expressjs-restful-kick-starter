import bcrypt from "bcrypt";
import config from "config";
import jwt from "jsonwebtoken";
import { HttpException } from "../../../core/exceptions/HttpException";
import { isEmpty } from "./../../shared/utils/is.empty";
import { StatusCodes } from "http-status-codes";
import { default as i18n } from "i18next";
import { IUser } from "../interfaces/user.interface";
import UserModel from "../models/user.model";
import { DataStoredInToken, TokenData } from "../interfaces/jwt.token.interface";
import { sharedConfig } from "./../../shared/configs/shared.config";
import ejs from "ejs";
import nodemailer from "nodemailer";
import { AuthEntity } from "../entities/auth.entity";
import { compareDate } from "./../../shared/utils/compare.date";
import { Sms } from "./../../shared/libraries/sms";
import { AuthServiceInterface } from "../interfaces/auth.service.interface";
import { ILogIn } from "../interfaces/Log.in.interface";
import GroupModel from "../models/group.model";
import { RoleType } from "../enums/role.type.enum";
import { IPermission } from "../interfaces/permission.interface";
import PermissionModel from "../models/permission.model";
import { IUserPermission } from "../interfaces/user.permission.interface";
import { IGroupPermission } from "../interfaces/group.permission.interface";
import { IGroup } from "../interfaces/group.interface";
import ipActivityModel from "../models/ip.activity.model";
import { authConfig } from "@/modules/auth/configs/auth.config";

export default class AuthService implements AuthServiceInterface {
  public userModel = UserModel;
  public groupModel = GroupModel;
  public permissionModel = PermissionModel;
  public sms = new Sms(sharedConfig.sms.userName,
    sharedConfig.sms.password, 0);

  public async signUp(entity: AuthEntity): Promise<IUser> {
    if (isEmpty(entity) || (entity.phone == undefined && entity.email == undefined)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));


    let findUser: IUser;

    if (entity.email !== undefined) {
      findUser = await this.userModel.findOne({ email: entity.email, userName: entity.userName });
      if (findUser) {
        // @ts-ignore
        await ipActivityModel.storeIp(false, "sign-up", entity);
        throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreEmail"));
      }

      await this.sendActivationEmail(entity.email, entity.activeToken);


    }
    if (entity.phone !== undefined) {
      findUser = await this.userModel.findOne({ phone: entity.phone, userName: entity.userName });
      if (findUser) {
        // @ts-ignore
        await ipActivityModel.storeIp(false, "sign-up", entity);
        throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.yourArePhone"));

      }
      await this.sms.sendActivationCode(entity.phone, config.get("siteAddress"));

    }


    const createUser: IUser = await this.userModel.create(entity);

    if (!createUser) throw new HttpException(StatusCodes.CONFLICT, i18n.t("api.commons.reject"));
    const newRole: object = { userId: createUser._id };
    // @ts-ignore
    await ipActivityModel.storeIp(true, "sign-up", entity);
    await this.groupModel.findOneAndUpdate({ name: RoleType.Member }, { $push: { "members": newRole } });
    await ipActivityModel;
    return createUser;

  }

  public async signIn(entity: AuthEntity): Promise<ILogIn> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    let findUser: IUser;


    if (entity.userName !== undefined) {
      findUser = await this.userModel.findOne({ userName: entity.userName });

    }
    if (entity.email !== undefined) {
      findUser = await this.userModel.findOne({ email: entity.email });

    }
    if (entity.phone !== undefined) {
      findUser = await this.userModel.findOne({ phone: entity.phone });

    }
    if (!findUser) {
      // @ts-ignore
      await ipActivityModel.storeIp(false, "sign-in", entity);
      throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.accountNotExist"));
    }


    const isPasswordMatching: boolean = await bcrypt.compare(entity.password, findUser.password);
    if (!isPasswordMatching) {
      // @ts-ignore
      await ipActivityModel.storeIp(false, "sign-in", entity);
      throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.accountNotExist"));

    }
    if (findUser.status == true) {
      // @ts-ignore
      await ipActivityModel.storeIp(false, "sign-in", entity);
      throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.accountBan"));

    }
    if (findUser.active == false) {
      // @ts-ignore
      await ipActivityModel.storeIp(false, "sign-in", entity);
      throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.accountNotConfirm"));

    }
    // @ts-ignore
    await ipActivityModel.storeIp(true, "sign-in", entity);
    const userGroup: IGroup = await this.groupModel.findOne({ "members.userId": findUser._id }, { _id: 1, name: 1 });


    const tokenData: TokenData = this.createToken(findUser, entity.remember ?? false);
    const cookie = this.createCookie(tokenData);
    const permissions: IPermission[] = await this.permissionModel.find({ active: true }, {
      _id: 1,
      name: 1,
      description: 1
    });
    const permissionUser: IUserPermission[] = await this.permissionModel.aggregate(
      [{ $match: { "users.userId": findUser._id } },
        { $unwind: "$users" },
        { $project: { _id: 0, users: 1 } },
        { $replaceRoot: { newRoot: "$users" } }
      ]);
    const permissionGroup: IGroupPermission[] = await this.permissionModel.aggregate(
      [{ $match: { "groups.groupId": userGroup._id } },
        { $unwind: "$groups" },
        { $project: { _id: 0, groups: 1 } },
        { $replaceRoot: { newRoot: "$groups" } }
      ]);


    return {
      cookie: cookie,
      findUser: findUser,
      role: userGroup,
      jwt: tokenData,
      permissions: permissions,
      permissionUser: permissionUser,
      permissionGroup: permissionGroup
    };
  }

  public async signOut(entity: IUser): Promise<void> {

    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));


    const findUser: IUser = await this.userModel.findOne({
      _id: entity._id
    });
    if (!findUser) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreEmail"));
    //  return findUser;

  }

  public async forgot(entity: AuthEntity): Promise<void> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));


    let findUser: IUser;

    if (entity.userName !== undefined) {
      findUser = await this.userModel.findOne({ userName: entity.userName });
      if (!findUser) {
        // @ts-ignore
        await ipActivityModel.storeIp(false, "forgot", entity);
        throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreNotUserName"));
      }

      if (findUser.email !== undefined) {
        await this.sendForgotEmail(findUser.email, entity.resetToken);
      } else {
        await this.sms.sendActivationCode(entity.phone, config.get("siteAddress"));

      }
    }
    if (entity.email !== undefined) {
      findUser = await this.userModel.findOne({ email: entity.email });
      if (!findUser) {
        // @ts-ignore
        await ipActivityModel.storeIp(false, "forgot", entity);
        throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreNotEmail"));
      }
      await this.sendForgotEmail(findUser.email, entity.resetToken);

    }
    if (entity.phone !== undefined) {
      findUser = await this.userModel.findOne({ phone: entity.phone });
      if (!findUser) {
        // @ts-ignore
        await ipActivityModel.storeIp(false, "forgot", entity);
        throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.yourAreNotPhone"));
      }
      await this.sms.sendActivationCode(entity.phone, config.get("siteAddress"));


    }
    await this.userModel.findByIdAndUpdate(findUser._id, entity);
  }

  public async activationViaEmail(entity: AuthEntity): Promise<true> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    const findUser: IUser = await this.userModel.findOne({
      activeToken: entity.activeToken,
      active: false,
      email: entity.email
    });
    if (!findUser) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreNotUserName"));
    if (compareDate(findUser.activeExpires, new Date())) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.tokenExpire"));


    await this.userModel.findByIdAndUpdate(findUser._id, {
      active: true,
      activeToken: null,
      activeExpires: null
    });
    return true;
  }

  public async sendActivateCodeViaEmail(entity: AuthEntity): Promise<void> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    const findUser: IUser = await this.userModel.findOne({ email: entity.email });
    if (!findUser) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreNotEmail"));
    await this.sendActivationEmail(findUser.email, entity.activeToken);
    await this.userModel.findByIdAndUpdate(findUser._id, entity);

  }

  public async activationViaSms(entity: AuthEntity): Promise<true> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    const isValid = await this.sms.isActivationCodeValid(entity.phone, entity.activeToken);


    if (!isValid) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.tokenExpire"));

    const findUser: IUser = await this.userModel.findOne({ phone: entity.phone, active: false });
    if (!findUser) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreNotAccount"));

    await this.userModel.findByIdAndUpdate(findUser._id, {
      active: true,
      activeToken: null,
      activeExpires: null
    });
    return true;
  }

  public async sendActivateCodeViaSms(entity: AuthEntity): Promise<void> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    const findUser: IUser = await this.userModel.findOne({ phone: entity.phone });
    if (!findUser) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreNotEmail"));
    await this.sms.sendActivationCode(entity.phone, config.get("siteAddress"));
    await this.userModel.findByIdAndUpdate(findUser._id, entity);

  }

  public async resetPasswordViaEmail(entity: AuthEntity): Promise<void> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    const findUser: IUser = await this.userModel.findOne({ email: entity.email });
    if (!findUser) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.youAreNotEmail"));

    await this.userModel.findByIdAndUpdate(findUser._id, {
      entity,
      resetToken: null,
      resetExpires: null
    });


  }

  public async resetPasswordViaSms(entity: AuthEntity): Promise<void> {
    if (isEmpty(entity)) throw new HttpException(StatusCodes.BAD_REQUEST, i18n.t("api.commons.reject"));

    const isValid = await this.sms.isActivationCodeValid(entity.phone, entity.resetToken);

    if (!isValid) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.tokenExpire"));

    const findUser: IUser = await this.userModel.findOne({ phone: entity.phone });

    if (!findUser) throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.yourAreNotPhone"));

    await this.userModel.findByIdAndUpdate(findUser._id, {
      entity,
      resetToken: null,
      resetExpires: null
    });

  }

  public createToken(user: IUser, isRemember: boolean): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string = config.get("jwt.secretKey");
    const maxAge: number = (isRemember == true ? 2 * authConfig.time.day : 2 * authConfig.time.hour);
    let date = new Date();
    date.setSeconds(maxAge);
    const expire: number = Math.floor(date.getTime() / 1000);
    return { expire: expire, maxAge: maxAge, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn: maxAge }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.maxAge};`;
  }


  public async sendForgotEmail(email: string, hash: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: config.get("email.host"),
      port: config.get("email.port"),
      secure: config.get("email.secure"), // true for 465, false for other ports
      auth: config.get("email.auth")
    });
    const mailContext = {
      siteAddress: config.get("siteAddress"),
      emailForgotTitle: i18n.t("auth.emailForgotTitle"),
      emailForgotGuide: i18n.t("auth.emailForgotGuide"),
      emailActivateHash: i18n.t("auth.emailActivateHash"),
      hash: hash,
      emailForgotVisit: i18n.t("auth.emailForgotVisit"),
      emailActivateIgnore: i18n.t("auth.emailActivateIgnore"),
      emailForgotResetFrom: i18n.t("auth.emailForgotResetFrom")
    };
    const template = await ejs.renderFile("./dist/modules/auth/views/forgot.html", mailContext);

    const mailOptions = {
      from: config.get("email.fromEmail"),
      to: email,
      subject: config.get("siteAddress") + " (" + i18n.t("api.events.emailForgot") + ")",
      html: template

    };
    let isSend = await transporter.sendMail(mailOptions);
    if (!isSend.messageId) {
      throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.emailSendErrorForgot"));

    }
  }

  public async sendActivationEmail(email: string, hash: string): Promise<void> {

    const transporter = nodemailer.createTransport({
      host: config.get("email.host"),
      port: config.get("email.port"),
      secure: config.get("email.secure"), // true for 465, false for other ports
      auth: config.get("email.auth")
    });
    const mailContext = {
      siteAddress: config.get("siteAddress"),
      emailActivateTitle: i18n.t("auth.emailActivateTitle"),
      emailActivateGuide: i18n.t("auth.emailActivateGuide"),
      emailActivateHash: i18n.t("auth.emailActivateHash"),
      hash: hash,
      emailActivationPage: i18n.t("auth.emailActivationPage"),
      emailActivateIgnore: i18n.t("auth.emailActivateIgnore"),
      emailActivateAccount: i18n.t("auth.emailActivateAccount")
    };

    const template = await ejs.renderFile("./dist/modules/auth/views/activation.html", mailContext);
    const mailOptions = {
      from: config.get("email.fromEmail"),
      to: email,
      subject: config.get("siteAddress") + " (" + i18n.t("api.events.emailActivation") + ")",
      html: template

    };
    let isSend = await transporter.sendMail(mailOptions);
    if (!isSend.messageId) {
      throw new HttpException(StatusCodes.CONFLICT, i18n.t("auth.emailSendErrorActivation"));
    }
  }


}
