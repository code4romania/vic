import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AuthProvider } from 'src/modules/auth/enums/auth.enums';

export class SocialLoginDto {
  // No Facebook since #512.
  @ApiProperty({ enum: [AuthProvider.GOOGLE, AuthProvider.APPLE] })
  @IsIn([AuthProvider.GOOGLE, AuthProvider.APPLE])
  provider: AuthProvider.GOOGLE | AuthProvider.APPLE;

  @ApiProperty({
    description: 'The Google ID token or the Apple identity token',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8192)
  token: string;

  // App Store 5.1.1(v): Apple's one-time authorization code from the same sign-in, optional. VIC
  // exchanges it for a refresh token and revokes that when the account is deleted. Ignored for Google.
  @ApiProperty({
    required: false,
    description:
      'Apple only: the authorizationCode from the same Sign in with Apple response',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  authorizationCode?: string;
}
