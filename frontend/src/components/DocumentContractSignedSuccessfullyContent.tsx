import { XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';

export const DocumentContractSignedSuccessfullyContent = ({
  onCloseSidePanel,
  setSidePanelContent,
}: {
  contractId: string;
  onCloseSidePanel: () => void;
  setSidePanelContent: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation('document_contract');

  const handleSeeContractDetails = () => {
    //display the contract details content
    setSidePanelContent(0);
  };

  return (
    <div className="flex flex-col px-6 gap-4">
      <div className="flex flex-row items-center gap-4 ">
        <button
          className="bg-white rounded-md text-cool-gray-900 hover:text-cool-gray-500 focus:outline-none focus:shadow-blue"
          onClick={onCloseSidePanel}
          aria-label="close-modal"
          type="button"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="sm:text-lg lg:text-xl leading-6 font-robotoBold truncate">
          {t('sign.success.title')}
        </h3>
      </div>

      <p>{t('sign.success.description')}</p>
      <Button
        label={t('sign.success.see_contract_details')}
        className="btn-primary mt-4 self-baseline"
        onClick={handleSeeContractDetails}
      />
    </div>
  );
};
