import { model, Schema, Document } from "mongoose";
import { IGroup } from "../interfaces/group.interface";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const userSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" }
});

const groupSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  members: [userSchema]
});
groupSchema.plugin(mongoosePaginate);
const GroupModel = model<IGroup & Document>("AuthGroup", groupSchema, "auth_groups");

export default GroupModel;
