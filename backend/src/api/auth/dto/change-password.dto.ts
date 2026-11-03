import { ApiProperty } from '@nestjs/swagger';
import { IsPasswordInput, IsStrongPassword } from './validators';

// Shared by PATCH /auth/web/change-password and PATCH /mobile/auth/change-password.
export class ChangePasswordDto {
  @ApiProperty()
  @IsPasswordInput()
  currentPassword: string;

  @ApiProperty({ example: 'Volunteer#2026' })
  @IsStrongPassword()
  newPassword: string;
}
