import { IPagination } from "./../../shared/interfaces/pagination";

export interface ISetting {
  _id: string;
  key: string;
  value: string;
  description: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

}

export interface ISettingPagination {
  data: ISetting[];
  pagination: IPagination;
}

