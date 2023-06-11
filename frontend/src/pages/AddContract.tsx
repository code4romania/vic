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

const schema = yup
  .object({
    volunteer: yup.object().required(`${i18n.t('activity_log:form.volunteer.required')}`),
    template: yup.object().required(`${i18n.t('documents:contracts.form.template.required')}`),
    number: yup
      .number()
      .typeError(`${i18n.t('documents:contracts.form.number.type')}`)
      .integer(`${i18n.t('documents:contracts.form.number.integer')}`)
      .positive(`${i18n.t('documents:contracts.form.number.positiv')}`)
      .max(1000000000, `${i18n.t('documents:contracts.form.number.max')}`)
      .required(`${i18n.t('documents:contracts.form.number.required')}`),
    startDate: yup.date().required(`${i18n.t('documents:contracts.form.start_date.required')}`),
    endDate: yup.date().required(`${i18n.t('documents:contracts.form.end_date.required')}`),
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
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:add', { item: '' })}
      </PageHeader>
      {isLoading && <LoadingContent />}
      {!isLoading && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('general:contract')}</h2>
            <Button
              label={i18n.t('documents:contracts.form.submit.label')}
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
                      label={i18n.t('volunteer:name', { status: '' })}
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
                      label={i18n.t('documents:contracts.form.template.label')}
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
                      label={`${i18n.t('documents:contracts.number')}*`}
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
                      label={`${i18n.t('events:form.start_date.label')}*`}
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
                      label={i18n.t('events:form.end_date.label') as string}
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
