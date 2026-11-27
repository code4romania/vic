import { EntityManager } from 'typeorm';
import { AuthProvider } from '../enums/auth.enums';
import {
  CreateAuthIdentityProviderOptions,
  IAuthIdentityProviderModel,
} from '../models/auth-identity-provider.model';

export interface IAuthIdentityProviderRepository {
  findByProvider(
    provider: AuthProvider,
    subject: string,
  ): Promise<IAuthIdentityProviderModel>;
  findByIdentity(
    identityId: string,
    provider: AuthProvider,
  ): Promise<IAuthIdentityProviderModel>;
  linkProvider(
    options: CreateAuthIdentityProviderOptions,
    manager?: EntityManager,
  ): Promise<IAuthIdentityProviderModel>;
}
