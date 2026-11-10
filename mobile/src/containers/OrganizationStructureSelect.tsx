/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import FormSelect, { FormSelectProps, ISelectItem } from '../components/FormSelect';
import { getOrganizationStructuresByType } from '../services/organization-structure/organization-structure.api';
import { OrganizationStructureType } from '../common/enums/organization-structure-type.enum';

interface OrganizationStructureSelectProps extends Omit<FormSelectProps, 'options'> {
  organizationId: string;
  type: OrganizationStructureType;
}

const OrganizationStructureSelect = ({
  type,
  organizationId,
  ...props
}: OrganizationStructureSelectProps) => {
  const [structures, setStructures] = useState<ISelectItem[]>([]);

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    try {
      const rawStructures = await getOrganizationStructuresByType(type, organizationId);
      const mappedStructures = rawStructures.map((structure) => ({
        label: structure.name,
        key: structure.id,
      }));
      setStructures(mappedStructures);
    } catch {
      // the select stays empty; the form still shows its other fields
    }
  };

  return <FormSelect {...props} options={structures} />;
};

export default OrganizationStructureSelect;
