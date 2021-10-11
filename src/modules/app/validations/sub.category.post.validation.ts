import { IsString} from 'class-validator';

export class SubCategoryPostValidation {

  @IsString()
  public subCategory: string;


}
