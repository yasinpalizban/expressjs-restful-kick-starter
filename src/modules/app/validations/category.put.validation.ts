import { IsOptional, IsString } from "class-validator";

export class CategoryPutValidation {

  @IsString() @IsOptional()
  public category: string;
  @IsString() @IsOptional()
  public language: string;


}
