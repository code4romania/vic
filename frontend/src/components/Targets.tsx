import React from 'react';
import i18n from '../common/config/i18n';
import { IDivisionListItem } from '../common/interfaces/division.interface';
import { arrayOfNamesToString } from '../common/utils/utils';

interface TargetsProps {
  targets: IDivisionListItem[];
  isPublic?: boolean;
  targetedMembers?: number;
}

const Targets = ({ targets, isPublic, targetedMembers }: TargetsProps) => {
  const targetsString = arrayOfNamesToString(targets, ', ');

  return (
    <>
      {isPublic ? (
        <small>{i18n.t('events:form.target.public')}</small>
      ) : (
        <>
          {targets.length !== 0 ? (
            <small title={targetsString} className="text-overflow">
              {targetedMembers ? `(${targetedMembers}) ${targetsString}` : targetsString}
            </small>
          ) : (
            <small>{i18n.t('announcement:all_organization')}</small>
          )}
        </>
      )}
    </>
  );
};

export default Targets;
