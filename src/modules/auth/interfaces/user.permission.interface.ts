import { IPagination } from "../../shared/interfaces/pagination";

export interface IUserPermission {

  _id: string;
  actions: string;
  userId: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  permission?:string;
  permissionId?:string;


}

export interface IUserPermissionPagination {
  data: IUserPermission[];
  pagination: IPagination;
}
