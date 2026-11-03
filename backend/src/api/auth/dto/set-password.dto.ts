import { ApiProperty } from '@nestjs/swagger';
import { IsLinkToken, IsStrongPassword } from './validators';

// Transition, reset and invite links, both realms.
export class SetPasswordDto {
  @ApiProperty({ description: 'The secret from the emailed link' })
  @IsLinkToken()
  token: string;

  @ApiProperty({ example: 'Volunteer#2026' })
  @IsStrongPassword()
  password: string;
}
