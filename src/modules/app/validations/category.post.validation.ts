import { IsString} from 'class-validator';

export class CategoryPostValidation {

  @IsString()
  public category: string;
  @IsString()
  public language: string;


}
