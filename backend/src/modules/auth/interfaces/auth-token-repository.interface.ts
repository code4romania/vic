import { EntityManager } from 'typeorm';
import { AuthTokenType } from '../enums/auth.enums';
import {
  CreateAuthTokenOptions,
  IAuthTokenModel,
} from '../models/auth-token.model';

export interface IAuthTokenRepository {
  create(
    options: CreateAuthTokenOptions,
    manager?: EntityManager,
  ): Promise<IAuthTokenModel>;
  findByHash(tokenHash: string): Promise<IAuthTokenModel>;
  findAnyByHash(tokenHash: string): Promise<IAuthTokenModel>;
  findLiveToken(
    identityId: string,
    type: AuthTokenType,
  ): Promise<IAuthTokenModel>;
  replaceLiveTokens(
    identityId: string,
    types: AuthTokenType[],
    manager?: EntityManager,
  ): Promise<number>;
  consume(id: string, manager?: EntityManager): Promise<boolean>;
  incrementAttempts(id: string): Promise<number>;
  findLatest(identityId: string, type: AuthTokenType): Promise<IAuthTokenModel>;
  deleteEndedBefore(date: Date): Promise<number>;
}
