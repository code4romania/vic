import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import FormInput from '../components/FormInput';
import PageHeader from '../components/PageHeader';
import Select from '../components/Select';
import Card from '../layouts/CardLayout';
import FormLayout from '../layouts/FormLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useUpdateVolunteerMutation,
  useVolunteerQuery,
} from '../services/volunteer/volunteer.service';

export type VolunteerFormData = {
  name: string;
  email: string;
  branch: string;
  role: string;
  department: string;
  startedOn: Date;
};

const schema = yup.object({ email: yup.string().email() });

const EditVolunteer = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: volunteer } = useVolunteerQuery(id as string);
  const { mutateAsync: updateVolunteer } = useUpdateVolunteerMutation();

  const {
    handleSubmit,
    formState: { errors },
    control,
    // reset,
  } = useForm<VolunteerFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: VolunteerFormData) => {
    if (volunteer) updateVolunteer({ id: volunteer.id, data });
  };

  const navigateBack = () => {
    navigate(`/volunteers/${id}`, { replace: true });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:edit', { item: '' })}
      </PageHeader>
      {volunteer && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('volunteer:card_title')}</h2>
            <div className="flex gap-6 shrink-0">
              <Button
                label={i18n.t('general:block', { item: '' })}
                className="btn-outline-secondary shrink-0"
              />
              <Button
                label={i18n.t(`general:archive`, { item: '' })}
                className="btn-outline-secondary shrink-0"
              />
              <Button
                label={i18n.t('general:save_changes')}
                className="btn-primary shrink-0"
                onClick={handleSubmit(onSubmit)}
              />
            </div>
          </CardHeader>
          <CardBody>
            <FormLayout>
              <form>
                <FormInput
                  type="text"
                  disabled
                  label={`${i18n.t('general:name')} ${i18n
                    .t('volunteer:name', { status: '' })
                    .toLowerCase()}`}
                  value={volunteer?.name}
                />
                <Controller
                  name="email"
                  key="email"
                  control={control}
                  defaultValue={volunteer.email}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormInput
                        type="email"
                        label={i18n.t('general:email')}
                        value={value}
                        onChange={onChange}
                        errorMessage={errors.email?.message as string}
                      />
                    );
                  }}
                />
                <hr className="border-cool-gray-200" />
                <Controller
                  name="branch"
                  key="branch"
                  control={control}
                  render={({ field: { onChange } }) => {
                    return (
                      <Select
                        label={`${i18n.t('volunteer:branch')}`}
                        onChange={onChange}
                        defaultValue={{ value: volunteer.branch, key: volunteer.branch }}
                        options={[
                          { value: volunteer.branch, key: volunteer.branch },
                          { value: 'Caine', key: 'caine' },
                          { value: 'Dog', key: 'dog' },
                          { value: 'Hot Dog', key: 'hot' },
                        ]}
                      />
                    );
                  }}
                />
                <Controller
                  name="role"
                  key="role"
                  control={control}
                  render={({ field: { onChange } }) => {
                    return (
                      <Select
                        label={`${i18n.t('division:entity.role')}`}
                        onChange={onChange}
                        defaultValue={{ value: volunteer.role, key: volunteer.role }}
                        options={[
                          { value: volunteer.role, key: volunteer.role },
                          { value: 'Caine', key: 'caine' },
                          { value: 'Dog', key: 'dog' },
                          { value: 'Hot Dog', key: 'hot' },
                        ]}
                      />
                    );
                  }}
                />
                <Controller
                  name="department"
                  key="department"
                  control={control}
                  render={({ field: { onChange } }) => {
                    return (
                      <Select
                        label={`${i18n.t('division:entity.department')}`}
                        onChange={onChange}
                        defaultValue={{ value: volunteer.department, key: volunteer.department }}
                        options={[
                          { value: volunteer.department, key: volunteer.department },
                          { value: 'Caine', key: 'caine' },
                          { value: 'Dog', key: 'dog' },
                          { value: 'Hot Dog', key: 'hot' },
                        ]}
                      />
                    );
                  }}
                />
                <hr className="border-cool-gray-200" />
                {/* <Controller
                  name="startedOn"
                  key="startedOn"
                  control={control}
                  defaultValue={volunteer.startedOn}
                  render={({ field: { onChange, value } }) => {
                    // return <FormDatePicker />;
                  }}
                /> */}
              </form>
            </FormLayout>
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default EditVolunteer;
