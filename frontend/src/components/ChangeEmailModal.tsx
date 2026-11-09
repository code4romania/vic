import React, { useState } from 'react';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { useAuth } from '../hooks/useAuth';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { confirmEmailChange, requestEmailChange } from '../services/security/security.api';
import Button from './Button';
import FormInput from './FormInput';
import Modal from './Modal';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`settings:security.email.${key}`, options)}`;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE = /^\d{6}$/;
const digits = (value: string): string => value.replace(/\D/g, '').slice(0, 6);

// VIC 2.0, #508: change the login email. A code goes to the current address (sensitive action) and
// one to the new address (it is real and theirs); both confirm the change.
const ChangeEmailModal = ({ onClose }: { onClose: () => void }) => {
  const { profile, refreshProfile } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [sent, setSent] = useState<{ maskedEmail: string; newEmail: string }>();
  const [code, setCode] = useState('');
  const [newEmailCode, setNewEmailCode] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const fail = (err: unknown) => {
    const authCode = getAuthErrorCode(err);
    useErrorToast(authCode ? InternalErrors.AUTH_ERRORS.getError(authCode) : t('error'));
  };

  const sendCodes = async () => {
    if (!EMAIL.test(newEmail.trim())) return setError(t('invalid'));
    if (newEmail.trim().toLowerCase() === profile?.email?.toLowerCase()) return setError(t('same'));
    setError(undefined);
    setIsLoading(true);
    try {
      setSent(await requestEmailChange(newEmail.trim()));
    } catch (err) {
      fail(err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirm = async () => {
    if (!CODE.test(code) || !CODE.test(newEmailCode)) return setError(t('codes_required'));
    setError(undefined);
    setIsLoading(true);
    try {
      const { email } = await confirmEmailChange(code, newEmailCode);
      await refreshProfile();
      useSuccessToast(t('success', { email }));
      onClose();
    } catch (err) {
      fail(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title={t('title')} onClose={onClose}>
      <div className="flex flex-col gap-4 text-left">
        {!sent ? (
          <>
            <p className="text-cool-gray-500">{t('description', { email: profile?.email })}</p>
            <FormInput
              type="email"
              label={t('new_email')}
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              errorMessage={error}
            />
          </>
        ) : (
          <>
            <p className="text-cool-gray-500">
              {t('sent', { current: sent.maskedEmail, next: sent.newEmail })}
            </p>
            <FormInput
              label={t('current_code', { email: sent.maskedEmail })}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(digits(event.target.value))}
            />
            <FormInput
              label={t('new_code', { email: sent.newEmail })}
              inputMode="numeric"
              value={newEmailCode}
              onChange={(event) => setNewEmailCode(digits(event.target.value))}
              errorMessage={error}
            />
          </>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            label={`${i18n.t('general:cancel')}`}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="button"
            label={sent ? t('confirm') : t('send')}
            className="btn-primary"
            disabled={isLoading}
            onClick={sent ? confirm : sendCodes}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ChangeEmailModal;
