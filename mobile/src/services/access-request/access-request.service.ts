import { useMutation } from 'react-query';
import { createAccessRequest } from './access-request.api';
import useStore from '../../store/store';

interface IQuenstionAnswer {
  question: string;
  answer: string;
}

export interface ICreateAccessRequestPayload {
  answers: IQuenstionAnswer[];
  organizationId: string;
}

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
