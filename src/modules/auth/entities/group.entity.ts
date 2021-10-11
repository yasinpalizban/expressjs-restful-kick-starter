import { Entity } from "../../shared/libraries/entity";

export class GroupEntity extends Entity {
  _id: string;
  name: string;
  description: string;


  constructor(init?: Partial<GroupEntity>) {
    super();
    Object.assign(this, init);

  }


}
