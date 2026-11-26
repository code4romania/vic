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
  // Login with NGO Hub: the "it was not us" link to the other admins when an NGO Hub admin joined by CUI
  NGOHUB_REVOKE = 'ngohub_revoke',
}

export enum AuthTokenForm {
  LINK = 'link',
  CODE = 'code',
}

export enum AuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  // Login with NGO Hub (OIDC) for NGO admins; subject = the NGO Hub user id
  NGOHUB = 'ngohub',
}
