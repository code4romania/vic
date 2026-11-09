import React, { useState } from 'react';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { useErrorToast } from '../hooks/useToast';
import { SensitiveAction, requestSensitiveCode } from '../services/security/security.api';
import Button from './Button';
import FormInput from './FormInput';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`settings:security.code.${key}`, options)}`;

interface SensitiveCodeFieldProps {
  action: SensitiveAction;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
}

// VIC 2.0, #508: a sensitive action asks for the 6-digit code emailed to the admin. Always on.
const SensitiveCodeField = ({ action, value, onChange, errorMessage }: SensitiveCodeFieldProps) => {
  const [sentTo, setSentTo] = useState<string>();
  const [isSending, setIsSending] = useState(false);

  const send = async () => {
    setIsSending(true);
    try {
      const { maskedEmail } = await requestSensitiveCode(action);
      setSentTo(maskedEmail);
    } catch (error) {
      const code = getAuthErrorCode(error);
      useErrorToast(code ? InternalErrors.AUTH_ERRORS.getError(code) : t('error'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-cool-gray-200 p-4">
      <p className="text-sm text-cool-gray-500">
        {sentTo ? t('sent', { email: sentTo }) : t('description')}
      </p>
      {sentTo && (
        <FormInput
          label={t('label')}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
          errorMessage={errorMessage}
        />
      )}
      {!sentTo && errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      <div>
        <Button
          type="button"
          className="btn-outline-secondary"
          label={sentTo ? t('resend') : t('send')}
          disabled={isSending}
          onClick={send}
        />
      </div>
    </div>
  );
};

export default SensitiveCodeField;
