import React from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import i18n from '../common/config/i18n';
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
import FormFileInput from '../components/FormFileInput';

type AddContractTemplateFormTypes = {
  name: string;
  template: object;
};

function isValidFileType(value: string) {
  if (!value) return false;
  const splitted = value.split('.');
  const lastValue = splitted[splitted.length - 1];

  return lastValue === 'pdf' || lastValue === 'doc';
}

const validationSchema = yup
  .object({
    name: yup
      .string()
      .required(`${i18n.t('documents:contracts.form.template_name.required')}`)
      .min(2, `${i18n.t('documents:contracts.form.template_name.min', { min: 2 })}`)
      .max(250, `${i18n.t('documents:contracts.form.template_name.max', { max: 250 })}`),
    template: yup
      .mixed()
      .required(`${i18n.t('documents:contracts.form.contract.required')}`)
      .test('is-valid-type', `${i18n.t('documents:contracts.form.contract.format')}`, (value) =>
        isValidFileType(value),
      ),
  })
  .required();

const AddContract = () => {
  const navigate = useNavigate();

  const onBackButtonPress = () => navigate('/documents/contracts');

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
    console.log(payload);
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onBackButtonPress}>
        {i18n.t('general:add', { item: '' })}
      </PageHeader>
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
              render={({ field: { onChange, value } }) => {
                return (
                  <FormInput
                    type="text"
                    readOnly={false}
                    value={value}
                    errorMessage={errors['name']?.message as string}
                    label={i18n.t('documents:contracts.form.template_name.label').toString()}
                    placeholder={`${i18n.t('documents:contracts.form.template_name.placeholder')}`}
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
              render={({ field: { onChange, value } }) => {
                return (
                  <FormFileInput
                    buttonLabel={`${i18n.t('documents:contracts.form.contract.label')}`}
                    readOnly={false}
                    accept=".doc,.pdf"
                    className={`${value ? 'btn-primary' : 'btn-outline-secondary'} max-w-[150px]`}
                    errorMessage={errors['template']?.message as string}
                    label={i18n.t('general:contract').toString()}
                    onChange={onChange}
                  />
                );
              }}
            />
          </FormLayout>
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default AddContract;
