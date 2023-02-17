import {
  IAccessCodeModel,
  ICreateAccessCodeModel,
  IFindAccessCodeModel,
  IUpdateAccessCodeModel,
} from '../models/access-code.model';

export interface IAccessCodeRepository {
  create(newAccessCode: ICreateAccessCodeModel): Promise<IAccessCodeModel>;
  update(updateAccessCode: IUpdateAccessCodeModel): Promise<IAccessCodeModel>;
  find(findOptions: IFindAccessCodeModel): Promise<IAccessCodeModel>;
  delete(id: string): Promise<string>;
}
