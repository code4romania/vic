import React from 'react';
import i18n from '../common/config/i18n';
import { IDivisionListItem } from '../common/interfaces/division.interface';
import { arrayOfNamesToString } from '../common/utils/utils';

interface TargetsProps {
  targets: IDivisionListItem[];
}

const Targets = ({ targets }: TargetsProps) => {
  const targetsString = arrayOfNamesToString(targets, ' ');

  return (
    <>
      {targets.length !== 0 ? (
        <small title={targetsString} className="text-overflow">
          {targetsString}
        </small>
      ) : (
        <small>
          {i18n.t('announcement:all_organization')}
          {/* ({row.targetedVolunteers}) {i18n.t('announcement:all_organization')} */}
        </small>
      )}
    </>
  );
};

export default Targets;
