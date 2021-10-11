import { model, Schema, Document } from "mongoose";
import { IPermission } from "../interfaces/permission.interface";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const userPermission: Schema = new Schema({
  actions: String,
  userId: { type: Schema.Types.ObjectId, ref: "User" }
});

const groupPermission: Schema = new Schema({

  actions: String,
  groupId: { type: Schema.Types.ObjectId, ref: "Group" }
});

const permissionSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  active: { type: Boolean, default: false },
  users: [userPermission],
  groups: [groupPermission],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  deletedAt: Date
});

permissionSchema.plugin(mongoosePaginate);
const PermissionModel = model<IPermission & Document>("AuthPermission", permissionSchema, "auth_permissions");

export default PermissionModel;
