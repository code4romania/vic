import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateVolunteerProfileDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsDate()
  @IsOptional()
  activeSince: Date;

  @IsUUID()
  @IsOptional()
  branchId: string;

  @IsUUID()
  @IsOptional()
  departmentId: string;

  @IsUUID()
  @IsOptional()
  roleId: string;
}
