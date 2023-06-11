import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class JoinByAccessCodeDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @IsString()
  @MaxLength(10)
  @MinLength(4)
  code: string;
}
