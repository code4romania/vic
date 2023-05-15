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
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string; //TODO: check ONGHUb for phone validations if needed

  @IsString()
  @IsNotEmpty()
  cognitoId: string;

  @IsNumber()
  locationId: number;

  @IsDate()
  birthday: Date;

  @IsEnum(SEX)
  sex: SEX;
}
