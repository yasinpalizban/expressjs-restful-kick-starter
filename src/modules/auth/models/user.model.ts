import { model, Schema, Document } from "mongoose";
import { IUser } from "../interfaces/user.interface";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

// userName: {type: String, required: : function() { return this.userName. === 'user'; }, unique: true},
//{ type: String, enum: ["admin", "coworker", "blogger", "member"], default: "member" }

const userSchema: Schema = new Schema({
  userName: { type: String, required: true, unique: true },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  address: String,
  country: String,
  city: String,
  image: { type: String, default: "public/upload/profile/default-avatar.jpg" },
  gender: String,
  active: { type: Boolean, default: false },
  activeToken: String,
  activeExpires: Date,
  status: { type: Boolean, default: false },
  statusMessage: String,
  resetToken: String,
  resetExpires: Date,
  resetAt: Date,
  socialMedia: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  deletedAt: Date
});
userSchema.plugin(mongoosePaginate);
const UserModel = model<IUser & Document>("User", userSchema, "users");

export default UserModel;
