import React from 'react';
import i18n from '../common/config/i18n';
import Button from './Button';
import Modal from './Modal';

interface ConfirmationModalProps {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal = ({ title, description, onClose, onConfirm }: ConfirmationModalProps) => {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p>{description}</p>
        <div className="flex flex-row justify-end gap-3">
          <Button
            type="button"
            label={i18n.t('general:cancel')}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="button"
            label={i18n.t('general:delete')}
            className="btn-danger"
            onClick={onConfirm}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
