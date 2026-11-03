import { ApiProperty } from '@nestjs/swagger';
import { IsLinkToken } from './validators';

export class ConfirmEmailDto {
  @ApiProperty({ description: 'The secret from the emailed link' })
  @IsLinkToken()
  token: string;
}
