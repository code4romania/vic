import React from 'react';
import i18n from '../common/config/i18n';
import { IDivisionListItem } from '../common/interfaces/division.interface';
import { arrayOfNamesToString } from '../common/utils/utils';

interface TargetsProps {
  targets: IDivisionListItem[];
  volunteersCount?: number;
}

const Targets = ({ targets, volunteersCount }: TargetsProps) => {
  const targetsString = arrayOfNamesToString(targets, ', ');

  return (
    <>
      {targets.length !== 0 ? (
        <small title={targetsString} className="text-overflow">
          {volunteersCount ? `(${volunteersCount}) ${targetsString}` : targetsString}
        </small>
      ) : (
        <small>{i18n.t('announcement:all_organization')}</small>
      )}
    </>
  );
};

export default Targets;
