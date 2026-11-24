import { IContractListItem } from '../interfaces/contract-list-item.interface';

/** #727: only PDFs open in the viewer; older Word contracts (#688) are download-only. */
export const isPdfContract = (contract: IContractListItem): boolean =>
  /\.pdf$/i.test(contract.contractFileName ?? '');
