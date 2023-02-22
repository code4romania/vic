import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class UpdateActivityTypeDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
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
