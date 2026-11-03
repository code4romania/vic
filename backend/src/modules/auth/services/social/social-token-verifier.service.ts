import { Injectable } from '@nestjs/common';
import { AuthProvider } from '../../enums/auth.enums';
import { AuthException, AuthExceptionCodes } from '../../exceptions/exceptions';
import { AppleTokenVerifier } from './apple.verifier';
import { FacebookTokenVerifier } from './facebook.verifier';
import { GoogleTokenVerifier } from './google.verifier';
import { SocialIdentity } from './social-identity';

// Never logs the token.
@Injectable()
export class SocialTokenVerifierService {
  constructor(
    private readonly google: GoogleTokenVerifier,
    private readonly apple: AppleTokenVerifier,
    private readonly facebook: FacebookTokenVerifier,
  ) {}

  async verify(provider: AuthProvider, token: string): Promise<SocialIdentity> {
    switch (provider) {
      case AuthProvider.GOOGLE:
        return this.google.verify(token);
      case AuthProvider.APPLE:
        return this.apple.verify(token);
      case AuthProvider.FACEBOOK:
        return this.facebook.verify(token);
      default:
        throw new AuthException(AuthExceptionCodes.AUTH_013);
    }
  }
}
