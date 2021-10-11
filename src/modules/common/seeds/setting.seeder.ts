import faker from "faker";
import { Seeder } from "../../shared/libraries/seeder";
import { SettingModel } from "../models/setting.model";
import { SettingEntity } from "../entities/setting.entity";


/*
*  in order to seeder work perfectly out he box
* you need import exact path  avoid using aliases path  for import file
*
*  cmd : npm run seeder --seed=../../common/seeds/setting.seeder.ts
*  */

export default  class SettingSeeder extends Seeder {
  public model = SettingModel;

  async run(): Promise<void> {

    const dataSeeder = new SettingEntity({
      key: faker.internet.userName(),
      value: faker.address.city(),
      description: faker.address.streetAddress(),
      status: faker.datatype.boolean(),
      createdAt: faker.datatype.datetime()
    });
    await this.model.create(dataSeeder);

  }


}











