import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import AccessCodeForm, { AccessCodeFormTypes } from '../components/AccessCodeForm';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { REGEX } from '../common/constants/patterns';
import { useForm } from 'react-hook-form';

const validationSchema = yup.object({
  code: yup.string().required().min(2).max(10).matches(REGEX.NAME_REGEX),
  availabilityStart: yup.date().required(),
  availabilityEnd: yup.date().optional(),
});

const EditAccessCode = () => {
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AccessCodeFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  const onNavigateBack = () => {
    navigate(-1);
  };

  const onSave = () => {
    console.log(1);
  };

  return (
    <PageLayout>
      <div className="flex flex-row gap-4">
        <Button
          className="btn-secondary"
          label={i18n.t('general:back')}
          icon={<ChevronLeftIcon className="h-5 w-5" />}
          onClick={onNavigateBack}
        ></Button>
        <h1>{i18n.t('general:add', { item: i18n.t('access_codes:name').toLocaleLowerCase() })}</h1>
      </div>
      <Card>
        <CardHeader>
          <h3>{i18n.t('access_codes:name')}</h3>
          <Button
            label={i18n.t('confirmation:save')}
            className="btn-primary"
            onClick={handleSubmit(onSave)}
          />
        </CardHeader>
        <CardBody>
          <AccessCodeForm control={control} errors={errors} />
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default EditAccessCode;
