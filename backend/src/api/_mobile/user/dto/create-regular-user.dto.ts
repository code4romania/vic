import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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

  @IsNumber()
  @IsOptional()
  locationId: number;

  @IsDate()
  @IsOptional()
  birthday: Date;

  @IsEnum(SEX)
  @IsOptional()
  sex: SEX;
}
