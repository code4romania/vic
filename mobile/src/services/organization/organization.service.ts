import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import {
  getOrganization,
  getOrganizations,
  leaveOrganization,
  rejoinOrganization,
  switchOrganization,
} from './organization.api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import useStore from '../../store/store';
import { IOrganization } from '../../common/interfaces/organization.interface';
import { getUserProfile } from '../user/user.api';

export const useOrganizationsInfiniteQuery = (orderDirection: OrderDirection, search: string) => {
  return useInfiniteQuery(
    ['organizations', orderDirection, search],
    ({ pageParam }) => getOrganizations({ pageParam, orderDirection, search }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
    },
  );
};

export const useOrganizationQuery = (organizationId: string) => {
  const { setOrganization } = useStore();
  return useQuery(['organization', organizationId], () => getOrganization(organizationId), {
    onSuccess: (data: IOrganization) => {
      setOrganization(data);
    },
    enabled: !!organizationId,
    staleTime: 0,
  });
};

export const useSwitchOrganizationMutation = () => {
  return useMutation(['switch-organization'], ({ organizationId }: { organizationId: string }) =>
    switchOrganization(organizationId),
  );
};

export const useLeaveOrganizationMutation = () => {
  const { setOrganization, setUserProfile } = useStore();
  return useMutation(
    ['leave-organization'],
    ({ volunteerId }: { volunteerId: string }) => leaveOrganization(volunteerId),
    {
      onSuccess: async (data: IOrganization) => {
        // 3. set your organization profile volunteer status to archived
        setOrganization(data);

        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
        } catch (err) {}
      },
    },
  );
};

export const useRejoinOrganizationMutation = () => {
  const { setOrganization } = useStore();
  const { userProfile, setUserProfile } = useStore();
  return useMutation(
    ['rejoin-organization'],
    ({ volunteerId }: { volunteerId: string }) => rejoinOrganization(volunteerId),
    {
      onSuccess: (data: IOrganization, { volunteerId }) => {
        setOrganization(data);
        if (userProfile) {
          const activeOrganization = {
            id: data.id,
            name: data.name,
            logo: data.logo,
            volunteerId,
          };
          setUserProfile({
            ...userProfile,
            activeOrganization,
            myOrganizations: [...userProfile.myOrganizations, activeOrganization],
          });
        }
      },
    },
  );
};
