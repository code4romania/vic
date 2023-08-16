import { useMutation, useQuery } from 'react-query';
import {
  cancelAccessRequest,
  createAccessRequest,
  getRejectedAccessRequest,
} from './access-request.api';
import useStore from '../../store/store';

interface IQuenstionAnswer {
  question: string;
  answer: string;
}

export interface ICreateAccessRequestPayload {
  answers: IQuenstionAnswer[];
  organizationId: string;
}

export const useRejectedAccessRequest = (accessRequestId: string) => {
  return useQuery(
    ['access-request', accessRequestId],
    () => getRejectedAccessRequest(accessRequestId),
    {
      enabled: !!accessRequestId,
    },
  );
};

export const useCreateAccessrequestMutation = () => {
  const { setOrganizationPending } = useStore();
  return useMutation(
    ['access-request'],
    (request: ICreateAccessRequestPayload) => createAccessRequest(request),
    {
      onSuccess: () => {
        setOrganizationPending();
      },
    },
  );
};

export const useCancelAccessRequestMutation = () => {
  const { resetOrganizationVolunteerStatus } = useStore();
  return useMutation(
    ['cancel-access-request'],
    ({ organizationId }: { organizationId: string }) => cancelAccessRequest(organizationId),
    {
      onSuccess: () => {
        resetOrganizationVolunteerStatus();
      },
    },
  );
};
