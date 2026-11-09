export enum AuthRealm {
  WEB = 'web',
  MOBILE = 'mobile',
}

// VIC 2.0 (#514): no passwords. PENDING = never logged in yet (invited, or created by the
// cutover); it becomes ACTIVE at the first login.
export enum AuthIdentityStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum AuthTokenType {
  VERIFY_EMAIL = 'verify_email',
  // Magic link (web) or 6-digit code (mobile) to log in (VIC 2.0, #514)
  LOGIN = 'login',
  INVITE = 'invite',
  // #508: a 6-digit code to the admin's email before a sensitive action (change email, delete the
  // NGO, add an admin), and the code that confirms a new email address
  SENSITIVE_ACTION = 'sensitive_action',
  CHANGE_EMAIL = 'change_email',
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
