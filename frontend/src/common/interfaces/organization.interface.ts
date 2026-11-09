export type OrganizationStatus = 'pending' | 'active' | 'suspended';

export interface IOrganization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  activityArea: string;
  logo: string;
  description: string;
  status: OrganizationStatus;
  // Null until a super admin validates the NGO: no campaigns, no visibility to volunteers (decision 1).
  validatedAt: string | null;
  taxId: string;
  website: string | null;
  // A presigned link, valid for a day.
  statuteUrl: string | null;
}

// The organization fields shared by registration and the edit form (backend organization-fields.ts).
export interface IOrganizationFields {
  name: string;
  email: string;
  phone: string;
  address: string;
  activityArea: string;
  description: string;
  website: string;
  taxId: string;
}

export interface IOrganizationFiles {
  logo?: File | null;
  statute?: File | null;
}

export interface IRegisterOrganization extends IOrganizationFields {
  firstName: string;
  lastName: string;
  adminEmail: string;
  adminPhone: string;
  acceptedTerms: boolean;
  turnstileToken: string;
}

export interface IMaskedEmail {
  maskedEmail: string;
}

// GET /admin/organizations/pending-validation
export interface IPendingOrganization {
  id: string;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  activityArea: string;
  description: string;
  website: string | null;
  logo: string | null;
  statuteUrl: string;
  registeredOn: string;
  firstAdmin: { id: string; name: string; email: string; phone: string } | null;
}
