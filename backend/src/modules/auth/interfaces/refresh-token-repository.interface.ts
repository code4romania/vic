import { EntityManager } from 'typeorm';
import {
  CreateRefreshTokenOptions,
  IRefreshTokenModel,
} from '../models/refresh-token.model';

export interface IRefreshTokenRepository {
  create(
    options: CreateRefreshTokenOptions,
    manager?: EntityManager,
  ): Promise<IRefreshTokenModel>;
  findSessionByHash(tokenHash: string): Promise<IRefreshTokenModel>;
  findSessionByPreviousHash(previousHash: string): Promise<IRefreshTokenModel>;
  rotate(
    id: string,
    currentTokenHash: string,
    newTokenHash: string,
    expiresAt: Date,
    manager?: EntityManager,
  ): Promise<IRefreshTokenModel>;
  revoke(id: string, manager?: EntityManager): Promise<boolean>;
  revokeAllForIdentity(
    identityId: string,
    exceptId?: string,
    manager?: EntityManager,
  ): Promise<number>;
  deleteExpiredOrRevokedBefore(
    expiredBefore: Date,
    revokedBefore?: Date,
  ): Promise<number>;
}
