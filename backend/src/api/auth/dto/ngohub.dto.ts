import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IsLinkToken } from './validators';

// What NGO Hub put on /login/ngohub/callback; the web app posts it as it came.
export class NgoHubCallbackDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  code: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  state: string;

  @ApiPropertyOptional({ description: 'RFC 9207 issuer of the response' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  iss?: string;
}

// "It was not us": the link from the email to the other admins.
export class NgoHubRevokeDto {
  @ApiProperty({ description: 'The secret from the emailed link' })
  @IsLinkToken()
  token: string;
}
