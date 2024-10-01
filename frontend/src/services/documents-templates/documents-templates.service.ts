import { useMutation, useQuery } from 'react-query';
import {
  addContractTemplate,
  deleteContractTemplate,
  getContractTemplate,
  getTemplateById,
  getTemplates,
  updateContractTemplate,
} from './documents-templates.api';
import { AxiosError } from 'axios';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { CONTRACT_ERRORS } from '../../common/errors/entities/contract.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { IOrganizationData } from '../../common/interfaces/template.interface';

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

export const useUpdateContractTemplateMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: IAddContractTemplatePayload }) =>
      updateContractTemplate(id, data),
    {
      onError: (error) => {
        console.log('⭕️ ERROR IN UPDATE CONTRACT MUTATION ⭕️', error);
        return Promise.resolve(error);
      },
    },
  );
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

export const useDocumentTemplatesQuery = ({
  limit,
  page,
  orderBy,
  orderDirection,
  search,
}: {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  search?: string;
}) => {
  return useQuery(
    ['document-templates', limit, page, orderBy, orderDirection, search],
    () =>
      getTemplates({
        limit,
        page,
        orderBy,
        orderDirection,
        search,
      }),
    {
      onError: (error: AxiosError<IBusinessException<CONTRACT_ERRORS>>) => error,
    },
  );
};

export const useDocumentTemplateByIdQuery = (id?: string) => {
  return useQuery({
    queryKey: ['document-template', id],
    queryFn: () => getTemplateById(id),
    enabled: !!id,
  });
};

export const useDeleteDocumentTemplateMutation = () => {
  return useMutation((id: string) => deleteContractTemplate(id), {
    onError: (error) => {
      console.log('⭕️ ERROR IN DELETE DOCUMENT TEMPLATE MUTATION ⭕️', error);
      return Promise.resolve(error);
    },
  });
};
