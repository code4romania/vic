import { InjectRepository } from '@nestjs/typeorm';
import { format, subYears } from 'date-fns';
import { DATE_CONSTANTS } from 'src/common/constants/constants';
import { AgeRangeEnum } from 'src/common/enums/age-range.enum';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import {
  Between,
  FindManyOptions,
  FindOperator,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { VolunteerEntity } from '../entities/volunteer.entity';
import { IVolunteerRepository } from '../intefaces/volunteer-repository.interface';
import {
  CreateVolunteerOptions,
  FindManyVolunteersOptions,
  FindVolunteerOptions,
  IVolunteerModel,
  UpdateVolunteerOptions,
  VolunteerModelTransformer,
} from '../model/volunteer.model';

export class VolunteerRepositoryService
  extends RepositoryWithPagination<VolunteerEntity>
  implements IVolunteerRepository
{
  constructor(
    @InjectRepository(VolunteerEntity)
    private readonly volunteerRepository: Repository<VolunteerEntity>,
  ) {
    super(volunteerRepository);
  }

  async findMany(
    findOptions: FindManyVolunteersOptions,
  ): Promise<Pagination<IVolunteerModel>> {
    const options: {
      filters: FindOptionsWhere<VolunteerEntity>;
    } & IBasePaginationFilterModel = {
      ...findOptions,
      filters: {
        organizationId: findOptions.organizationId,
        status: findOptions.status,
        ...(findOptions.branchId ||
        findOptions.departmentId ||
        findOptions.roleId
          ? {
              volunteerProfile: {
                ...(findOptions.branchId
                  ? { branchId: findOptions.branchId }
                  : {}),
                ...(findOptions.departmentId
                  ? { departmentId: findOptions.departmentId }
                  : {}),
                ...(findOptions.roleId ? { roleId: findOptions.roleId } : {}),
              },
            }
          : {}),
        ...(findOptions.locationId || findOptions.age
          ? {
              user: {
                ...(findOptions.locationId
                  ? { locationId: findOptions.locationId }
                  : {}),
                ...(findOptions.age
                  ? {
                      birthday: this.mapAgeRangeToBirthdayFindOptionsOperator(
                        findOptions.age,
                      ),
                    }
                  : {}),
              },
            }
          : {}),
      } as FindOptionsWhere<VolunteerEntity>,
    };

    return this.findManyPaginated<IVolunteerModel>(
      {
        searchableColumns: [
          'user.name',
          'volunteerProfile.email',
          'volunteerProfile.phone',
        ],
        defaultSortBy: 'createdOn',
        defaultOrderDirection: OrderDirection.DESC,
        relations: {
          volunteerProfile: {
            branch: true,
            department: true,
            role: true,
          },
          user: true,
          organization: true,
          blockedBy: true,
          archivedBy: true,
        },
        rangeColumn: 'volunteerProfile.activeSince',
      },
      options,
      VolunteerModelTransformer.fromEntity,
    );
  }

  async update({
    id,
    ...updates
  }: UpdateVolunteerOptions): Promise<IVolunteerModel> {
    await this.volunteerRepository.update({ id }, updates);

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
        archivedBy: true,
        blockedBy: true,
        organization: true,
        user: true,
      },
    });

    return VolunteerModelTransformer.fromEntity(volunteer);
  }

  async count(options: FindManyOptions<VolunteerEntity>): Promise<number> {
    return this.volunteerRepository.count(options);
  }

  async getMany(
    options: FindOptionsWhere<VolunteerEntity>,
  ): Promise<IVolunteerModel[]> {
    const volunteers = await this.volunteerRepository.findBy(options);

    return volunteers.map(VolunteerModelTransformer.fromEntity);
  }

  private mapAgeRangeToBirthdayFindOptionsOperator(
    ageRange: AgeRangeEnum,
  ): FindOperator<string> {
    let findOperator: FindOperator<string>;
    switch (ageRange) {
      case AgeRangeEnum['0_18']:
        findOperator = MoreThanOrEqual(
          format(subYears(new Date(), 18), DATE_CONSTANTS.YYYY_MM_DD),
        );
        break;
      case AgeRangeEnum['18_30']:
        findOperator = Between(
          format(subYears(new Date(), 30), DATE_CONSTANTS.YYYY_MM_DD),
          format(subYears(new Date(), 19), DATE_CONSTANTS.YYYY_MM_DD),
        );
        break;
      case AgeRangeEnum['30_50']:
        findOperator = Between(
          format(subYears(new Date(), 50), DATE_CONSTANTS.YYYY_MM_DD),
          format(subYears(new Date(), 31), DATE_CONSTANTS.YYYY_MM_DD),
        );
        break;
      case AgeRangeEnum['OVER_50']:
        findOperator = LessThanOrEqual(
          format(subYears(new Date(), 50), DATE_CONSTANTS.YYYY_MM_DD),
        );
        break;
    }

    return findOperator;
  }
}
