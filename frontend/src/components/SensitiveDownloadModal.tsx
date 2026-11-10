import React, { useState } from 'react';
import i18n from '../common/config/i18n';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useErrorToast } from '../hooks/useToast';
import { SensitiveAction } from '../services/security/security.api';
import Button from './Button';
import Modal from './Modal';
import SensitiveCodeField from './SensitiveCodeField';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`settings:security.download_code.${key}`, options)}`;

const readText = (blob: Blob): Promise<string> =>
  typeof blob.text === 'function'
    ? blob.text()
    : new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(`${reader.result}`);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });

// A file download answers its error as a Blob or an ArrayBuffer; the AUTH_xxx code inside, if any.
const downloadErrorCode = async (error: unknown): Promise<AUTH_ERRORS | undefined> => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  try {
    let body: { code_error?: AUTH_ERRORS } | undefined;
    // duck-typed: the Blob may come from another realm (tests)
    if (Object.prototype.toString.call(data) === '[object Blob]')
      body = JSON.parse(await readText(data as Blob));
    else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data))
      body = JSON.parse(new TextDecoder().decode(data as ArrayBuffer));
    else if (typeof data === 'string') body = JSON.parse(data);
    else body = data as typeof body;
    const code = body?.code_error;
    return code && Object.values(AUTH_ERRORS).includes(code) ? code : undefined;
  } catch {
    return undefined;
  }
};

interface SensitiveDownloadModalProps {
  action: SensitiveAction;
  title: string;
  // Downloads the file with the code; throws when the API refuses it.
  onDownload: (code: string) => Promise<void>;
  onClose: () => void;
  // The toast when the download fails for another reason than the code.
  errorMessage: string;
}

// VIC 2.0, #593: the organization's data leaves VIC (volunteers export, full backup) only after the
// 6-digit code emailed to the admin, like the other sensitive actions (#508).
const SensitiveDownloadModal = ({
  action,
  title,
  onDownload,
  onClose,
  errorMessage,
}: SensitiveDownloadModalProps) => {
  const [code, setCode] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async () => {
    setIsDownloading(true);
    try {
      await onDownload(code);
      onClose();
    } catch (error) {
      const authCode = await downloadErrorCode(error);
      useErrorToast(authCode ? InternalErrors.AUTH_ERRORS.getError(authCode) : errorMessage);
      setIsDownloading(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex flex-col gap-4 text-left">
        <p>{t('description')}</p>
        <SensitiveCodeField action={action} value={code} onChange={setCode} />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            label={`${i18n.t('general:cancel')}`}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="button"
            label={t(isDownloading ? 'loading' : 'confirm')}
            className="btn-primary"
            disabled={!/^\d{6}$/.test(code) || isDownloading}
            onClick={download}
          />
        </div>
      </div>
    </Modal>
  );
};

export default SensitiveDownloadModal;
