import { Entity } from "../../shared/libraries/entity";

export class GroupPermissionEntity extends Entity {

  _id: string;
  actions: string;
  groupId: string;


  constructor(init?: Partial<GroupPermissionEntity>) {
    super();
    Object.assign(this, init);

  }


}
