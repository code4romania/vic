export interface SocialIdentity {
  subject: string; // the provider's stable user id
  email: string;
  emailVerified: boolean;
}

export interface SocialTokenVerifier {
  // Throws AUTH_013 for anything that is not a valid token for VIC.
  verify(token: string): Promise<SocialIdentity>;
}
