import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { DocumentType } from '../common/enums/document-type.enum';
import { downloadFile, formatDate } from '../common/utils/utils';
import { useContractsQuery } from '../services/contracts/contracts.service';
import Button from './Button';
import Modal from './Modal';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`volunteer:delete.${key}`, options)}`;

interface DeleteVolunteerModalProps {
  volunteerId: string;
  volunteerName: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// VIC 2.0, #484: deleting a volunteer removes all their data in the NGO and cannot be undone, so the
// modal offers the volunteer's contracts for download first.
const DeleteVolunteerModal = ({
  volunteerId,
  volunteerName,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteVolunteerModalProps) => {
  const { data: contracts } = useContractsQuery({
    volunteerId,
    type: DocumentType.CONTRACT,
    page: 1,
    limit: 20,
  });

  return (
    <Modal title={t('title', { name: volunteerName })} onClose={onClose}>
      <div className="flex flex-col gap-4 text-left">
        <p>{t('description')}</p>
        {!!contracts?.items.length && (
          <div className="flex flex-col gap-3 rounded-md bg-yellow-50 p-4">
            <p className="text-yellow-800">{t('download_hint')}</p>
            <div className="flex flex-wrap gap-2">
              {contracts.items.map((contract) => (
                <Button
                  key={contract.id}
                  type="button"
                  className="btn-outline-secondary"
                  icon={<ArrowDownTrayIcon className="h-5 w-5" />}
                  label={
                    contracts.items.length === 1
                      ? t('download')
                      : `${t('download')} ${contract.contractNumber ?? formatDate(contract.startDate)}`
                  }
                  onClick={() => downloadFile(contract.uri, contract.fileName)}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-row justify-end gap-3">
          <Button
            type="button"
            label={i18n.t('general:cancel')}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="button"
            label={t('confirm')}
            className="btn-danger"
            disabled={isDeleting}
            onClick={onConfirm}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteVolunteerModal;
