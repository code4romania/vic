import { InjectRepository } from '@nestjs/typeorm';
import { format, subYears } from 'date-fns';
import { DATE_CONSTANTS } from 'src/common/constants/constants';
import { AgeRangeEnum } from 'src/common/enums/age-range.enum';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { VolunteerEntity } from '../entities/volunteer.entity';
import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { IVolunteerRepository } from '../intefaces/volunteer-repository.interface';
import {
  CountVolunteerOptions,
  CreateVolunteerOptions,
  FindManyVolunteersOptions,
  FindVolunteerOptions,
  IVolunteerModel,
  IVolunteerStats,
  UpdateVolunteerOptions,
  VolunteerModelTransformer,
} from '../model/volunteer.model';
import { ContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { ActivityLogStatus } from 'src/modules/activity-log/enums/activity-log-status.enum';
import { ContractEntity } from 'src/modules/documents/entities/contract.entity';
import { ActivityLogEntity } from 'src/modules/activity-log/entities/activity-log.entity';
import { VolunteerProfileEntity } from '../entities/volunteer-profile.entity';

export class VolunteerRepositoryService
  extends RepositoryWithPagination<VolunteerEntity>
  implements IVolunteerRepository
{
  constructor(
    @InjectRepository(VolunteerEntity)
    private readonly volunteerRepository: Repository<VolunteerEntity>,
    @InjectRepository(VolunteerProfileEntity)
    private readonly volunteerProfileRepository: Repository<VolunteerProfileEntity>,
  ) {
    super(volunteerRepository);
  }

  public async findAll(
    options: FindVolunteerOptions,
  ): Promise<IVolunteerModel[]> {
    const volunteers = await this.volunteerRepository.find({
      where: options,
      relations: { organization: true },
    });
    return volunteers.map(VolunteerModelTransformer.fromEntity);
  }

  async findMany(
    findOptions: FindManyVolunteersOptions,
  ): Promise<Pagination<IVolunteerModel>> {
    const {
      orderBy,
      orderDirection,
      organizationId,
      status,
      search,
      branch,
      department,
      role,
      city,
      county,
      age,
      activeSinceStart,
      activeSinceEnd,
    } = findOptions;

    let query = this.volunteerRepository
      .createQueryBuilder('volunteer')
      .leftJoinAndMapOne(
        'volunteer.volunteerProfile',
        'volunteer.volunteerProfile',
        'volunteerProfile',
      )
      .leftJoinAndMapOne(
        'volunteerProfile.branch',
        'volunteerProfile.branch',
        'branch',
      )
      .leftJoinAndMapOne(
        'volunteerProfile.role',
        'volunteerProfile.role',
        'role',
      )
      .leftJoinAndMapOne(
        'volunteerProfile.department',
        'volunteerProfile.department',
        'department',
      )
      .leftJoinAndMapOne('volunteer.user', 'volunteer.user', 'user')
      .leftJoinAndMapOne('user.location', 'user.location', 'location')
      .leftJoinAndMapOne('location.county', 'location.county', 'county')
      .leftJoinAndMapOne(
        'volunteer.organization',
        'volunteer.organization',
        'organization',
      )
      .leftJoinAndMapOne(
        'volunteer.blockedBy',
        'volunteer.blockedBy',
        'blockedBy',
      )
      .leftJoinAndMapOne(
        'volunteer.archivedBy',
        'volunteer.archivedBy',
        'archivedBy',
      )
      .select()
      .where(
        'volunteer.organizationId = :organizationId AND status = :status',
        { organizationId, status },
      )
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'volunteer'),
        orderDirection || OrderDirection.ASC,
      );

    // map search query
    if (search) {
      query.andWhere(
        this.buildBracketSearchQuery(
          ['user.name', 'volunteerProfile.email', 'user.phone'],
          search,
        ),
      );
    }

    // branch
    if (branch) {
      query.andWhere('branch.name = :branch', { branch });
    }

    // department
    if (department) {
      query.andWhere('department.name = :department', {
        department,
      });
    }

    // branch
    if (role) {
      query.andWhere('role.name = :role', { role });
    }

    // location
    if (city && county) {
      query.andWhere(
        'location.name = :city AND county.abbreviation = :county',
        {
          city,
          county,
        },
      );
    }

    // birthday/age
    if (age) {
      query = this.addAgeRangeConditionToQuery(query, age);
    }

    // range
    if (activeSinceStart) {
      query = this.addRangeConditionToQuery(
        query,
        'volunteerProfile.activeSince',
        activeSinceStart,
        activeSinceEnd,
      );
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      VolunteerModelTransformer.fromEntity,
    );
  }

  async findAllActiveByDepartmentIds(
    organizationId: string,
    departmentIds?: string[],
  ): Promise<IVolunteerModel[]> {
    const volunteers = await this.volunteerRepository.find({
      where: {
        status: VolunteerStatus.ACTIVE,
        organizationId,
        ...(departmentIds && departmentIds.length > 0
          ? {
              volunteerProfile: {
                departmentId: In(departmentIds),
              },
            }
          : {}),
      },
      relations: {
        volunteerProfile: true,
        user: {
          notificationsSettings: true,
        },
      },
    });

    return volunteers.map(VolunteerModelTransformer.fromEntity);
  }

  async update({
    id,
    ...updates
  }: UpdateVolunteerOptions): Promise<IVolunteerModel> {
    const toUpdate = await this.volunteerRepository.preload({ id, ...updates });

    if (!toUpdate) return null;

    await this.volunteerRepository.save(toUpdate);

    return this.find({ id });
  }

  async create(newVolunteer: CreateVolunteerOptions): Promise<IVolunteerModel> {
    const volunteer = await this.volunteerRepository.save(
      VolunteerModelTransformer.toEntity(newVolunteer),
    );

    return this.find({ id: volunteer.id });
  }

  async find(options: FindVolunteerOptions): Promise<IVolunteerModel> {
    // TODO: how and where to write a FindOptions to EntityWhereOptions mapper?
    const volunteer = await this.volunteerRepository.findOne({
      where: options,
      relations: {
        volunteerProfile: {
          branch: true,
          department: true,
          role: true,
        },
        user: {
          location: {
            county: true,
          },
          notificationsSettings: true,
        },
        archivedBy: true,
        blockedBy: true,
        organization: true,
      },
    });

    return VolunteerModelTransformer.fromEntity(volunteer);
  }

  async findVolunteerWithOngStats(
    volunteerId: string,
  ): Promise<IVolunteerStats> {
    const queryBuilder = this.volunteerRepository
      .createQueryBuilder('volunteer')
      .select('volunteer.id', 'volunteerId')
      .addSelect('volunteerProfile.id', 'volunteerProfileId')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(contract.id)', 'contractCount')
          .from(ContractEntity, 'contract')
          .where('contract.volunteerId = :volunteerId', { volunteerId })
          .andWhere('contract.status IN (:...statuses)', {
            statuses: [
              ContractStatus.PENDING_ADMIN,
              ContractStatus.PENDING_VOLUNTEER,
            ],
          });
      }, 'contractCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(activityLog.id)', 'activityLogCount')
          .from(ActivityLogEntity, 'activityLog')
          .where('activityLog.volunteerId = :volunteerId', { volunteerId })
          .andWhere('activityLog.status = :status', {
            status: ActivityLogStatus.PENDING,
          });
      }, 'activityLogCount')
      .leftJoin('volunteer.volunteerProfile', 'volunteerProfile')
      .where('volunteer.id = :volunteerId', { volunteerId });

    return await queryBuilder.getRawOne();
  }

  async count(options: CountVolunteerOptions): Promise<number> {
    const { departmentIds, ...filters } = options;
    return this.volunteerRepository.count({
      where: {
        ...filters,
        ...(departmentIds?.length
          ? {
              volunteerProfile: {
                departmentId: In(departmentIds),
              },
            }
          : {}),
      },
    });
  }

  async softDeleteManyAndProfiles(
    userId: string,
  ): Promise<{ deletedProfiles: string[]; deletedVolunteers: string[] }> {
    const volunteerRecords = await this.volunteerRepository.find({
      where: { userId },
      relations: { volunteerProfile: true },
    });

    // Anonimize emails before soft delete
    await this.volunteerProfileRepository.update(
      volunteerRecords.map((v) => v.volunteerProfile.id),
      {
        email: `account-deleted@${new Date().getTime()}.ro`,
      },
    );

    // Soft Delete all associated profiles
    const deletedProfiles = await this.volunteerProfileRepository.softRemove(
      volunteerRecords.map((v) => v.volunteerProfile),
    );

    const deletedVolunteerRecords = await this.volunteerRepository.softRemove(
      volunteerRecords,
    );

    return {
      deletedProfiles: deletedProfiles.map((dp) => dp.id),
      deletedVolunteers: deletedVolunteerRecords.map((dvr) => dvr.id),
    };
  }

  private addAgeRangeConditionToQuery(
    query: SelectQueryBuilder<VolunteerEntity>,
    ageRange: AgeRangeEnum,
  ): SelectQueryBuilder<VolunteerEntity> {
    switch (ageRange) {
      case AgeRangeEnum['0_18']:
        query.andWhere('user.birthday >= :date', {
          date: format(subYears(new Date(), 18), DATE_CONSTANTS.YYYY_MM_DD),
        });
        break;
      case AgeRangeEnum['18_30']:
        query.andWhere('user.birthday BETWEEN :startAge AND :endAge', {
          startAge: format(subYears(new Date(), 30), DATE_CONSTANTS.YYYY_MM_DD),
          endAge: format(subYears(new Date(), 19), DATE_CONSTANTS.YYYY_MM_DD),
        });
        break;
      case AgeRangeEnum['30_50']:
        query.andWhere('user.birthday BETWEEN :startAge AND :endAge', {
          startAge: format(subYears(new Date(), 50), DATE_CONSTANTS.YYYY_MM_DD),
          endAge: format(subYears(new Date(), 31), DATE_CONSTANTS.YYYY_MM_DD),
        });
        break;
      case AgeRangeEnum['OVER_50']:
        query.andWhere('user.birthday <= :date', {
          date: format(subYears(new Date(), 50), DATE_CONSTANTS.YYYY_MM_DD),
        });
        break;
    }

    return query;
  }
}
