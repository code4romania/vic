import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { IsNormalizedEmail, IsSixDigitCode } from 'src/api/auth/dto/validators';
import { SensitiveAction } from 'src/usecases/security/sensitive-action.usecase';

export class RequestSensitiveCodeDto {
  @ApiProperty({ enum: SensitiveAction })
  @IsEnum(SensitiveAction)
  action: SensitiveAction;
}

export class RequestEmailChangeDto {
  @ApiProperty({ example: 'ana.noua@exemplu.ro' })
  @IsNormalizedEmail()
  newEmail: string;
}

export class ConfirmEmailChangeDto {
  @ApiProperty({ description: 'The code sent to the current address' })
  @IsSixDigitCode()
  code: string;

  @ApiProperty({ description: 'The code sent to the new address' })
  @IsSixDigitCode()
  newEmailCode: string;
}

export class DeleteOrganizationDto {
  @ApiProperty({ description: "The organization's name, typed" })
  @IsString()
  @MaxLength(300)
  confirmation: string;

  @ApiProperty()
  @IsSixDigitCode()
  code: string;
}
