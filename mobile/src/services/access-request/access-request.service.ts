import { useMutation } from 'react-query';
import { createAccessRequest } from './access-request.api';

interface IQuenstionAnswer {
  question: string;
  answer: string;
}

export interface ICreateAccessRequestPayload {
  answers: IQuenstionAnswer[];
  organizationId: string;
}

export const useCreateAccessrequestMutation = () => {
  return useMutation(['access-request'], (request: ICreateAccessRequestPayload) =>
    createAccessRequest(request),
  );
};
