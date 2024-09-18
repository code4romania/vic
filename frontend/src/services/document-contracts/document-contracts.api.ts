import { IAddDocumentContractDTO } from '../../common/interfaces/document-contract.interface';
import API from '../api';

export const addDocumentContract = (data: IAddDocumentContractDTO) => {
  return API.post('/documents/contracts', data).then((res) => res.data);
};
