export interface UrlQueryParamInterface {

  getPipeLine(defaultPipeline?: AggregatePipeLine[]): AggregatePipeLine[];

  subDocumentPagination(): void;

  encodeQueryParam(key: string, value: string, fun: string, sign: string): string;

  decodeQueryParam(): this;
  resetPipeLine(): this
}

export interface QueryUrl {
  limit?: number;
  range?: string;
  page?: number;
  filed?: string;
  q?: string | object;
  order?: number;
  sort?: string;

}

export interface AggregatePipeLine {
  $sort?: object;
  $project?: object | any;
  $match?: object | any;
  $elemMatch?: object | any;
  $group?: object;
  $limit?: number;
  $page?: number;
  $skip?: number;
  $unwind?: any;
  $replaceRoot?: object | any;
  $addFields?: object | any;
  $lookup?: object | any;
  $unionWith?: any | object;
  $merge?: any | object;
  $set?:any|object;

}

export interface IOptionPagination {
  limit: number;
  page: number;
}

export interface ISearch {
  sgn?: string | string[] | null | undefined;
  val: number | string | string[] | number[] | undefined;
  fun: string | undefined;
  subDoc?: string | null | undefined;
  jin?: string | null | undefined;
}
