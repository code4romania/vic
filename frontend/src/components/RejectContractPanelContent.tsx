import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import FormTextarea from './FormTextarea';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import { useRejectcontractMutation } from '../services/document-contracts/document-contracts.service';
import { useQueryClient } from 'react-query';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import LoadingContent from './LoadingContent';

export const RejectContractPanelContent = ({
  setSidePanelContent,
  contractId,
}: {
  setSidePanelContent: React.Dispatch<React.SetStateAction<number>>;
  contractId: string;
}) => {
  const { t } = useTranslation('document_contract');
  const queryClient = useQueryClient();
  const { control, watch, handleSubmit, setValue } = useForm();
  const { mutate: rejectDocumentContract, isLoading: isLoadingRejectDocumentContract } =
    useRejectcontractMutation();

  const onSubmit = (formData: FieldValues) => {
    if (!contractId) return;
    if (contractId) {
      rejectDocumentContract(
        {
          id: contractId,
          payload: {
            rejectionReason: formData.rejectReason,
          },
        },
        {
          onSuccess: () => {
            useSuccessToast(t('reject.toast.success'));
            setSidePanelContent(0);
          },
          onError: () => {
            useErrorToast(t('reject.toast.error'));
          },
          onSettled: () => {
            queryClient.invalidateQueries(['documents-contracts']);
            queryClient.invalidateQueries(['document-contract', contractId]);
          },
        },
      );
    }
  };

  return (
    <div className="flex flex-col text-center sm:text-left px-6 gap-4">
      <div className="flex items-center flex-row gap-4">
        <button
          className="bg-white rounded-md hover:text-yellow-500 focus:outline-none focus:shadow-blue"
          onClick={() => setSidePanelContent(0)}
          type="button"
        >
          <ArrowLeftIcon className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <h3 className="sm:text-lg lg:text-xl leading-6 font-robotoBold truncate">
          {t('reject.title')}
        </h3>
      </div>
      <p className="text-sm text-cool-gray-500">{t('reject.description')}</p>

      {isLoadingRejectDocumentContract ? (
        <div className="flex justify-center items-center h-40">
          <LoadingContent />
        </div>
      ) : (
        <>
          <Controller
            name="rejectReason"
            key="rejectReason"
            control={control}
            render={({ field: { onChange, value } }) => {
              return <FormTextarea label="" defaultValue={value} onChange={onChange} />;
            }}
          />
          <div className="flex flex-row gap-4 self-end">
            <Button
              label={t('reject.actions.reject_without_message')}
              className="btn-outline-secondary"
              onClick={() => {
                setValue('rejectReason', '');
                handleSubmit(onSubmit)();
              }}
              aria-label={`${t('contract.actions.reject')}`}
              type="button"
              disabled={isLoadingRejectDocumentContract}
            />

            <Button
              label={t('reject.actions.reject')}
              className="btn-danger"
              onClick={handleSubmit(onSubmit)}
              aria-label={`${t('contract.actions.sign')}`}
              type="button"
              disabled={!watch('rejectReason') || isLoadingRejectDocumentContract}
            />
          </div>
        </>
      )}
    </div>
  );
};
