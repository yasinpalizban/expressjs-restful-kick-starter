import { IPagination } from "../../shared/interfaces/pagination";

export interface IPost {
  _id: string;
  title: string;
  body: string;
  userId: string;
  categoryId: string;
  createdAt: Date;
  updateAt: Date;
  medias: string[];
  comments: string[];
  tags: string[];


}
export interface IPostPagination {
  data: IPost[];
  pagination: IPagination;
}
