import React from 'react';
import FormLayout from '../layouts/FormLayout';
import OrganizationIdentity from './OrganizationIdentity';
import { Text } from '@ui-kitten/components';
import FormInput from './FormInput';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { IOrganizationListItem } from '../common/interfaces/organization-list-item.interface';
import { OrganizationStructureType } from '../common/enums/organization-structure-type.enum';
import FormDatePicker from './FormDatePicker';
import { Control, FieldErrors } from 'react-hook-form';
import { useUserProfile } from '../store/profile/profile.selector';

export type VolunteerFormTypes = {
  email: string;
  phone: string;
  branchId: string;
  departmentId: string;
  roleId: string;
  activeSince: Date;
};

export const volunteerSchema = yup.object({
  email: yup
    .string()
    .email(`${i18n.t('login:form.email.pattern')}`)
    .required(`${i18n.t('login:form.email.required')}`),
  phone: yup.string().required(`${i18n.t('register:create_account.form.phone.required')}`),
});

interface VolunteerFormProps {
  paragraph?: string;
  isLoading?: boolean;
  control: Control<VolunteerFormTypes, any>;
  errors: FieldErrors<VolunteerFormTypes>;
}

const VolunteerForm = ({ paragraph, isLoading, control, errors }: VolunteerFormProps) => {
  const { userProfile } = useUserProfile();

  const { t } = useTranslation('create_volunteer');

  return (
    <FormLayout>
      <Text appearance="hint">{`${paragraph || ''}`}</Text>
      <OrganizationIdentity
        name={userProfile?.activeOrganization?.name || ''}
        uri={userProfile?.activeOrganization?.logo || ''}
      />
      <FormInput
        control={control as any}
        error={errors.email}
        label={t('form.email.label')}
        name="email"
        placeholder={t('form.email.placeholder')}
        required={true}
        disabled={isLoading}
      />
      <FormInput
        control={control as any}
        error={errors.phone}
        label={t('general:phone')}
        name="phone"
        placeholder=""
        required={true}
        disabled={!!userProfile?.phone || isLoading}
      />
      <OrganizationStructureSelect
        control={control as any}
        error={errors.branchId}
        label={t('form.branch.label')}
        name="branchId"
        placeholder={t('general:select')}
        organizationId={(userProfile?.activeOrganization as IOrganizationListItem).id}
        type={OrganizationStructureType.BRANCH}
        disabled={isLoading}
      />
      <OrganizationStructureSelect
        control={control as any}
        error={errors.departmentId}
        label={t('general:department')}
        name="departmentId"
        organizationId={(userProfile?.activeOrganization as IOrganizationListItem).id}
        type={OrganizationStructureType.DEPARTMENT}
        placeholder={t('general:select')}
        disabled={isLoading}
      />
      <OrganizationStructureSelect
        control={control as any}
        error={errors.roleId}
        label={t('general:role')}
        name="roleId"
        organizationId={(userProfile?.activeOrganization as IOrganizationListItem).id}
        type={OrganizationStructureType.ROLE}
        placeholder={t('general:select')}
        disabled={isLoading}
      />
      <FormDatePicker
        control={control as any}
        name="activeSince"
        error={errors.activeSince}
        label={t('form.active_since.label')}
        placeholder={t('general:select')}
        min={new Date(1920, 1, 1)}
        disabled={isLoading}
      />
    </FormLayout>
  );
};

export default VolunteerForm;
