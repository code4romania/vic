import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { AuthIdentityEntity } from '../entities/auth-identity.entity';
import { AuthRealm } from '../enums/auth.enums';
import { IAuthIdentityRepository } from '../interfaces/auth-identity-repository.interface';
import {
  AuthIdentityTransformer,
  CreateAuthIdentityOptions,
  FindAuthIdentityOptions,
  IAuthIdentityModel,
  UpdateAuthIdentityOptions,
  UpsertAuthIdentityResult,
} from '../models/auth-identity.model';

@Injectable()
export class AuthIdentityRepository implements IAuthIdentityRepository {
  constructor(
    @InjectRepository(AuthIdentityEntity)
    private readonly authIdentityRepository: Repository<AuthIdentityEntity>,
  ) {}

  public async find(
    options: FindAuthIdentityOptions,
  ): Promise<IAuthIdentityModel> {
    return this.findWith(options);
  }

  public async create(
    options: CreateAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<IAuthIdentityModel> {
    const entity = await this.repository(manager).save(
      AuthIdentityTransformer.toEntity(options),
    );

    return this.findWith({ id: entity.id }, manager);
  }

  public async update(
    id: string,
    options: UpdateAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<IAuthIdentityModel> {
    if (!id) return null;

    const toUpdate = { ...options };
    if (toUpdate.email !== undefined) {
      toUpdate.email = AuthIdentityTransformer.normalizeEmail(toUpdate.email);
    }

    await this.repository(manager).update({ id }, toUpdate);

    return this.findWith({ id }, manager);
  }

  public async upsert(
    options: CreateAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<UpsertAuthIdentityResult> {
    const entity = AuthIdentityTransformer.toEntity(options);

    // ON CONFLICT DO NOTHING against the partial unique index (realm, email): a second run changes nothing.
    const result = await this.repository(manager)
      .createQueryBuilder()
      .insert()
      .values(entity)
      .orIgnore()
      .returning(['id'])
      .execute();

    const created = result.raw.length > 0;
    const identity = await this.findWith(
      created
        ? { id: result.raw[0].id }
        : { realm: entity.realm, email: entity.email },
      manager,
    );

    return { identity, created };
  }

  public async registerFailedLogin(
    id: string,
    maxAttempts: number,
    lockUntil: Date,
  ): Promise<IAuthIdentityModel> {
    if (!id) return null;

    // One statement, so concurrent failures cannot skip the lock. Both CASEs read the old failed_attempts.
    await this.authIdentityRepository
      .createQueryBuilder()
      .update()
      .set({
        failedAttempts: () =>
          'CASE WHEN "failed_attempts" + 1 >= :maxAttempts THEN 0 ELSE "failed_attempts" + 1 END',
        lockedUntil: () =>
          'CASE WHEN "failed_attempts" + 1 >= :maxAttempts THEN CAST(:lockUntil AS timestamptz) ELSE "locked_until" END',
      })
      .where('id = :id', { id })
      .setParameters({ maxAttempts, lockUntil })
      .execute();

    return this.findWith({ id });
  }

  public async deleteByUserId(userId: string): Promise<number> {
    if (!userId) return 0;

    // A hard delete, so the foreign keys cascade to tokens, sessions and provider links.
    const result = await this.authIdentityRepository
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId })
      .execute();

    return result.affected ?? 0;
  }

  public async findSuperAdmins(): Promise<IAuthIdentityModel[]> {
    const entities = await this.authIdentityRepository.find({
      where: { realm: AuthRealm.WEB, superAdmin: true },
    });

    return entities.map(AuthIdentityTransformer.fromEntity);
  }

  public async findByOrganizationId(
    organizationId: string,
  ): Promise<IAuthIdentityModel[]> {
    if (!organizationId) return [];

    const entities = await this.authIdentityRepository
      .createQueryBuilder('identity')
      .innerJoin(AdminUserEntity, 'admin', 'admin.id = identity.userId')
      .where('identity.realm = :realm', { realm: AuthRealm.WEB })
      .andWhere('admin.organizationId = :organizationId', { organizationId })
      .getMany();

    return entities.map(AuthIdentityTransformer.fromEntity);
  }

  public async deleteUnverifiedMobileBefore(date: Date): Promise<number> {
    const result = await this.authIdentityRepository
      .createQueryBuilder()
      .delete()
      .where('realm = :realm', { realm: AuthRealm.MOBILE })
      .andWhere('user_id IS NULL')
      .andWhere('email_verified_at IS NULL')
      .andWhere('created_on < :date', { date })
      .execute();

    return result.affected ?? 0;
  }

  private async findWith(
    options: FindAuthIdentityOptions,
    manager?: EntityManager,
  ): Promise<IAuthIdentityModel> {
    // TypeORM drops null or undefined where keys, so { userId: undefined } would match the first row.
    if (Object.values(options).some((value) => !value)) return null;

    const where =
      'email' in options
        ? {
            ...options,
            email: AuthIdentityTransformer.normalizeEmail(options.email),
          }
        : options;

    const entity = await this.repository(manager).findOne({ where });

    return AuthIdentityTransformer.fromEntity(entity);
  }

  private repository(manager?: EntityManager): Repository<AuthIdentityEntity> {
    return manager
      ? manager.getRepository(AuthIdentityEntity)
      : this.authIdentityRepository;
  }
}
