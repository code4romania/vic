import { useMutation, useQuery } from 'react-query';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { addContractTemplate, getTemplates } from './templates.api';
import { AxiosError } from 'axios';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { TEMPLATE_ERRORS } from '../../common/errors/entities/template.errors';
import { AddContractTemplateFormTypes } from '../../pages/AddContractTemplate';

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
    [limit, page, orderBy, orderDirection],
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
