import { IsString} from 'class-validator';

export class SubCategoryPutValidation {

  @IsString()
  public subCategory: string;


}
