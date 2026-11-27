// The `organization` claim NGO Hub returns at /oidc/me (NGO Hub plan 3.2). Only the fields VIC uses
// are typed; NGO Hub may send more. The logo URL is presigned and expires.
export interface NgoHubOrganizationClaim {
  id: number;
  cui: string;
  name: string;
  role: 'admin' | 'employee' | string;
  email: string;
  phone: string;
  address: string | null;
  county: { id: number; name: string } | null;
  city: { id: number; name: string } | null;
  short_description: string | null;
  website: string | null;
  logo_url: string | null;
  logo_url_expires_at: string | null;
}

// Who logged in through NGO Hub, after every check of the callback passed.
export interface NgoHubProfile {
  subject: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  organization?: NgoHubOrganizationClaim;
}

export interface NgoHubFlowStart {
  url: string;
  flowCookie: string;
  flowTtlSeconds: number;
}
