import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SEX } from 'src/modules/user/enums/user.enum';

export class CreateRegularUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
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
