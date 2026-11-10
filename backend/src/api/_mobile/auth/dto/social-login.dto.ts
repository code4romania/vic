import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
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
}
