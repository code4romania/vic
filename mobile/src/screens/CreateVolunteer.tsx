import React, { useEffect } from 'react';
import FormLayout from '../layouts/FormLayout';
import i18n from '../common/config/i18n';
import { useForm } from 'react-hook-form';
import { Text } from '@ui-kitten/components';
import FormInput from '../components/FormInput';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormDatePicker from '../components/FormDatePicker';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useAuth } from '../hooks/useAuth';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { OrganizationStructureType } from '../common/enums/organization-structure-type.enum';
import { useCreateVolunteerProfileMutation } from '../services/volunteer/volunteer.service';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useActiveOrganization } from '../hooks/useActiveOrganization';
import { IActiveOrganization } from '../contexts/organization/OrganizationContext';

type CreateVolunteerFormTypes = {
  email: string;
  phone: string;
  branchId: string;
  departmentId: string;
  roleId: string;
  activeSince: Date;
};

const schema = yup
  .object({
    email: yup
      .string()
      .email(`${i18n.t('login:form.email.pattern')}`)
      .required(`${i18n.t('login:form.email.required')}`),
    phone: yup.string().required(`${i18n.t('register:create_account.form.phone.required')}`),
  })
  .required();

const CreateVolunteer = ({ navigation }: any) => {
  const { activeOrganization } = useActiveOrganization();
  const { userProfile } = useAuth();
  const { t } = useTranslation('create_volunteer');
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<CreateVolunteerFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { isLoading: isCreatingProfile, mutate: createVolunteerProfile } =
    useCreateVolunteerProfileMutation();

  useEffect(() => {
    if (userProfile) {
      reset({ email: userProfile.email, phone: userProfile.phone });
    }
  }, [userProfile, reset]);

  const onSubmit = (profile: CreateVolunteerFormTypes) => {
    if (activeOrganization) {
      createVolunteerProfile(
        {
          profile: {
            ...profile,
            roleId: profile.roleId || undefined,
            departmentId: profile.departmentId || undefined,
            branchId: profile.branchId || undefined,
          },
          volunteerId: activeOrganization?.volunteerId,
        },
        {
          onError: (error: any) => {
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.VOLUNTEER_PROFILE_ERRORS.getError(
                error.response?.data.code_error,
              )}`,
            });
          },
          onSuccess: () => navigation.navigate('volunteer'),
        },
      );
    }
  };

  return (
    <ModalLayout
      title={t('heading')}
      actionsOptions={{
        onActionButtonClick: handleSubmit(onSubmit),
        actionLabel: i18n.t('general:save'),
        loading: isCreatingProfile,
      }}
      onDismiss={navigation.goBack}
    >
      <FormLayout>
        <Text appearance="hint">{`${t('paragraph')}`}</Text>
        <OrganizationIdentity
          name={activeOrganization?.name || ''}
          uri={activeOrganization?.logo || ''}
        />
        <FormInput
          control={control as any}
          error={errors.email}
          label={t('form.email.label')}
          name="email"
          placeholder={t('form.email.placeholder')}
          required={true}
          disabled={isCreatingProfile}
        />
        <FormInput
          control={control as any}
          error={errors.phone}
          label={t('general:phone')}
          name="phone"
          placeholder=""
          required={true}
          disabled={!!userProfile?.phone || isCreatingProfile}
        />
        <OrganizationStructureSelect
          control={control as any}
          error={errors.branchId}
          label={t('form.branch.label')}
          name="branchId"
          placeholder={t('general:select')}
          organizationId={(activeOrganization as IActiveOrganization).id}
          type={OrganizationStructureType.BRANCH}
          disabled={isCreatingProfile}
        />
        <OrganizationStructureSelect
          control={control as any}
          error={errors.departmentId}
          label={t('general:department')}
          name="departmentId"
          organizationId={(activeOrganization as IActiveOrganization).id}
          type={OrganizationStructureType.DEPARTMENT}
          placeholder={t('general:select')}
          disabled={isCreatingProfile}
        />
        <OrganizationStructureSelect
          control={control as any}
          error={errors.roleId}
          label={t('general:role')}
          name="roleId"
          organizationId={(activeOrganization as IActiveOrganization).id}
          type={OrganizationStructureType.ROLE}
          placeholder={t('general:select')}
          disabled={isCreatingProfile}
        />
        <FormDatePicker
          control={control as any}
          name="activeSince"
          error={errors.activeSince}
          label={t('form.active_since.label')}
          placeholder={t('general:select')}
          min={new Date(1920, 1, 1)}
          disabled={isCreatingProfile}
        />
      </FormLayout>
    </ModalLayout>
  );
};

export default CreateVolunteer;
