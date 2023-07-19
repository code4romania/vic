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
  const { setOrganization } = useStore();
  return useMutation(
    ['leave-organization'],
    ({ volunteerId }: { volunteerId: string }) => leaveOrganization(volunteerId),
    {
      onSuccess: (data: IOrganization) => {
        // 3. set your organization profile volunteer status to archived
        setOrganization(data);
      },
    },
  );
};

export const useRejoinOrganizationMutation = () => {
  const { setOrganization } = useStore();
  return useMutation(
    ['rejoin-organization'],
    ({ volunteerId }: { volunteerId: string }) => rejoinOrganization(volunteerId),
    {
      onSuccess: (data: IOrganization) => {
        setOrganization(data);
      },
    },
  );
};
