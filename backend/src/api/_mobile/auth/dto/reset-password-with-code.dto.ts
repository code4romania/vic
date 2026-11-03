import { ApiProperty } from '@nestjs/swagger';
import {
  IsNormalizedEmail,
  IsSixDigitCode,
  IsStrongPassword,
} from 'src/api/auth/dto/validators';

export class ResetPasswordWithCodeDto {
  @ApiProperty({ example: 'elena@example.ro' })
  @IsNormalizedEmail()
  email: string;

  @ApiProperty({ example: '012345' })
  @IsSixDigitCode()
  code: string;

  @ApiProperty({ example: 'Volunteer#2026' })
  @IsStrongPassword()
  password: string;
}
