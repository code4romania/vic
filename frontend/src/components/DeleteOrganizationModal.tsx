import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { useAuth } from '../hooks/useAuth';
import { useErrorToast } from '../hooks/useToast';
import { SensitiveAction, deleteOrganization } from '../services/security/security.api';
import Button from './Button';
import FormInput from './FormInput';
import Modal from './Modal';
import SensitiveCodeField from './SensitiveCodeField';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`settings:danger.${key}`, options)}`;

const normalize = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ro');

// VIC 2.0, #508: deleting the NGO account is one final action: the typed name and the emailed code.
const DeleteOrganizationModal = ({
  organizationName,
  onClose,
}: {
  organizationName: string;
  onClose: () => void;
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState('');
  const [code, setCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const ready = normalize(confirmation) === normalize(organizationName) && /^\d{6}$/.test(code);

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteOrganization(confirmation, code);
      await logout().catch(() => undefined);
      navigate('/login', { replace: true, state: { organizationDeleted: true } });
    } catch (error) {
      const data = (error as { response?: { data?: { code_error?: string } } }).response?.data;
      const authCode = getAuthErrorCode(error);
      useErrorToast(
        data?.code_error?.startsWith('ORG_')
          ? InternalErrors.ORGANIZATION_ERRORS.getError(data.code_error as never)
          : authCode
            ? InternalErrors.AUTH_ERRORS.getError(authCode)
            : t('error'),
      );
      setIsDeleting(false);
    }
  };

  return (
    <Modal title={t('modal_title')} onClose={onClose}>
      <div className="flex flex-col gap-4 text-left">
        <p>{t('modal_description', { name: organizationName })}</p>
        <FormInput
          label={t('type_name', { name: organizationName })}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
        <SensitiveCodeField
          action={SensitiveAction.DELETE_ORGANIZATION}
          value={code}
          onChange={setCode}
        />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            label={`${i18n.t('general:cancel')}`}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="button"
            label={t('confirm')}
            className="btn-danger"
            disabled={!ready || isDeleting}
            onClick={onDelete}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteOrganizationModal;
