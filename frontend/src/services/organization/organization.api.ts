import API from '../api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import { IAccessCode } from '../../pages/AccesCodes';
import { AccessCodeFormTypes } from '../../components/AccessCodeForm';
import {
  IMaskedEmail,
  IOrganization,
  IOrganizationFields,
  IOrganizationFiles,
  IRegisterOrganization,
} from '../../common/interfaces/organization.interface';

export const getOrganization = async (): Promise<IOrganization> => {
  return API.get(`/organization`).then((res) => res.data);
};

const appendFiles = (formData: FormData, files?: IOrganizationFiles): FormData => {
  if (files?.logo) formData.append('logo', files.logo);
  return formData;
};

const toFormData = (fields: Record<string, string | boolean>): FormData => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, String(value)));
  return formData;
};

// The profile fields plus an optional new logo. An empty field means "unchanged" (backend
// UpdateOrganizationDto).
export const updateOrganization = async (
  data: IOrganizationFields,
  files?: IOrganizationFiles,
): Promise<IOrganization> => {
  return API.patch(`/organization`, appendFiles(toFormData({ ...data }), files), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

// Public: the NGO (#469: name, CUI, email, phone), its first admin and the Turnstile token.
export const registerOrganization = async (
  data: IRegisterOrganization,
  files: IOrganizationFiles,
): Promise<IMaskedEmail> => {
  return API.post('/organizations/register', appendFiles(toFormData({ ...data }), files), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const getAccessCodes = async (
  limit: number,
  page: number,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IAccessCode>> => {
  return API.get('access-code', { params: { limit, page, orderBy, orderDirection } }).then(
    (res) => res.data,
  );
};

export const getAccessCode = async (id: string): Promise<IAccessCode> => {
  return API.get(`access-code/${id}`).then((res) => res.data);
};

export const createAccessCode = async (accessCode: AccessCodeFormTypes): Promise<IAccessCode> => {
  return API.post('access-code', accessCode).then((res) => res.data);
};

export const updateAccessCode = async (id: string, endDate?: Date | null): Promise<IAccessCode> => {
  return API.patch(`access-code/${id}`, { endDate }).then((res) => res.data);
};

export const deleteAccessCode = async (id: string): Promise<string> => {
  return API.delete(`access-code/${id}`).then((res) => res.data);
};
