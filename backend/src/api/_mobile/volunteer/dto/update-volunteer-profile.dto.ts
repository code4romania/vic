import { IsDate, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateVolunteerProfileDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
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
