import faker from "faker";
import { Seeder } from "../../shared/libraries/seeder";
import PermissionModel from "../models/permission.model";
import { PermissionEntity } from "../entities/permission.entity";
import { PermissionType } from "../enums/permission.type.enum";


/*
*  in order to seeder work perfectly out he box
* you need import exact path  avoid using aliases path  for import file
*
*  cmd : npm run seeder --seed=../../auth/seeds/permission.seeder.ts
*  */

export default class PermissionSeeder extends Seeder {
  public model = PermissionModel;

  async run(): Promise<void> {

    const defaultPermission: string = "-" + PermissionType.Get + "-" + PermissionType.Post + "-" + PermissionType.Put + "-" + PermissionType.Delete;

    const dataSeeder = [
      new PermissionEntity({
        name: "user",
        description: "users manage controller",
        active:false
      }),
      new PermissionEntity({
        name: "setting",
        description: "setting manage controller",
        active:false
      })
    ];

    await this.model.create(dataSeeder);

  }

}













