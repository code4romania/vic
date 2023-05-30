import { useMutation, useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import {
  addContractTemplate,
  editContractTemplate,
  getTemplate,
  getTemplates,
} from './templates.api';
import { AxiosError } from 'axios';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { TEMPLATE_ERRORS } from '../../common/errors/entities/template.errors';
import { AddContractTemplateFormTypes } from '../../pages/AddContractTemplate';
import { EditContractTemplateFormTypes } from '../../pages/EditContractTemplate';

export const useTemplateQuery = (id: string) =>
  useQuery(['contract-template', id], () => getTemplate(id), {
    enabled: !!id,
    onError: (error: AxiosError<IBusinessException<TEMPLATE_ERRORS>>) => error,
  });

export const useTemplatesQuery = ({
  limit,
  page,
  orderBy,
  orderDirection,
}: {
  limit: number;
  page: number;
  orderBy?: string;
  orderDirection: OrderDirection;
}) =>
  useQuery(
    ['contracts-templates', limit, page, orderBy, orderDirection],
    () => getTemplates({ limit, page, orderBy, orderDirection }),
    {
      onError: (error: AxiosError<IBusinessException<TEMPLATE_ERRORS>>) => error,
    },
  );

export const useAddContractTemplateMutation = () => {
  return useMutation((payload: AddContractTemplateFormTypes) => addContractTemplate(payload), {
    onError: (error: AxiosError<IBusinessException<TEMPLATE_ERRORS>>) => Promise.resolve(error),
  });
};

export const useEditContractTemplateMutation = () => {
  return useMutation(
    ({ id, data }: { id: string; data: EditContractTemplateFormTypes }) =>
      editContractTemplate(id, data),
    {
      onError: (error: AxiosError<IBusinessException<TEMPLATE_ERRORS>>) => Promise.resolve(error),
    },
  );
};
