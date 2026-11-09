export type OrganizationStatus = 'pending' | 'active' | 'suspended';

export interface IOrganization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  logo: string;
  description: string | null;
  status: OrganizationStatus;
  // Null until a super admin validates the NGO: no campaigns, no visibility to volunteers (decision 1).
  validatedAt: string | null;
  taxId: string;
  website: string | null;
}

// The organization fields shared by registration and the edit form (backend organization-fields.ts).
// #469: registration asks only for name, CUI, email and phone; the rest is optional and filled in later.
export interface IOrganizationFields {
  name: string;
  email: string;
  phone: string;
  taxId: string;
  address?: string;
  website?: string;
  description?: string;
}

export interface IOrganizationFiles {
  logo?: File | null;
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
  address: string | null;
  description: string | null;
  website: string | null;
  logo: string | null;
  registeredOn: string;
  firstAdmin: { id: string; name: string; email: string; phone: string } | null;
}
