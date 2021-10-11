import faker from "faker";
import { Seeder } from "../../shared/libraries/seeder";
import UserModel from "../../auth/models/user.model";
import { UserEntity } from "../entities/user.entity";
import { RoleType } from "../../auth/enums/role.type.enum";
import { IUser } from "../../auth/interfaces/user.interface";
import GroupModel from "../../auth/models/group.model";

/*
*  in order to seeder work perfectly out he box
* you need import exact path  avoid using aliases path  for import file
*
*  cmd : npm run seeder --seed=../../common/seeds/user.seeder.ts
*  */

export default class UserSeeder extends Seeder {
  public model = UserModel;
  public groupModel = GroupModel;


  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

//default password is 1234
  async run(): Promise<void> {

    const randomRole: string = Object.values(RoleType)[this.getRandomInt(Object.values(RoleType).length)];

    const dataSeeder = new UserEntity({
      userName: faker.internet.userName(),
      phone: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      password: "$2b$10$urCbSxfTDjo8GTTfD1aDMeqd0wv3oQQz.XE0MJ3oQ7G4MYq..FaIy",
      lastName: faker.name.findName(),
      firstName: faker.name.lastName(),
      gender: faker.name.gender(),

      city: faker.address.city(),
      country: faker.address.country(),
      address: faker.address.streetAddress(),

      active: faker.datatype.boolean(),
      status: faker.datatype.boolean(),
      createdAt: faker.datatype.datetime()
    });

    const newUser: IUser = await this.model.create(dataSeeder);

    const newRole: object = { userId: newUser._id };

    if (false)
      await this.groupModel.findOneAndUpdate({ name: randomRole }, { $push: { "members": newRole } });
    else
      await this.groupModel.findOneAndUpdate({ name: RoleType.Member }, { $push: { "members": newRole } });

  }


}











