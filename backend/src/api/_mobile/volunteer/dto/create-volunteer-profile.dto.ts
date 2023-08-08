import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateVolunteerProfileDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

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
