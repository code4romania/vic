import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateAccessCodeUseCase } from 'src/usecases/access-code/create-access-code.usecase';
import { DeleteAccessCodeUseCase } from 'src/usecases/access-code/delete-access-code.usecase';
import { GetAccessCodeUseCase } from 'src/usecases/access-code/get-access-code.usecase';
import { GetAllAccessCodeUseCase } from 'src/usecases/access-code/get-all-access-codes.usecase';
import { UpdateAccessCodeUseCase } from 'src/usecases/access-code/update-access-code.usecase';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/update-access-code.dto';
import { AccessCodePresenter } from './presenters/access-code.presenter';
import { AccessCodeGuard } from './guards/access-code.guard';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, AccessCodeGuard)
@Controller('access-code')
export class AccessCodeController {
  constructor(
    private readonly createAccessCodeUseCase: CreateAccessCodeUseCase,
    private readonly updateAccessCodeUseCase: UpdateAccessCodeUseCase,
    private readonly deleteAccessCodeUseCase: DeleteAccessCodeUseCase,
    private readonly findAccessCodeUseCase: GetAccessCodeUseCase,
    private readonly findAllAccessCodeUseCase: GetAllAccessCodeUseCase,
  ) {}

  @Get()
  @ApiPaginatedResponse(AccessCodePresenter)
  @ApiQuery({ type: BasePaginationFilterDto })
  async getAll(
    @Query() filters: BasePaginationFilterDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<AccessCodePresenter>> {
    const accessCodes = await this.findAllAccessCodeUseCase.execute({
      ...filters,
      organizationId,
    });

    return new PaginatedPresenter<AccessCodePresenter>({
      ...accessCodes,
      items: accessCodes.items.map(
        (accessCode) => new AccessCodePresenter(accessCode),
      ),
    });
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(
    @Param('id', UuidValidationPipe) accessCodeId: string,
  ): Promise<AccessCodePresenter> {
    const accessCodeModel = await this.findAccessCodeUseCase.execute(
      accessCodeId,
    );
    return new AccessCodePresenter(accessCodeModel);
  }

  @ApiBody({ type: CreateAccessCodeDto })
  @Post()
  async create(
    @Body() { code, startDate, endDate }: CreateAccessCodeDto,
    @ExtractUser() { organizationId, id }: IAdminUserModel,
  ): Promise<AccessCodePresenter> {
    const accessCodeModel = await this.createAccessCodeUseCase.execute({
      code,
      startDate,
      endDate,
      organizationId: organizationId,
      createdById: id,
    });
    return new AccessCodePresenter(accessCodeModel);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateAccessCodeDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) accessCodeId: string,
    @Body() { endDate }: UpdateAccessCodeDto,
  ): Promise<AccessCodePresenter> {
    const accessCodeModel = await this.updateAccessCodeUseCase.execute({
      id: accessCodeId,
      endDate,
    });
    return new AccessCodePresenter(accessCodeModel);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(@Param('id', UuidValidationPipe) id: string): Promise<string> {
    return this.deleteAccessCodeUseCase.execute(id);
  }
}
