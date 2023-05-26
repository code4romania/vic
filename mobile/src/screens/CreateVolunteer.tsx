import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import i18n from '../common/config/i18n';
import { useForm, Controller } from 'react-hook-form';
import { CheckBox, Text } from '@ui-kitten/components';
import FormInput from '../components/FormInput';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import FormSelect, { ISelectItem } from '../components/FormSelect';
import FormDatePicker from '../components/FormDatePicker';

const options: ISelectItem[] = [
  { key: '13123', label: 'Option1' },
  { key: '112312', label: 'Option2' },
  { key: '4323', label: 'Option3' },
];

type CreateVolunteerFormTypes = {
  name: string;
  email: string;
  sameEmail: boolean;
  phone: string;
  branch: string;
  department: string;
  role: string;
  activeSince: Date;
};

const schema = yup
  .object({
    email: yup
      .string()
      .email(`${i18n.t('login:form.email.pattern')}`)
      .required(`${i18n.t('login:form.email.required')}`),
  })
  .required();

const CreateVolunteer = () => {
  const [sameEmail, setSameEmail] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    trigger,
    setValue,
  } = useForm<CreateVolunteerFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      name: 'Andreea Petrescu',
      phone: '0712345678',
    },
  });

  const onCheckBoxChange = (onChange: (value: any) => void) => (value: boolean) => {
    onChange(value);
    setSameEmail(value);
    setValue('email', value ? 'unemail@orice.com' : '');
    trigger('email');
  };

  const onSubmit = (payload: CreateVolunteerFormTypes) => {
    console.log(payload);
  };

  const onBackPress = () => {
    console.log('back pressed');
  };

  return (
    <PageLayout
      title={i18n.t('register:title')}
      actionsOptions={{
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        primaryActionLabel: i18n.t('general:continue'),
      }}
      onBackButtonPress={onBackPress}
    >
      <FormLayout>
        <Text category="h3">{`${i18n.t('create_volunteer:heading')}`}</Text>
        <Text appearance="hint">{`${i18n.t('create_volunteer:description')}`}</Text>
        <FormInput
          control={control as any}
          error={errors.name}
          label={i18n.t('create_volunteer:form.name.label')}
          name="name"
          placeholder="Andreea Petrescu"
          required={true}
          disabled={true}
        />
        <FormInput
          control={control as any}
          error={errors.email}
          label={i18n.t('create_volunteer:form.email.label')}
          name="email"
          placeholder={i18n.t('create_volunteer:form.email.placeholder')}
          disabled={sameEmail}
          required={true}
        />
        <View style={styles.checkBoxWrapper}>
          <Controller
            control={control}
            name="sameEmail"
            defaultValue={false}
            render={({ field: { onChange, value } }) => (
              <CheckBox checked={value} onChange={onCheckBoxChange(onChange)}>
                {() => (
                  <Text style={styles.label}>{`${i18n.t(
                    'create_volunteer:form.checkbox.label',
                  )}`}</Text>
                )}
              </CheckBox>
            )}
          />
        </View>
        <FormInput
          control={control as any}
          error={errors.phone}
          label={i18n.t('general:phone')}
          name="phone"
          placeholder=""
          required={true}
          disabled={true}
        />
        <FormSelect
          control={control as any}
          error={errors.branch}
          label={i18n.t('create_volunteer:form.branch.label')}
          name="branch"
          options={options}
          placeholder={i18n.t('general:select')}
        />
        <FormSelect
          control={control as any}
          error={errors.department}
          label={i18n.t('general:department')}
          name="department"
          options={options}
          placeholder={i18n.t('general:select')}
        />
        <FormSelect
          control={control as any}
          error={errors.role}
          label={i18n.t('general:role')}
          name="role"
          options={options}
          placeholder={i18n.t('general:select')}
        />
        <FormDatePicker
          control={control as any}
          name="activeSince"
          error={errors.activeSince}
          label={i18n.t('create_volunteer:form.active_since.label')}
          placeholder={i18n.t('general:select')}
          min={new Date(1920, 1, 1)}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default CreateVolunteer;

const styles = StyleSheet.create({
  checkBoxWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
  },
});
