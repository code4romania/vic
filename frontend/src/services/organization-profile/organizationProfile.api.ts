// import API from '../api';

import { IOrganization } from '../../components/OrganizationProfile';

export const getOrganizationProfile = async (): Promise<IOrganization> => {
  // return API.get(`/organization`).then((res) => res.data);
  return Promise.resolve({
    id: '1',
    name: 'Acme Inc.',
    email: 'acme@example.com',
    phone: '+1 123 456 7890',
    address: '123 Main St., Anytown, USA',
    logo: 'logo.svg',
    description: 'A leading provider of innovative products and services.',
  });
};
