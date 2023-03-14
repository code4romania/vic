import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { SEX } from 'src/modules/user/enums/user.enum';

export class CreateRegularUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string; //TODO: check ONGHUb for phone validations if needed

  @IsString()
  @IsNotEmpty()
  cognitoId: string;

  @IsDate()
  birthday: Date;

  @IsEnum(SEX)
  sex: SEX;

  @IsNumber()
  locationId: number;
}
