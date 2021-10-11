import { IPagination } from "../../shared/interfaces/pagination";

export interface ICategory {
  _id: string;
  category: string;
  language: string;
  subCategory: string[];


}

export interface ICategoryPagination {
  data: ICategory[];
  pagination: IPagination;
}
