import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ArrowDownTrayIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { downloadFile, formatDate } from '../common/utils/utils';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import {
  deleteContractModel,
  getContractModels,
  uploadContractModel,
} from '../services/template/template.api';
import FileUpload from './FileUpload';
import FormInput from './FormInput';
import Modal from './Modal';

// "Template-uri": blank contract models the NGO uploads once and downloads when it needs one.
// VIC does not fill them in or sign them (#486); the signed contract is uploaded with "Încarcă contract".
const ContractModelsModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // a new key empties the drop zone after each upload
  const [uploadKey, setUploadKey] = useState(0);
  const { data: models, isLoading } = useQuery(['contract-models'], getContractModels);
  const refresh = () => queryClient.invalidateQueries(['contract-models']);

  const upload = useMutation(uploadContractModel, {
    onSuccess: () => {
      useSuccessToast(t('models.uploaded'));
      setName('');
      setFile(null);
      setSubmitted(false);
      setUploadKey((key) => key + 1);
      refresh();
    },
    onError: () => useErrorToast(t('models.upload_error')),
  });
  const remove = useMutation(deleteContractModel, {
    onSuccess: () => {
      useSuccessToast(t('models.deleted'));
      refresh();
    },
    onError: () => useErrorToast(t('models.delete_error')),
  });

  const nameError = submitted && name.trim().length < 2 ? t('models.name_required') : undefined;
  const fileError = submitted && !file ? t('models.file_required') : undefined;

  const onUpload = () => {
    setSubmitted(true);
    if (name.trim().length < 2 || !file) return;
    upload.mutate({ name, file });
  };

  return (
    <Modal title={t('models.title')} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-cool-gray-500">{t('models.description')}</p>
        {!isLoading && !models?.length && (
          <p className="text-sm text-cool-gray-500">{t('models.empty')}</p>
        )}
        {!!models?.length && (
          <ul className="flex flex-col gap-2">
            {models.map((model) => (
              <li
                key={model.id}
                className="flex items-center gap-3 rounded-lg border border-cool-gray-200 px-3 py-2"
              >
                <DocumentTextIcon className="w-5 h-5 text-navy shrink-0" aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-robotoMedium text-cool-gray-900">
                    {model.name}
                  </span>
                  <span className="block text-xs text-cool-gray-500">
                    {formatDate(model.createdOn)}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`${t('models.download')} ${model.name}`}
                  className="p-2 rounded-lg text-cool-gray-600 hover:bg-cool-gray-100"
                  onClick={() => downloadFile(model.uri, `${model.name}.pdf`)}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label={`${t('models.delete')} ${model.name}`}
                  className="p-2 rounded-lg text-figure-red hover:bg-cool-gray-100"
                  disabled={remove.isLoading}
                  onClick={() => remove.mutate(model.id)}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-3 border-t border-cool-gray-200 pt-4">
          <h3>{t('models.add')}</h3>
          <FormInput
            label={t('models.name')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            errorMessage={nameError}
          />
          <FileUpload
            key={uploadKey}
            type="pdf"
            label={file ? file.name : t('models.file')}
            hint={t('models.file_hint')}
            maxSize={10 * 1024 * 1024}
            onChange={setFile}
            errorMessage={fileError}
            rejectedMessage={t('models.file_hint')}
          />
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-outline-secondary" onClick={onClose}>
              {t('general:close')}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={upload.isLoading}
              onClick={onUpload}
            >
              {t('models.upload')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ContractModelsModal;
