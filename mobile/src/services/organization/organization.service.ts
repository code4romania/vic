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

// #500: asking to rejoin sends a request the organization has to approve; until then the
// organization is not one of the volunteer's organizations.
export const useRejoinOrganizationMutation = () => {
  const { setOrganization } = useStore();
  return useMutation(
    ['rejoin-organization'],
    ({ volunteerId }: { volunteerId: string }) => rejoinOrganization(volunteerId),
    {
      onSuccess: (data: IOrganization) => setOrganization(data),
    },
  );
};
