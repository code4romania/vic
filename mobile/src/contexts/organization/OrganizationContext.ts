/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';

export interface IActiveOrganization {
  id: string;
  name: string;
  logo?: string;
  volunteerId: string;
}

interface OrganizationContextProps {
  activeOrganization: IActiveOrganization | null;
  setActiveOrganization: (activeOrganization: IActiveOrganization) => void;
}

export const OrganizationContext = createContext<OrganizationContextProps>({
  activeOrganization: null,
  setActiveOrganization: (activeOrganization: IActiveOrganization) => {},
});
