import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SessionTokens } from 'src/modules/auth/services/session.service';
import { AdminProfilePresenter } from './admin-profile.presenter';

// The web gets the refresh token as the vic_refresh cookie, never in the body; mobile gets it in the body.
export class SessionPresenter {
  constructor(
    tokens: SessionTokens,
    options: { includeRefreshToken: boolean; user?: AdminProfilePresenter },
  ) {
    this.accessToken = tokens.accessToken;
    this.expiresIn = tokens.expiresIn;
    if (options.includeRefreshToken && tokens.refreshToken) {
      this.refreshToken = tokens.refreshToken;
    }
    if (options.user) {
      this.user = options.user;
    }
  }

  @Expose()
  @ApiProperty({ description: 'RS256 JWT, sent as Bearer' })
  accessToken: string;

  @Expose()
  @ApiProperty({
    description: 'Access token lifetime in seconds',
    example: 900,
  })
  expiresIn: number;

  @Expose()
  @ApiPropertyOptional({
    description:
      'Mobile only. Absent after two refreshes crossed: keep the refresh token you have.',
  })
  refreshToken?: string;

  @Expose()
  @ApiPropertyOptional({
    type: AdminProfilePresenter,
    description: 'Web login only',
  })
  user?: AdminProfilePresenter;
}
