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
import { useTranslation } from 'react-i18next';

export type EditContractTemplateFormTypes = {
  name: string;
};

const validationSchema = yup
  .object({
    name: yup
      .string()
      .required(`${i18n.t('documents:template.add.form.name.required')}`)
      .min(2, `${i18n.t('documents:template.add.form.name.min', { value: 2 })}`)
      .max(250, `${i18n.t('documents:template.add.form.name.max', { value: 250 })}`),
  })
  .required();

const EditContractTemplate = () => {
  // navigation
  const navigate = useNavigate();
  // template param
  const { id } = useParams();

  const { t } = useTranslation('documents');

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
            useSuccessToast(t('template.edit.form.submit.success'));
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
      <PageHeader onBackButtonPress={navigateBack}>{t('template.edit.heading')}</PageHeader>
      {isEditContractTemplateLoading && isContractTemplateLoading && <LoadingContent />}
      {!isEditContractTemplateLoading && !isContractTemplateLoading && (
        <Card>
          <CardHeader>
            <h2>{t('template.edit.card_header')}</h2>
            <Button
              label={t('general:save')}
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
                      label={t('template.add.form.name.label').toString()}
                      placeholder={`${t('template.add.form.name.placeholder')}`}
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
    </PageLayout>
  );
};

export default EditContractTemplate;
