import { IBaseModel } from 'src/common/interfaces/base.model';

export interface SignatureModel extends IBaseModel {
  id: string;

  signature: string;

  userId: string;

  createdOn: Date;
  updatedOn: Date;
}

export type CreateSignatureOptions = Pick<
  SignatureModel,
  'signature' | 'userId'
>;

export type FindOneSignatureOptions = Partial<
  Pick<SignatureModel, 'id' | 'userId'>
>;
