/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import FormSelect, { FormSelectProps, ISelectItem } from '../components/FormSelect';
import { getActivityTypesByOrganizationId } from '../services/activity-type/activity-type.api';
import { useTranslation } from 'react-i18next';
import { CONSTANTS } from '../common/constants/constants';

interface ActivityTypeSelectProps extends Omit<FormSelectProps, 'options'> {
  organizationId: string;
}

const ActivityTypeSelect = ({ organizationId, ...props }: ActivityTypeSelectProps) => {
  const { t } = useTranslation('activity_log');
  const [structures, setStructures] = useState<ISelectItem[]>([]);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const rawTypes = await getActivityTypesByOrganizationId(organizationId);
      const mappedStructures = rawTypes.map((structure) => ({
        label: structure.name,
        key: structure.id,
      }));
      setStructures([...mappedStructures, { label: t('other'), key: CONSTANTS.OTHER_OPTION }]);
    } catch (error: any) {
      console.log('error while loading types', error);
    }
  };

  return <FormSelect {...props} options={structures} />;
};

export default ActivityTypeSelect;
