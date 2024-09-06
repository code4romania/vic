import { useMutation, useQuery } from 'react-query';
import { addContractTemplate, getContractTemplate } from './documents-templates.api';

interface IOrganizationData {
  officialName: string;
  registeredOffice: string;
  CUI: string;
  legalRepresentativeName: string;
  legalRepresentativeRole: string;
}

export interface IAddContractTemplatePayload {
  name: string;
  organizationData: IOrganizationData;
  documentTerms: string;
}

export const useAddContractTemplateMutation = () => {
  return useMutation((data: IAddContractTemplatePayload) => addContractTemplate(data), {
    //? do we add a more specific error type like in the contracts?
    onError: (error) => {
      console.log('⭕️ ERROR IN ADD CONTRACT MUTATION ⭕️', error);
      return Promise.resolve(error);
    },
  });
};

export const useContractTemplateQuery = (id: string) => {
  return useQuery({
    queryKey: ['contractTemplate', id],
    queryFn: () => getContractTemplate(id),
    enabled: !!id,
    onError: (error) => {
      console.log('⭕️ ERROR IN GET CONTRACT TEMPLATE QUERY ⭕️', error);
      return Promise.resolve(error);
    },
  });
};
