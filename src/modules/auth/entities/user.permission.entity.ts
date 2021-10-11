import { Entity } from "../../shared/libraries/entity";

export class  UserPermissionEntity extends Entity {

  _id: string;
  actions: string;
  userId: string;


  constructor(init?: Partial<UserPermissionEntity>) {
    super();
    Object.assign(this, init);

  }


}
