import { ApiProperty } from '@nestjs/swagger';
import { IsNormalizedEmail } from './validators';

// Shared by both realms (decisions R15): the web resends the NGO confirmation, mobile the sign-up link.
export class ResendVerificationDto {
  @ApiProperty({ example: 'ana@example.ro' })
  @IsNormalizedEmail()
  email: string;
}
