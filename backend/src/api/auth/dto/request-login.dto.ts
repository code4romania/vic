import { ApiProperty } from '@nestjs/swagger';
import { IsNormalizedEmail, IsSixDigitCode } from './validators';

// VIC 2.0 (#514): the only thing a login asks for is the email.
export class RequestLoginDto {
  @ApiProperty({ example: 'ana@example.ro' })
  @IsNormalizedEmail()
  email: string;
}

export class LoginWithCodeDto {
  @ApiProperty({ example: 'ana@example.ro' })
  @IsNormalizedEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'The code from the email' })
  @IsSixDigitCode()
  code: string;
}
