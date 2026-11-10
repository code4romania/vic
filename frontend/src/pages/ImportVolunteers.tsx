import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import FileUpload from '../components/FileUpload';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import Paragraph from '../components/Paragraph';
import Card from '../layouts/CardLayout';
import FormLayout from '../layouts/FormLayout';
import PageLayout from '../layouts/PageLayout';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { downloadExcel } from '../common/utils/utils';
import { IImportVolunteersResult } from '../common/interfaces/volunteer.interface';
import { useImportVolunteersMutation } from '../services/volunteer/volunteer.service';
import { useErrorToast } from '../hooks/useToast';
import { useValidationGate } from '../hooks/useValidationGate';

export const IMPORT_MAX_BYTES = 1024 * 1024;

const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(`volunteers:import.${key}`, options) as string;

// The template's header row is what the backend reads (ImportVolunteersUseCase); the example row shows
// the format and can be deleted.
export const IMPORT_TEMPLATE = [
  'Prenume,Nume,Email,Telefon,Localitate,Județ,Departament',
  'Maria,Ionescu,maria.ionescu@exemplu.ro,+40722000000,Cluj-Napoca,Cluj,Logistică',
].join('\r\n');

// #473: the NGO imports volunteers from a CSV or Excel file. Everyone becomes a Candidate: no email is
// sent and only people who already have a VIC account have one.
const ImportVolunteers = () => {
  const navigate = useNavigate();
  const { blocked, gate } = useValidationGate();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<IImportVolunteersResult | null>(null);
  const { mutate: importVolunteers, isLoading } = useImportVolunteersMutation();

  const onDownloadTemplate = () =>
    // The BOM makes Excel open the diacritics as UTF-8.
    downloadExcel(`\uFEFF${IMPORT_TEMPLATE}\r\n`, t('template_name'));

  const onImport = () => {
    if (!file) return;
    importVolunteers(file, {
      onSuccess: (data) => {
        setResult(data);
        setFile(null);
      },
      onError: (error) =>
        useErrorToast(InternalErrors.VOLUNTEER_ERRORS.getError(error.response?.data.code_error)),
    });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={() => navigate('/volunteers', { replace: true })}>
        {t('title')}
      </PageHeader>
      {isLoading && <LoadingContent />}
      <Card>
        <CardHeader>
          <h2>{t('card_title')}</h2>
          <Button
            label={t('template')}
            icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
            className="btn-outline-secondary"
            onClick={onDownloadTemplate}
          />
        </CardHeader>
        <CardBody>
          <FormLayout>
            <div className="max-w-[36rem] relative left-1/2 -translate-x-1/2 flex flex-col gap-4">
              <Paragraph title={t('title')}>{t('description')}</Paragraph>
              <FileUpload
                type="sheet"
                label={t('file')}
                hint={file ? file.name : t('hint')}
                maxSize={IMPORT_MAX_BYTES}
                rejectedMessage={t('rejected')}
                onChange={(selected) => {
                  setFile(selected);
                  setResult(null);
                }}
              />
              <Button
                label={t('submit')}
                className="btn-primary self-start"
                onClick={onImport}
                {...gate}
                disabled={!file || isLoading || blocked}
              />

              {result && (
                <section aria-label={t('result.title')} className="flex flex-col gap-3">
                  <h3 className="font-robotoBold">{t('result.title')}</h3>
                  <p role="status">{t('result.imported', { count: result.imported })}</p>
                  {result.skipped.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <p>{t('result.skipped', { count: result.skipped.length })}</p>
                      <ul className="list-disc pl-5 text-cool-gray-500">
                        {result.skipped.map((skip) => (
                          <li key={skip.row}>
                            {t('result.row', { row: skip.row })}: {skip.email},{' '}
                            {t(`skip.${skip.reason}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.errors.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <p className="text-red-500">
                        {t('result.errors', { count: result.errors.length })}
                      </p>
                      <ul className="list-disc pl-5 text-red-500">
                        {result.errors.map((error) => (
                          <li key={error.row}>
                            {t('result.row', { row: error.row })}:{' '}
                            {error.reasons.map((reason) => t(`reason.${reason}`)).join('; ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    label={t('result.to_list')}
                    className="btn-outline-secondary self-start"
                    onClick={() => navigate('/volunteers', { replace: true })}
                  />
                </section>
              )}
            </div>
          </FormLayout>
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default ImportVolunteers;
