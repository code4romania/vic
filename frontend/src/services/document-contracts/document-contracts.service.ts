import { useMutation } from 'react-query';
import { addDocumentContract } from './document-contracts.api';
import { IAddDocumentContractDTO } from '../../common/interfaces/document-contract.interface';

export const useAddDocumentContractMutation = () => {
  return useMutation((payload: IAddDocumentContractDTO) => addDocumentContract(payload), {
    onError: (error) => Promise.resolve(error),
  });
};
