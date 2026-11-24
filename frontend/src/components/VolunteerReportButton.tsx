import React, { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { useErrorToast } from '../hooks/useToast';
import { getVolunteerReport } from '../services/volunteer/volunteer.api';
import Button from './Button';
import PdfViewerModal from './pdf/PdfViewerModal';

// #479: the full report of the volunteer, as a PDF. #726: it opens in the viewer, with Download there.
const VolunteerReportButton = ({ volunteerId }: { volunteerId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<{ data: Blob; fileName: string } | null>(null);

  const onOpen = async () => {
    setIsLoading(true);
    try {
      setReport(await getVolunteerReport(volunteerId));
    } catch {
      useErrorToast(i18n.t('volunteer:report.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="btn-outline-secondary w-full justify-center"
        icon={<DocumentTextIcon className="h-5 w-5" />}
        label={i18n.t(isLoading ? 'volunteer:report.loading' : 'volunteer:report.view')}
        onClick={onOpen}
        disabled={isLoading}
      />
      {report && (
        <PdfViewerModal
          fileName={report.fileName}
          load={() => Promise.resolve(report.data)}
          onClose={() => setReport(null)}
        />
      )}
    </>
  );
};

export default VolunteerReportButton;
