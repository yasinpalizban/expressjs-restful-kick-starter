import { IPagination } from "../../shared/interfaces/pagination";

export interface IGroup {
  _id: string;
  name: string;
  description: string;
  members: [{ _id: string, userId: string }];

}

export interface IGroupPagination {
  data:IGroup[];
  pagination: IPagination;
}
