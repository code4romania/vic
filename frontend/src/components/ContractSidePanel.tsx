import { ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { ContractStatusMarkerColorMapper, downloadFile, formatDate } from '../common/utils/utils';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Button from './Button';
import FormReadOnlyElement from './FormReadOnlyElement';
import LoadingContent from './LoadingContent';
import RejectTextareaModal from './RejectTextareaModal';
import SidePanel from './SidePanel';
import {
  useApproveContractMutation,
  useContractQuery,
  useRejectContractMutation,
} from '../services/contracts/contracts.service';
import StatusWithMarker from './StatusWithMarker';
import { ContractStatus } from '../common/enums/contract-status.enum';
import { useTranslation } from 'react-i18next';
import UploadFileModal from './UploadFileModal';

interface ContractSidePanelProps {
  isOpen: boolean;
  onClose: (shouldRefetch?: boolean) => void;
  contractId?: string;
}

const ContractSidePanel = ({ isOpen, onClose, contractId }: ContractSidePanelProps) => {
  // translations
  const { t } = useTranslation('documents');
  // navigation
  const navigate = useNavigate();
  // reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  // aprove modal state
  const [isConfirmAndSignContractModalOpen, setIsConfirmAndSignContractModalOpen] =
    useState<boolean>(false);

  // mutations
  const { mutateAsync: approveContract, isLoading: isApproveLoading } =
    useApproveContractMutation();
  const { mutateAsync: rejectContract, isLoading: isRejectLoading } = useRejectContractMutation();
  // get one query
  const {
    data: contract,
    error: contractError,
    isFetching: isLoadingContract,
  } = useContractQuery(contractId as string);

  // query error handling
  useEffect(() => {
    if (contractError) {
      // throw error and close side panel
      useErrorToast(
        InternalErrors.CONTRACT_ERRORS.getError(contractError.response?.data.code_error),
      );
      onClose();
    }
  }, [contractError]);

  const onVolunteerClick = () => {
    if (contract) navigate(`/volunteers/${contract.volunteer.id}`);
  };

  const onGeneratedByClick = () => {
    if (contract) navigate(`/actions-archive?author=${contract.createdBy?.name}`);
  };

  const onRejectedByClick = () => {
    if (contract?.rejectedBy) navigate(`/actions-archive?author=${contract.rejectedBy?.name}`);
  };

  const onTemplateClick = () => {
    if (contract) navigate(`/documents/contracts/${contract.template.id}/edit`);
  };

  const onApprove = (contract?: File) => {
    if (!contract) return;

    // close modal
    setIsConfirmAndSignContractModalOpen(false);

    // approve contract
    approveContract(
      {
        id: contractId as string,
        contract,
      },
      {
        onSuccess: () => {
          useSuccessToast(t('contract.submit.confirm'));
          onClose(true);
        },
        onError: (error) => {
          useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
        },
      },
    );
  };

  const onConfirmRejectModal = (rejectMessage?: string) => {
    if (contract)
      rejectContract(
        { id: contract?.id, rejectMessage },
        {
          onSuccess: () => {
            useSuccessToast(t('contract.submit.reject'));
            onClose(true);
          },
          onError: (error) => {
            useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
          },
          onSettled: () => {
            setIsRejectModalOpen(false);
          },
        },
      );
  };

  const onCloseSidePanel = () => {
    onClose(false);
  };

  const onDownloadContractClick = (uri: string, fileName: string) => {
    downloadFile(uri, fileName);
  };

  const isLoading = () => isLoadingContract && isApproveLoading && isRejectLoading;

  return (
    <SidePanel isOpen={isOpen} onClose={onCloseSidePanel}>
      {isLoading() && <LoadingContent />}
      {contract && !isLoading() && (
        <>
          <div className="flex justify-between items-center text-center sm:text-left px-6">
            <div className="flex gap-3 items-center">
              <h3 className="sm:text-lg lg:text-xl leading-6 font-robotoBold truncate">
                {`${t('general:contract')} ${contract?.contractNumber}`}
              </h3>
              {contract?.status !== ContractStatus.PENDING_VOLUNTEER && (
                <button
                  className="bg-white rounded-md text-turquoise-500 hover:text-turquoise-700 focus:outline-none focus:shadow-blue"
                  onClick={onDownloadContractClick.bind(null, contract.uri, contract.fileName)}
                  aria-label="download-contract"
                  type="button"
                >
                  <ArrowDownTrayIcon className="h-6 w-6" strokeWidth={2.5} />
                </button>
              )}
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
              value={contract.volunteer.name}
              onClick={onVolunteerClick}
            />
            <div className="flex gap-2.5 flex-col">
              <small className="text-cool-gray-500">{t('general:status')}</small>
              <StatusWithMarker markerColor={ContractStatusMarkerColorMapper[contract.status]}>
                {t(`contract.status.${contract.status}`)}
              </StatusWithMarker>
            </div>
            <FormReadOnlyElement
              label={t('contract.period')}
              value={`${formatDate(contract.startDate, 'dd/MM/yyy')} - ${formatDate(
                contract.endDate,
                'dd/MM/yyy',
              )}`}
            />
            {(contract?.status === ContractStatus.PENDING_VOLUNTEER ||
              contract?.status === ContractStatus.REJECTED) && (
              <FormReadOnlyElement
                label={t('contract.signed')}
                value={`${t('general:unspecified')}`}
              />
            )}
            <FormReadOnlyElement
              label={t('contract.template')}
              value={contract.template?.name || '-'}
              onClick={contract.template && onTemplateClick}
            />
            <hr />
            <FormReadOnlyElement
              label={t('contract.generated_by')}
              value={contract.createdBy.name}
              onClick={onGeneratedByClick}
            />
            <FormReadOnlyElement
              label={t('contract.generated_on')}
              value={formatDate(contract.createdOn, 'dd/MM/yyy')}
            />
            {(contract.status === ContractStatus.ACTIVE ||
              contract.status === ContractStatus.NOT_STARTED ||
              contract.status === ContractStatus.CLOSED) && (
              <FormReadOnlyElement
                label={t('contract.approved_on')}
                value={formatDate(contract.approvedOn, 'dd/MM/yyy')}
              />
            )}
            {contract.status === ContractStatus.REJECTED && (
              <>
                <FormReadOnlyElement
                  label={t('contract.rejected_by')}
                  value={contract.rejectedBy?.name}
                  onClick={onRejectedByClick}
                />
                <FormReadOnlyElement
                  label={t('contract.rejected_on')}
                  value={formatDate(contract.rejectedOn)}
                />
                <FormReadOnlyElement label={t('general:reason')} value={contract.rejectionReason} />
              </>
            )}
          </div>
          {contract.status === ContractStatus.PENDING_ADMIN && (
            <footer className="p-6 flex flex-row-reverse gap-4 border-t w-full xs:max-w-xs sm:max-w-md fixed bottom-0 right-0 bg-white">
              <Button
                label={t('contract.actions.confirm')}
                className="btn-primary"
                onClick={setIsConfirmAndSignContractModalOpen.bind(null, true)}
                aria-label={`${t('contract.actions.confirm')}`}
                icon={<CheckIcon className="h-5 w-5" />}
                type="button"
              />
              <Button
                label={t('contract.actions.reject')}
                className="btn-outline-secondary"
                onClick={setIsRejectModalOpen.bind(null, true)}
                aria-label={`${t('contract.actions.reject')}`}
                icon={<XMarkIcon className="h-5 w-5" />}
                type="button"
              />
            </footer>
          )}
        </>
      )}
      {isRejectModalOpen && (
        <RejectTextareaModal
          label={t('contract.reject_modal.description')}
          title={t('contract.reject_modal.title')}
          onClose={setIsRejectModalOpen.bind(null, false)}
          onConfirm={onConfirmRejectModal}
          secondaryBtnLabel={`${t('contract.actions.reject_no_message')}`}
          primaryBtnLabel={`${t('contract.actions.reject')}`}
          primaryBtnClassName="btn-danger"
        />
      )}
      {isConfirmAndSignContractModalOpen && (
        <UploadFileModal
          description={t('contract.upload.description')}
          title={t('contract.upload.title')}
          onClose={setIsConfirmAndSignContractModalOpen.bind(null, false)}
          onConfirm={onApprove}
        />
      )}
    </SidePanel>
  );
};

export default ContractSidePanel;
