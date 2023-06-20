import { ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { ContractStatusMarkerColorMapper, formatDate } from '../common/utils/utils';
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

interface ContractSidePanelProps {
  isOpen: boolean;
  onClose: (shouldRefetch?: boolean) => void;
  contractId?: string;
}

const ContractSidePanel = ({ isOpen, onClose, contractId }: ContractSidePanelProps) => {
  // translations
  const { t } = useTranslation('documents');

  const navigate = useNavigate();

  // reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);

  // mutations
  const { mutateAsync: approveContract, isLoading: isApproveLoading } =
    useApproveContractMutation();

  const { mutateAsync: rejectContract, isLoading: isRejectLoading } = useRejectContractMutation();
  // get one query
  const { data: contract, error: contractError } = useContractQuery(contractId as string);

  // query error handling
  useEffect(() => {
    if (contractError)
      useErrorToast(
        InternalErrors.CONTRACT_ERRORS.getError(contractError.response?.data.code_error),
      );
  }, [contractError]);

  const onVolunteerClick = () => {
    if (contract) navigate(`/volunteers/${contract.volunteer.id}`);
  };

  const onGeneratedByClick = () => {
    if (contract) navigate(`/actions-archive?author=${contract.createdBy?.name}`);
  };

  const onRejectedByClick = () => {
    if (contract?.rejectedBy) navigate(`/${contract.rejectedBy.id}`);
  };

  const onTemplateClick = () => {
    if (contract) navigate(`/documents/contracts/${contract.template.id}/edit`);
  };

  const onApprove = (id: string) => {
    approveContract(id, {
      onSuccess: () => {
        useSuccessToast(t('documents:contracts.form.submit.messages.confirm'));
        onClose(true);
      },
      onError: (error) => {
        useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  const onConfirmRejectModal = (rejectMessage?: string) => {
    if (contract)
      rejectContract(
        { id: contract?.id, rejectMessage },
        {
          onSuccess: () => {
            useSuccessToast(t('documents:contracts.form.submit.messages.reject'));
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

  const onDownloadContractClick = () => {
    alert('not yet implemented');
  };

  return (
    <SidePanel isOpen={isOpen} onClose={onCloseSidePanel}>
      <div className="flex justify-between items-center text-center sm:text-left px-6">
        <div className="flex gap-3 items-center">
          <h3 className="sm:text-lg lg:text-xl leading-6 font-robotoBold truncate">
            {`${t('general:contract')} ${contract?.contractNumber}`}
          </h3>
          {!(
            contract?.status === ContractStatus.REJECTED ||
            contract?.status === ContractStatus.PENDING_VOLUNTEER
          ) && (
            <button
              className="bg-white rounded-md text-turquoise-500 hover:text-turquoise-700 focus:outline-none focus:shadow-blue"
              onClick={onDownloadContractClick}
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
      {(isApproveLoading || isRejectLoading) && <LoadingContent />}
      {contract && !isApproveLoading && !isRejectLoading && (
        <>
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
              value={`${formatDate(contract.startDate)} - ${formatDate(contract.endDate)}`}
            />
            {!(
              contract?.status === ContractStatus.REJECTED ||
              contract?.status === ContractStatus.PENDING_VOLUNTEER
            ) && (
              <FormReadOnlyElement
                label={t('contract.signed')}
                value={`${t('general:unspecified')}`}
              />
            )}
            <FormReadOnlyElement
              label={t('contract.template')}
              value={contract.template.name}
              onClick={onTemplateClick}
            />
            <hr />
            <FormReadOnlyElement
              label={t('contract.generated_by')}
              value={contract.createdBy.name}
              onClick={onGeneratedByClick}
            />
            <FormReadOnlyElement
              label={t('contract.generated_on')}
              value={formatDate(contract.createdOn)}
            />
            {contract.approvedOn && (
              <FormReadOnlyElement
                label={t('contract.approved_on')}
                value={formatDate(contract.approvedOn)}
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
          <footer className="p-6 flex flex-row-reverse gap-4 border-t w-full  fixed bottom-0 right-0 bg-white">
            {contract.status === ContractStatus.PENDING_ADMIN && (
              <>
                <Button
                  label={t('contract.actions.confirm')}
                  className="btn-primary"
                  onClick={onApprove.bind(null, contract.id)}
                  aria-label={`${t('contract.actions.confirm')}`}
                  icon={<CheckIcon className="h-5 w-5" />}
                  type="button"
                />
                <Button
                  label={t('contract.actions.reject')}
                  className="btn-outline-secondary"
                  onClick={setIsRejectModalOpen.bind(null, true)}
                  aria-label={`${t('dcontract.actions.reject')}`}
                  icon={<XMarkIcon className="h-5 w-5" />}
                  type="button"
                />
              </>
            )}
          </footer>
        </>
      )}
      {isRejectModalOpen && (
        <RejectTextareaModal
          label={t('documents:contracts.reject_modal.description')}
          title={t('documents:contracts.reject_modal.title')}
          onClose={setIsRejectModalOpen.bind(null, false)}
          onConfirm={onConfirmRejectModal}
          secondaryBtnLabel={`${t('documents:contracts.reject_modal.send')}`}
          primaryBtnLabel={`${t('documents:contracts.side_panel.reject')}`}
          primaryBtnClassName="btn-danger"
        />
      )}
    </SidePanel>
  );
};

export default ContractSidePanel;
