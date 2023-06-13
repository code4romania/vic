import React from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import i18n from '../common/config/i18n';
import { useNavigate } from 'react-router-dom';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import FormLayout from '../layouts/FormLayout';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import VolunteerSelect from '../containers/VolunteerSelect';
import { yupResolver } from '@hookform/resolvers/yup';
import { ListItem } from '../common/interfaces/list-item.interface';
import FormDatePicker from '../components/FormDatePicker';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import TemplateSelect from '../containers/TemplateSelect';
import { useAddContractMutation } from '../services/contracts/contracts.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';
import { useTranslation } from 'react-i18next';

const schema = yup
  .object({
    volunteer: yup.object().required(`${i18n.t('documents:contract.add.form.volunteer.required')}`),
    template: yup.object().required(`${i18n.t('documents:contract.add.form.template.required')}`),
    number: yup
      .string()
      .max(10, `${i18n.t('documents:contract.add.form.contract_number.max')}`)
      .required(`${i18n.t('documents:contract.add.form.contract_number.required')}`),
    startDate: yup.date().required(`${i18n.t('documents:contract.add.form.start_date.required')}`),
    endDate: yup.date().required(`${i18n.t('documents:contract.add.form.end_date.required')}`),
  })
  .required();

export type AddContractFormTypes = {
  volunteer: ListItem;
  template: ListItem;
  number: number;
  startDate: Date;
  endDate: Date;
};

const AddContract = () => {
  const navigate = useNavigate();
  // translation
  const { t } = useTranslation('documents');

  const navigateBack = () => {
    navigate('/documents/contracts', { replace: true });
  };

  const { mutateAsync: addContract, isLoading } = useAddContractMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddContractFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: AddContractFormTypes) => {
    addContract(data, {
      onSuccess: () => {
        useSuccessToast(i18n.t('documents:contracts.form.submit.messages.add_contract'));
        navigateBack();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{t('general:add', { item: '' })}</PageHeader>
      {isLoading && <LoadingContent />}
      {!isLoading && (
        <Card>
          <CardHeader>
            <h2>{t('general:contract')}</h2>
            <Button
              label={t('contract.add.submit.label')}
              className="btn-primary"
              onClick={handleSubmit(onSubmit)}
            />
          </CardHeader>
          <CardBody>
            <FormLayout>
              <Controller
                key="volunteer"
                name="volunteer"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <VolunteerSelect
                      defaultValue={value}
                      onSelect={onChange}
                      label={t('volunteer:name', { status: '' })}
                      errorMessage={errors['volunteer']?.message}
                    />
                  );
                }}
              />
              <Controller
                key="template"
                name="template"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <TemplateSelect
                      defaultValue={value}
                      onSelect={onChange}
                      label={t('contract.add.form.template.label')}
                      errorMessage={errors['template']?.message}
                    />
                  );
                }}
              />
              <Controller
                key="number"
                name="number"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <FormInput
                      type="number"
                      label={`${t('contract.add.form.contract_number.label')}`}
                      value={value}
                      errorMessage={errors.number?.message}
                      onChange={onChange}
                    />
                  );
                }}
              />
              <Controller
                key="startDate"
                name="startDate"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <FormDatePicker
                      name="startDate"
                      label={`${t('events:form.start_date.label')}*`}
                      onChange={onChange}
                      value={value}
                      errorMessage={errors['startDate']?.message}
                    />
                  );
                }}
              />
              <Controller
                key="endDate"
                name="endDate"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <FormDatePicker
                      name="endDate"
                      label={`${t('events:form.end_date.label')}*`}
                      onChange={onChange}
                      value={value}
                      errorMessage={errors['endDate']?.message}
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

export default AddContract;
