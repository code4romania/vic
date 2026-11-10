import React, { useState } from 'react';
import i18n from '../common/config/i18n';
import { downloadExcel } from '../common/utils/utils';
import { useErrorToast } from '../hooks/useToast';
import {
  downloadEventRegistrations,
  REGISTRATION_EXPORT_FIELDS,
  RegistrationExportField,
} from '../services/event/event.api';
import Button from './Button';
import Modal from './Modal';

interface ExportRegistrationsModalProps {
  eventId: string;
  eventName?: string;
  onClose: () => void;
  // The event page has one export button (audit, major 11): with this, the modal also offers the
  // answers as listed in the table, with the filters applied.
  onExportAnswers?: () => Promise<void>;
}

type ExportKind = 'registrations' | 'answers';

// VIC 2.0 (#497): the NGO picks the columns and downloads the registered volunteers as XLSX
const ExportRegistrationsModal = ({
  eventId,
  eventName,
  onClose,
  onExportAnswers,
}: ExportRegistrationsModalProps) => {
  const [kind, setKind] = useState<ExportKind>('registrations');
  const [fields, setFields] = useState<RegistrationExportField[]>([...REGISTRATION_EXPORT_FIELDS]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const toggle = (field: RegistrationExportField) =>
    setFields((current) =>
      current.includes(field) ? current.filter((f) => f !== field) : [...current, field],
    );

  const onDownload = async () => {
    setIsDownloading(true);
    try {
      if (kind === 'answers' && onExportAnswers) {
        await onExportAnswers();
        onClose();
        return;
      }
      const ordered = REGISTRATION_EXPORT_FIELDS.filter((field) => fields.includes(field));
      const data = await downloadEventRegistrations(eventId, ordered);
      downloadExcel(
        data,
        i18n.t('events:export_registrations.file', { event: eventName ?? '' }).trim(),
      );
      onClose();
    } catch {
      useErrorToast(i18n.t('general:error.unknown'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      title={i18n.t(
        onExportAnswers
          ? 'events:export_registrations.export_title'
          : 'events:export_registrations.title',
      )}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 text-left">
        {onExportAnswers && (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{i18n.t('events:export_registrations.kind.title')}</legend>
            {(['registrations', 'answers'] as ExportKind[]).map((option) => (
              <label key={option} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="export-kind"
                  className="mt-1"
                  checked={kind === option}
                  onChange={() => setKind(option)}
                />
                <span>{i18n.t(`events:export_registrations.kind.${option}`)}</span>
              </label>
            ))}
          </fieldset>
        )}
        {kind === 'registrations' && (
          <>
            <p className="text-sm text-cool-gray-500">
              {i18n.t('events:export_registrations.description')}
            </p>
            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <legend className="sr-only">{i18n.t('events:export_registrations.title')}</legend>
              {REGISTRATION_EXPORT_FIELDS.map((field) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-cool-gray-300"
                    checked={fields.includes(field)}
                    onChange={() => toggle(field)}
                  />
                  <span>{i18n.t(`events:export_registrations.fields.${field}`)}</span>
                </label>
              ))}
            </fieldset>
          </>
        )}
        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            label={i18n.t('general:cancel')}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="button"
            label={i18n.t('events:export_registrations.submit')}
            className="btn-primary"
            disabled={(kind === 'registrations' && !fields.length) || isDownloading}
            onClick={onDownload}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ExportRegistrationsModal;
