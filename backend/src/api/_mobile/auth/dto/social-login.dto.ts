import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AuthProvider } from 'src/modules/auth/enums/auth.enums';

export class SocialLoginDto {
  @ApiProperty({ enum: AuthProvider })
  @IsEnum(AuthProvider)
  provider: AuthProvider;

  @ApiProperty({
    description:
      'Google and Apple: the identity token; Facebook: the access token',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8192)
  token: string;
}
