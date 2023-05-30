import React, { useEffect } from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import i18n from '../common/config/i18n';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import { Controller, useForm } from 'react-hook-form';
import Button from '../components/Button';
import * as yup from 'yup';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import FormInput from '../components/FormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import FormLayout from '../layouts/FormLayout';
import {
  useEditContractTemplateMutation,
  useTemplateQuery,
} from '../services/templates/templates.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';
import EmptyContent from '../components/EmptyContent';

export type EditContractTemplateFormTypes = {
  name: string;
};

const validationSchema = yup
  .object({
    name: yup
      .string()
      .required(`${i18n.t('documents:contracts.form.template_name.required')}`)
      .min(2, `${i18n.t('documents:contracts.form.template_name.min', { value: 2 })}`)
      .max(250, `${i18n.t('documents:contracts.form.template_name.max', { value: 250 })}`),
  })
  .required();

const EditContractTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: contractTemplate,
    isLoading: isContractTemplateLoading,
    error: contractTemplateError,
  } = useTemplateQuery(id as string);

  useEffect(() => {
    if (contractTemplateError)
      useErrorToast(
        InternalErrors.TEMPLATE_ERRORS.getError(contractTemplateError.response?.data.code_error),
      );
  }, [contractTemplateError]);

  const { mutateAsync: editContractTemplate, isLoading: isEditContractTemplateLoading } =
    useEditContractTemplateMutation();

  const navigateBack = () => navigate('/documents/contracts', { replace: true });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditContractTemplateFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = (data: EditContractTemplateFormTypes) => {
    if (contractTemplate) {
      editContractTemplate(
        { id: contractTemplate?.id, data },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('documents:contracts.form.submit.messages.edit'));
            navigateBack();
          },
          onError: (error) => {
            useErrorToast(InternalErrors.TEMPLATE_ERRORS.getError(error.response?.data.code_error));
          },
        },
      );
    }
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:edit', { item: '' })}
      </PageHeader>
      {isEditContractTemplateLoading && isContractTemplateLoading && <LoadingContent />}
      {!isEditContractTemplateLoading && !isContractTemplateLoading && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('documents:contracts.template')}</h2>
            <Button
              label={i18n.t('general:save')}
              className="btn-primary"
              icon={<CloudArrowUpIcon className="h-5 w-5 sm:hidden" />}
              onClick={handleSubmit(onSubmit)}
            />
          </CardHeader>
          <CardBody>
            <FormLayout>
              <Controller
                key="name"
                name="name"
                control={control}
                defaultValue={contractTemplate?.name}
                render={({ field: { onChange, value } }) => {
                  return (
                    <FormInput
                      type="text"
                      readOnly={false}
                      value={value}
                      errorMessage={errors['name']?.message as string}
                      label={i18n.t('documents:contracts.form.template_name.label').toString()}
                      placeholder={`${i18n.t(
                        'documents:contracts.form.template_name.placeholder',
                      )}`}
                      onChange={onChange}
                      id="edit-contract-template-form__name"
                    />
                  );
                }}
              />
            </FormLayout>
          </CardBody>
        </Card>
      )}
      {!contractTemplate && !isContractTemplateLoading && !isEditContractTemplateLoading && (
        <EmptyContent description={i18n.t('general:error.load_entries')} />
      )}
    </PageLayout>
  );
};

export default EditContractTemplate;
