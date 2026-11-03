import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  IsNormalizedEmail,
  IsStrongPassword,
} from 'src/api/auth/dto/validators';

export class RegisterDto {
  @ApiProperty({ example: 'elena@example.ro' })
  @IsNormalizedEmail()
  email: string;

  @ApiProperty({ example: 'Volunteer#2026' })
  @IsStrongPassword()
  password: string;

  // Same rule as CreateRegularUserDto; kept so CreateUser can prefill it.
  @ApiProperty({ example: '+40720000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;
}
