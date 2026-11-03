export enum AuthRealm {
  WEB = 'web',
  MOBILE = 'mobile',
}

export enum AuthIdentityStatus {
  PENDING_PASSWORD = 'pending_password',
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum AuthTokenType {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
  INVITE = 'invite',
}

export enum AuthTokenForm {
  LINK = 'link',
  CODE = 'code',
}

export enum AuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}
