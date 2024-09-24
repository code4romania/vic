import React, { useState } from 'react';
import LoadingContent from './LoadingContent';
import SidePanel from './SidePanel';
import {
  useGetDocumentContractQuery,
  useSignDocumentContractMutation,
} from '../services/document-contracts/document-contracts.service';
import { ContractInfoContent } from './ContractInfoContent';
import { SignatureContent } from './SignatureContent';
import { DocumentContractSignedSuccessfullyContent } from './DocumentContractSignedSuccessfullyContent';

interface ContractSidePanelProps {
  isOpen: boolean;
  onClose: (shouldRefetch?: boolean) => void;
  contractId?: string;
}

const ContractSidePanel = ({ isOpen, onClose, contractId }: ContractSidePanelProps) => {
  const [sidePanelContent, setSidePanelContent] = useState<number>(0);

  const { data: contract, isLoading: isLoadingContract } = useGetDocumentContractQuery(
    contractId as string,
  );
  const { mutate: signDocumentContract, isLoading: isLoadingSignDocumentContract } =
    useSignDocumentContractMutation();

  const onCloseSidePanel = () => {
    setSidePanelContent(0);
    onClose(false);
  };

  const renderPanelContent = () => {
    switch (sidePanelContent) {
      case 0:
        if (contract)
          return (
            <ContractInfoContent
              contract={contract}
              onCloseSidePanel={onCloseSidePanel}
              setSidePanelContent={setSidePanelContent}
            />
          );
        return;
      case 1:
        return (
          <SignatureContent
            contract={contract}
            setSidePanelContent={setSidePanelContent}
            signDocumentContract={signDocumentContract}
            isLoadingSignDocumentContract={isLoadingSignDocumentContract}
          />
        );
      case 2:
        return (
          <DocumentContractSignedSuccessfullyContent
            contractId={contractId || ''}
            onCloseSidePanel={onCloseSidePanel}
            setSidePanelContent={setSidePanelContent}
          />
        );
    }
  };

  return (
    <SidePanel isOpen={isOpen} onClose={onCloseSidePanel}>
      {isLoadingContract && <LoadingContent />}
      {contract && !isLoadingContract && renderPanelContent()}
    </SidePanel>
  );
};

export default ContractSidePanel;
