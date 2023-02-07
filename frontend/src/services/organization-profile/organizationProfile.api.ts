// import API from '../api';

import { IOrganization } from '../../components/OrganizationProfile';

export const getOrganizationProfile = async (): Promise<IOrganization> => {
  // return API.get(`/organization`).then((res) => res.data);
  return Promise.resolve({
    id: '123719231',
    logo: 'sdasdasd',
    email: 'contact@zen.ro',
    name: 'Asociatia ZEN',
    phone: '0721212121',
    description:
      'Descrierea organizației este afișată în profilul organizației din aplicația TEO. Poti alege sa formulezi o descriere specifica pentru aplicatia TEO, prin care sa atragi cat mai multi voluntari, sau sa folosesti descrierea organizatiei asa cum se regaseste in ONGHub. ',
    address: 'Str Galbena, nr 129, ap 20, Iași, jud Iași',
  });
};
