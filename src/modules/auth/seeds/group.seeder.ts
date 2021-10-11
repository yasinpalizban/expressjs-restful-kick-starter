import { Seeder } from "../../shared/libraries/seeder";
import GroupModel from "../models/group.model";
import { GroupEntity } from "../entities/group.entity";

/*
*  in order to seeder work perfectly out he box
* you need import exact path  avoid using aliases path  for import file
*
*  cmd : npm run seeder --seed=../../auth/seeds/group.seeder.ts
*  */

export default class GroupSeeder extends Seeder {
  public model = GroupModel;

  async run(): Promise<void> {

    const dataSeeder = [
      new GroupEntity({ name: "admin", description: "admins" }),
      new GroupEntity({ name: "coworker", description: "co workers" }),
      new GroupEntity({ name: "blogger", description: "bloggers" }),
      new GroupEntity({ name: "member", description: "members" })
    ];

    await this.model.create(dataSeeder);

  }

}













