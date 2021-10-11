import { model, Schema, Model, Document } from "mongoose";
import { ISetting } from "../interfaces/setting.interface";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const settingSchema = new Schema({

  key: { type: String, required: true, unique: true },
  value: String,
  description: String,
  status: Boolean,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date


});

settingSchema.plugin(mongoosePaginate);
export const SettingModel = model<ISetting & Document>("Setting", settingSchema, "settings");
