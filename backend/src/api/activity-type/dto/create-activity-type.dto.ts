import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateActivityTypeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  icon: string;

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
