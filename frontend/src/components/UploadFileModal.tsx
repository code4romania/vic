import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import FileUpload from './FileUpload';

interface UploadFileModalProps {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: (file?: File) => void;
}

const UploadFileModal = ({ title, description, onClose, onConfirm }: UploadFileModalProps) => {
  const [file, setFile] = useState<File>();

  const { t } = useTranslation('general');

  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p>{description}</p>
        <FileUpload label={t('contract').toString()} onChange={setFile} />
        <div className="flex flex-row justify-end gap-3">
          <Button
            type="button"
            label={t('cancel')}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="button"
            label={t('cofirm')}
            className="btn-primary"
            disabled={!file}
            onClick={onConfirm.bind(null, file)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default UploadFileModal;
