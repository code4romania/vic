import React from 'react';
import { useForm } from 'react-hook-form';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';
import OrganizationIdentity from '../components/OrganizationIdentity';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormSelect, { ISelectItem } from '../components/FormSelect';
import FormDatePicker from '../components/FormDatePicker';
import { View } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';

const options: ISelectItem[] = [
  { key: 'socialwqd', label: 'Social media captain' },
  { key: 'bucur', label: 'București' },
  { key: 'pr', label: 'PR și Comunicare' },
];

const volunteer = {
  organizationName: 'Asociația ZEN',
  organizationPicture: 'https://picsum.photos/200',
  email: 'andreea.popa@zen.ro',
  phone: '0720000000',
  activeSince: new Date(2012, 2, 20),
};

type EditVolunteerFormTypes = {
  email: string;
  branch: string;
  department: string;
  phone: string;
  role: string;
  activeSince: Date;
};

const schema = yup.object({
  email: yup
    .string()
    .email(`${i18n.t('volunteer:form.email.pattern')}`)
    .required(`${i18n.t('volunteer:form.email.required')}`),
  activeSince: yup.date().required(`${i18n.t('volunteer:form.active_since.required')}`),
});

const EditVolunteer = ({ navigation }: any) => {
  console.log('EditVolunteer');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditVolunteerFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      email: volunteer.email,
      phone: volunteer.phone,
      activeSince: volunteer.activeSince,
    },
  });

  const onSubmit = (payload: EditVolunteerFormTypes) => {
    console.log(payload);
  };

  return (
    <ModalLayout
      title={i18n.t('volunteer:edit')}
      onDismiss={navigation.goBack}
      actionsOptions={{
        buttonType: ButtonType.PRIMARY,
        onActionButtonClick: handleSubmit(onSubmit),
        onActionLabel: i18n.t('general:save'),
      }}
    >
      <FormLayout>
        <View />
        <OrganizationIdentity
          uri={volunteer.organizationPicture}
          name={volunteer.organizationName}
        />
        <FormInput
          control={control as any}
          error={errors.email}
          label={`${i18n.t('volunteer:form.email.label')}`}
          name="email"
          placeholder=""
        />
        <FormInput
          control={control as any}
          error={errors.phone}
          label={`${i18n.t('volunteer:form.phone.label')}`}
          name="phone"
          disabled={true}
          helper={`${i18n.t('volunteer:form.phone.info')}`}
          placeholder=""
        />
        <FormSelect
          control={control as any}
          error={errors.branch}
          label={`${i18n.t('general:branch')}`}
          name="branch"
          placeholder={`${i18n.t('general:select')}`}
          options={options}
        />
        <FormSelect
          control={control as any}
          error={errors.role}
          label={`${i18n.t('general:role')}`}
          name="role"
          placeholder={`${i18n.t('general:select')}`}
          options={options}
        />
        <FormSelect
          control={control as any}
          error={errors.department}
          label={`${i18n.t('general:department')}`}
          name="department"
          placeholder={`${i18n.t('general:select')}`}
          options={options}
        />
        <FormDatePicker
          control={control as any}
          error={errors.activeSince}
          label={`${i18n.t('volunteer:form.active_since.label')}`}
          name="activeSince"
          min={new Date(1900, 1, 1)}
          placeholder={i18n.t('general:select')}
        />
      </FormLayout>
    </ModalLayout>
  );
};

export default EditVolunteer;
