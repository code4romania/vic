import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AuthRealm, AuthTokenType } from 'src/modules/auth/enums/auth.enums';

export enum TokenPurpose {
  TRANSITION = 'transition', // the invite the cutover script sent: no sent_by (decisions R16)
  INVITE = 'invite',
  RESET = 'reset',
  VERIFY_EMAIL = 'verify_email',
}

export interface ITokenInfo {
  type: AuthTokenType;
  purpose: TokenPurpose;
  realm: AuthRealm;
  maskedEmail: string;
  organizationName?: string;
}

export class TokenInfoPresenter {
  constructor(info: ITokenInfo) {
    this.type = info.type;
    this.purpose = info.purpose;
    this.realm = info.realm;
    this.maskedEmail = info.maskedEmail;
    if (info.organizationName) {
      this.organizationName = info.organizationName;
    }
  }

  @Expose()
  @ApiProperty({ enum: AuthTokenType })
  type: AuthTokenType;

  @Expose()
  @ApiProperty({
    enum: TokenPurpose,
    description: 'What the set-password page says',
  })
  purpose: TokenPurpose;

  @Expose()
  @ApiProperty({ enum: AuthRealm })
  realm: AuthRealm;

  @Expose()
  @ApiProperty({ example: 'a•••@example.ro' })
  maskedEmail: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Invites only' })
  organizationName?: string;
}
