import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { downloadExcel } from '../common/utils/utils';
import { useErrorToast } from '../hooks/useToast';
import { getVolunteerReport } from '../services/volunteer/volunteer.api';
import Button from './Button';

// #479: "Descarcă raport complet (PDF)" on the volunteer profile.
const VolunteerReportButton = ({ volunteerId }: { volunteerId: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const onDownload = async () => {
    setIsLoading(true);
    try {
      const { data, fileName } = await getVolunteerReport(volunteerId);
      downloadExcel(data, fileName);
    } catch {
      useErrorToast(i18n.t('volunteer:report.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="btn-outline-secondary w-full justify-center"
      icon={<ArrowDownTrayIcon className="h-5 w-5" />}
      label={i18n.t(isLoading ? 'volunteer:report.loading' : 'volunteer:report.download')}
      onClick={onDownload}
      disabled={isLoading}
    />
  );
};

export default VolunteerReportButton;
