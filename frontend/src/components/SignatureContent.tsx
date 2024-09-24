import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  IGetDocumentContractResponse,
  ISignDocumentContractBody,
} from '../common/interfaces/document-contract.interface';
import { UseMutateFunction, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingContent from './LoadingContent';
import Button from './Button';

export const SignatureContent = ({
  contract,
  setSidePanelContent,
  signDocumentContract,
  isLoadingSignDocumentContract,
}: {
  contract: IGetDocumentContractResponse | undefined;
  setSidePanelContent: React.Dispatch<React.SetStateAction<number>>;
  signDocumentContract: UseMutateFunction<
    unknown,
    unknown,
    {
      id: string;
      payload: ISignDocumentContractBody;
    },
    unknown
  >;

  isLoadingSignDocumentContract: boolean;
}) => {
  const { t } = useTranslation('document_contract');
  const queryClient = useQueryClient();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleApplySignature = () => {
    if (!signatureRef.current?.isEmpty()) {
      const dataURL = signatureRef.current?.getTrimmedCanvas().toDataURL('image/png');
      signDocumentContract(
        {
          id: contract?.documentId || '',
          payload: { legalRepresentativeSignatureBase64: dataURL || '' },
        },
        {
          onSuccess: () => {
            setSidePanelContent(2);
          },
          onSettled: () => {
            queryClient.invalidateQueries({
              queryKey: ['document-contract', contract?.documentId],
            });
            queryClient.invalidateQueries({ queryKey: ['documents-contracts'] });
          },
        },
      );
    } else {
      setSignatureError(t('sign.error.empty_signature'));
    }
  };

  const handleStrokeEnd = () => {
    setSignatureError(null);
  };

  return (
    <div className="flex flex-col gap-6 sm:text-left px-6">
      <div className="flex flex-row items-center gap-4">
        <button
          className="bg-white rounded-md text-cool-gray-900 hover:text-cool-gray-500 focus:outline-none focus:shadow-blue"
          onClick={() => setSidePanelContent(0)}
          aria-label="close-modal"
          type="button"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h3 className="sm:text-lg lg:text-xl leading-6 font-robotoBold truncate">
          {`${t('sign.title', { value: contract?.documentNumber })}`}
        </h3>
      </div>

      <p>{t('sign.warning')}</p>
      <p>{t('sign.draw')}</p>

      {isLoadingSignDocumentContract ? (
        <div className="w-[400px] h-[150px] flex justify-center items-center">
          <LoadingContent />
        </div>
      ) : (
        <div className="w-full h-40 flex justify-center items-center">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              width: 400,
              height: 150,
              style: {
                border: signatureError ? '1px solid red' : '1px solid lightgray',
                borderRadius: 8,
              },
            }}
            onEnd={handleStrokeEnd}
          />
        </div>
      )}

      {signatureError && <p className="text-sm text-red-500 mt-[-1rem]">{signatureError}</p>}
      <p className="text-sm text-cool-gray-500">{t('sign.confirm')}</p>
      <div className="flex flex-row gap-4 justify-end">
        <Button
          label={t('sign.actions.reset')}
          onClick={handleClearSignature}
          className="btn-outline-secondary"
          icon={<XMarkIcon className="h-5 w-5" />}
        />
        <Button
          label={t('sign.actions.apply')}
          onClick={handleApplySignature}
          disabled={isLoadingSignDocumentContract}
          className="btn-primary"
          icon={<CheckIcon className="h-5 w-5" />}
        />
      </div>
    </div>
  );
};
