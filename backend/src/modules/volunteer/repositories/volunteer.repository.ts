import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { FindOptionsWhere, Repository } from 'typeorm';
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
        ...(findOptions.locationId
          ? {
              user: {
                locationId: findOptions.locationId,
              },
            }
          : {}),
      },
      // TODO: map age
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
          volunteerProfile: true,
          user: true,
          organization: true,
        },
        rangeColumn: 'createdOn',
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
        volunteerProfile: true,
        archivedBy: true,
        blockedBy: true,
        organization: true,
        user: true,
      },
    });

    return VolunteerModelTransformer.fromEntity(volunteer);
  }
}
