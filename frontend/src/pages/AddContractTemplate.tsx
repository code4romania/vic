import React from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
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
import { useCreateTemplateMutation } from '../services/templates/templates.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';
import { useTranslation } from 'react-i18next';
import i18n from '../common/config/i18n';
import FileUpload from '../components/FileUpload';

export type AddContractTemplateFormTypes = {
  name: string;
  template: File;
};

const validationSchema = yup
  .object({
    name: yup
      .string()
      .required(`${i18n.t('documents:template.add.form.name.required')}`)
      .min(2, `${i18n.t('documents:template.add.form.name.min', { value: 2 })}`)
      .max(250, `${i18n.t('documents:template.add.form.name.max', { value: 250 })}`),
    template: yup.mixed().required(`${i18n.t('documents:template.add.form.contract.required')}`),
  })
  .required();

const AddContractTemplate = () => {
  const navigate = useNavigate();

  const { t } = useTranslation('documents');

  const { mutateAsync: addContractTemplate, isLoading: isAddingContractTemplate } =
    useCreateTemplateMutation();

  const navigateBack = () => navigate('/documents?contractType=template');

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddContractTemplateFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = (payload: AddContractTemplateFormTypes) => {
    addContractTemplate(payload, {
      onSuccess: () => {
        useSuccessToast(t('template.add.form.submit.success'));
        navigateBack();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.TEMPLATE_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{t('template.add.heading')}</PageHeader>
      {isAddingContractTemplate && <LoadingContent />}
      {!isAddingContractTemplate && (
        <Card>
          <CardHeader>
            <h2>{t('template.add.card_header')}</h2>
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
                      id="add-contract-template-form__name"
                    />
                  );
                }}
              />
              <Controller
                key="template"
                name="template"
                control={control}
                render={({ field: { onChange } }) => {
                  return (
                    <FileUpload
                      label={t('general:contract').toString()}
                      onChange={onChange}
                      errorMessage={errors['template']?.message as string}
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

export default AddContractTemplate;
