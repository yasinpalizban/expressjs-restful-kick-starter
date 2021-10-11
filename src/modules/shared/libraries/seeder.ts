process.env["NODE_CONFIG_DIR"] = "./src/core/configs";
import { SeederInterface } from "../interfaces/seeder.interface";
import { connect } from "mongoose";
import { dbConnection } from "../../../core/databases/database.config";

/*
*  in order to seeder work perfectly out he box
* you need import exact path  avoid using aliases path  for import file
*  */
export class Seeder implements SeederInterface {


  constructor() {

    connect(dbConnection.url, dbConnection.options);

  }


  async run(): Promise<void> {

  }

}


