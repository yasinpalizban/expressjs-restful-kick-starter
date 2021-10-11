import { UrlQueryParam } from "../libraries/url.query.param";

export declare interface ServiceInterface {

  index?(urlQueryParam?: UrlQueryParam): Promise<any[] | any>;

  show?(id: string): Promise<any>;

  create?(data: any): Promise<void | any>;

  update?(id: string, data: any): Promise<void | any>;

  delete?(id: string, foreignKey?: string): Promise<void>;

}


