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

  // Ignored: the profile takes the login's confirmed email. Optional so the 1.1.0 app can leave it
  // out (it does not know the email of a social login); 1.0.x builds still send it.
  @IsOptional()
  @IsEmail()
  email?: string;

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
