import {Model,  model, Schema, Document } from "mongoose";
import { IIpActivity } from "../interfaces/ip.activity.interface";


interface IpActivityModel extends Model<IIpActivity> {
  storeIp(): void;
  saveIp(): void;
}
const ipActivitySchema = new Schema<IIpActivity,IpActivityModel>({
  success: Boolean,
  login: String,
  ip: String,
  userAgent: String,
  type: String,
  createdAt: Date

});
ipActivitySchema.static("storeIp", async function saveIp(flag: boolean, type: string, entity: any) {
  await this.create({
    success: flag,
    type: type,
    login: entity.login,
    ip: entity.ip,
    userAgent: entity.userAgent,
    createdAt: new Date()
  });
});

ipActivitySchema.method("saveIp", async function saveIp(flag: boolean, type: string, entity: any) {
  await this.model('IpActivity').create({
    success: flag,
    type: type,
    login: entity.login,
    ip: entity.ip,
    userAgent: entity.userAgent,
    createdAt: new Date()
  });
});



const ipActivityModel = model<IIpActivity & IpActivityModel>("IpActivity", ipActivitySchema, "ip_activities");

export default ipActivityModel;
