import { EntityManager } from 'typeorm';
import {
  CreateAuthIdentityOptions,
  FindAuthIdentityOptions,
  IAuthIdentityModel,
  UpdateAuthIdentityOptions,
  UpsertAuthIdentityResult,
} from '../models/auth-identity.model';

export interface IAuthIdentityRepository {
  find(options: FindAuthIdentityOptions): Promise<IAuthIdentityModel>;
  create(
    options: CreateAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<IAuthIdentityModel>;
  update(
    id: string,
    options: UpdateAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<IAuthIdentityModel>;
  upsert(
    options: CreateAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<UpsertAuthIdentityResult>;
  deleteByUserId(userId: string): Promise<number>;
  findSuperAdmins(): Promise<IAuthIdentityModel[]>;
  findByOrganizationId(organizationId: string): Promise<IAuthIdentityModel[]>;
  deleteUnverifiedMobileBefore(date: Date): Promise<number>;
}
