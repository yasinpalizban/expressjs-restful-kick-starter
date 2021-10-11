import faker from "faker";
import { Seeder } from "../../shared/libraries/seeder";
import UserModel from "../models/user.model";
import { AuthEntity } from "../entities/auth.entity";
import GroupModel from "../models/group.model";
import { RoleType } from "../enums/role.type.enum";
import { IUser } from "../interfaces/user.interface";

/*
*  in order to seeder work perfectly out he box
* you need import exact path  avoid using aliases path  for import file
*
*  cmd : npm run seeder --seed=../../auth/seeds/auth.seeder.ts
*  */

export default class AuthSeeder extends Seeder {
  public model = UserModel;
  public groupModel = GroupModel;

//default password is 1234
  async run(): Promise<void> {

    const dataSeeder = new AuthEntity({

      userName: "admin",
      phone: "0918000",
      email: "admin@admin.com",
      password: "$2b$10$urCbSxfTDjo8GTTfD1aDMeqd0wv3oQQz.XE0MJ3oQ7G4MYq..FaIy",
      active: true,
      createdAt: faker.datatype.datetime()
    });

    const authUser:IUser = await this.model.create(dataSeeder);

    const newRole: object = { userId: authUser._id };

    await this.groupModel.findOneAndUpdate({ name: RoleType.Admin }, { $push: { "members": newRole } });

  }

}













