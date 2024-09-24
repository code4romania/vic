import { IBaseModel } from 'src/common/interfaces/base.model';

export interface IDocumentSignatureModel extends IBaseModel {
  id: string;

  signature: string;

  userId: string;

  createdOn: Date;
  updatedOn: Date;
}

export type CreateSignatureOptions = Pick<
  IDocumentSignatureModel,
  'signature' | 'userId'
>;

export type FindOneSignatureOptions = Partial<
  Pick<IDocumentSignatureModel, 'id' | 'userId'>
>;

export class SignatureModelTransformer {
  public static fromEntity(
    entity: IDocumentSignatureModel,
  ): IDocumentSignatureModel {
    if (!entity) return null;
    return {
      id: entity.id,
      signature: entity.signature,
      userId: entity.userId,
      createdOn: entity.createdOn,
      updatedOn: entity.updatedOn,
    };
  }
}
