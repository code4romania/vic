import React, { useEffect, useState } from 'react';
import { IActiveOrganization, OrganizationContext } from './OrganizationContext';
import { useAuth } from '../../hooks/useAuth';

const OrganizationContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeOrganization, setActiveOrganization] = useState<IActiveOrganization | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.activeOrganization) {
      console.log('active organization', userProfile?.activeOrganization);
    } else {
      console.log('no active organization');
    }
  }, [userProfile]);

  return (
    <OrganizationContext.Provider value={{ activeOrganization, setActiveOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContextProvider;
