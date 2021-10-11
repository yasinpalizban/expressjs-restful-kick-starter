import { IPagination } from "../../shared/interfaces/pagination";

export interface IPermission {
  _id: string;
  name: string;
  description: string;
  groups: [{
    _id: string;
    actions: string,
    groupId: string
  }];
  users: [{
    _id: string,
    actions: string,
    userId: string
  }];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

}

export interface IPermissionPagination {
  data:IPermission[];
  pagination: IPagination;
}
