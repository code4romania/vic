import React from 'react';
import { IGetDocumentContractResponse } from '../common/interfaces/document-contract.interface';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowDownTrayIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import FormReadOnlyElement from './FormReadOnlyElement';
import {
  DocumentContractStatusMarkerColorMapper,
  downloadFile,
  formatDate,
} from '../common/utils/utils';
import StatusWithMarker from './StatusWithMarker';
import { DocumentContractStatus } from '../common/enums/document-contract-status.enum';
import Button from './Button';
import { useApproveDocumentContractMutation } from '../services/document-contracts/document-contracts.service';
import Spinner from './Spinner';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { useQueryClient } from 'react-query';

export const ContractInfoContent = ({
  contract,
  onCloseSidePanel,
  setSidePanelContent,
}: {
  contract: IGetDocumentContractResponse;
  onCloseSidePanel: () => void;
  setSidePanelContent: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation('document_contract');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: approveDocumentContract, isLoading: isLoadingApproveDocumentContract } =
    useApproveDocumentContractMutation();

  const onVolunteerClick = () => {
    if (contract) navigate(`/volunteers/${contract.volunteerId}`);
  };

  const onGeneratedByClick = () => {
    if (contract) navigate(`/actions-archive?author=${contract.createdByAdminName}`);
  };

  const onTemplateClick = () => {
    if (contract.documentTemplateId)
      navigate(`/documents/templates/${contract.documentTemplateId}`);
  };

  const handleApproveDocumentContract = () => {
    approveDocumentContract(contract.documentId, {
      onSuccess: () => {
        useSuccessToast(t('approve.success'));
      },
      onError: () => {
        useErrorToast(t('approve.error'));
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['document-contract', contract.documentId] });
        queryClient.invalidateQueries({ queryKey: ['documents-contracts'] });
      },
    });
  };

  //todo: download contract

  return (
    <>
      <div className="flex justify-between items-center text-center sm:text-left px-6">
        <div className="flex gap-3 items-center">
          <h3 className="sm:text-lg lg:text-xl leading-6 font-robotoBold truncate">
            {`${t('general:contract')} ${contract?.documentNumber}`}
          </h3>

          <button
            className="bg-white rounded-md text-turquoise-500 hover:text-turquoise-700 focus:outline-none focus:shadow-blue"
            onClick={() => {
              if (contract.documentFilePath) {
                downloadFile(
                  contract.documentFilePath,
                  contract.documentFilePath?.split('/').pop() || 'contract.pdf',
                );
              }
            }}
            aria-label="download-contract"
            type="button"
          >
            <ArrowDownTrayIcon className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>

        <button
          className="bg-white rounded-md text-cool-gray-900 hover:text-cool-gray-500 focus:outline-none focus:shadow-blue"
          onClick={onCloseSidePanel}
          aria-label="close-modal"
          type="button"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="grow flex flex-col gap-6 pb-24 px-6 overflow-y-auto">
        <FormReadOnlyElement
          label={t('volunteer:name', { status: '' })}
          value={contract.volunteerName}
          onClick={onVolunteerClick}
        />
        <FormReadOnlyElement
          label={t('contract.period')}
          value={`${formatDate(contract.documentStartDate, 'dd/MM/yyy')} - ${formatDate(
            contract.documentEndDate,
            'dd/MM/yyy',
          )}`}
        />
        <div className="flex gap-2.5 flex-col">
          <small className="text-cool-gray-500">{t('general:status')}</small>
          <StatusWithMarker markerColor={DocumentContractStatusMarkerColorMapper[contract.status]}>
            {t(`contract.status.${contract.status}`)}
          </StatusWithMarker>
        </div>

        <FormReadOnlyElement
          label={t('contract.template')}
          value={contract.documentTemplateName || '-'}
          onClick={onTemplateClick}
        />
        <hr />
        <FormReadOnlyElement
          label={t('contract.generated_by')}
          value={contract.createdByAdminName}
          onClick={onGeneratedByClick}
        />
        <FormReadOnlyElement
          label={t('contract.generated_on')}
          value={formatDate(contract.createdOn, 'dd/MM/yyy')}
        />
        {contract.status === DocumentContractStatus.APPROVED && (
          <FormReadOnlyElement
            label={t('contract.signed_on')}
            value={formatDate(contract.updatedOn, 'dd/MM/yyy')}
          />
        )}
        {/* rejection date and reason */}
        {(contract.status === DocumentContractStatus.REJECTED_NGO ||
          contract.status === DocumentContractStatus.REJECTED_VOLUNTEER) && (
            <FormReadOnlyElement
              label={t('contract.rejected_on')}
              value={formatDate(contract.rejectionDate, 'dd/MM/yyy')}
            />
          )}
        {(contract.status === DocumentContractStatus.REJECTED_NGO ||
          contract.status === DocumentContractStatus.REJECTED_VOLUNTEER) && (
            <FormReadOnlyElement
              label={t('contract.rejection_reason')}
              value={
                contract.status === DocumentContractStatus.REJECTED_VOLUNTEER
                  ? t(`contract.rejection.${contract.rejectionReason}`)
                  : contract.rejectionReason || '-'
              }
            />
          )}
      </div>
      {contract.status === DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE && (
        <footer className="p-6 flex flex-row-reverse gap-4 border-t w-full xs:max-w-xs sm:max-w-md fixed bottom-0 right-0 bg-white">
          <Button
            label={t('contract.actions.sign')}
            className="btn-primary"
            onClick={() => setSidePanelContent(1)}
            aria-label={`${t('contract.actions.sign')}`}
            icon={<CheckIcon className="h-5 w-5" />}
            type="button"
          />
          <Button
            label={t('contract.actions.reject')}
            className="btn-outline-secondary"
            onClick={() => setSidePanelContent(3)}
            aria-label={`${t('contract.actions.reject')}`}
            icon={<XMarkIcon className="h-5 w-5" />}
            type="button"
          />
        </footer>
      )}
      {contract.status === DocumentContractStatus.PENDING_APPROVAL_NGO && (
        <footer className="p-6 flex flex-row-reverse gap-4 border-t w-full xs:max-w-xs sm:max-w-md fixed bottom-0 right-0 bg-white">
          <Button
            label={t('contract.actions.send_to_signing')}
            className="btn-primary"
            onClick={handleApproveDocumentContract}
            aria-label={`${t('contract.actions.sign')}`}
            icon={
              isLoadingApproveDocumentContract ? (
                <Spinner className="h-5 w-5 fill-black" />
              ) : (
                <CheckIcon className="h-5 w-5" />
              )
            }
            disabled={isLoadingApproveDocumentContract}
            type="button"
          />
          <Button
            label={t('contract.actions.reject')}
            className="btn-outline-secondary"
            onClick={() => setSidePanelContent(3)}
            aria-label={`${t('contract.actions.reject')}`}
            icon={<XMarkIcon className="h-5 w-5" />}
            type="button"
            disabled={isLoadingApproveDocumentContract}
          />
        </footer>
      )}
    </>
  );
};
