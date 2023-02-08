import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { CreateAccessCodeUseCase } from 'src/usecases/access-code/create-access-code.usecase';
import { DeleteAccessCodeUseCase } from 'src/usecases/access-code/delete-access-code.usecase';
import { GetAccessCodeUseCase } from 'src/usecases/access-code/get-access-code.usecase';
import { GetAllAccessCodeUseCase } from 'src/usecases/access-code/get-all-access-codes.usecase';
import { UpdateAccessCodeUseCase } from 'src/usecases/access-code/update-access-code.usecase';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/update-access-code.dto';
import { AccessCodePresenter } from './presenters/access-code.presenter';

// @Roles(Role.ADMIN)
// @UseGuards(WebJwtAuthGuard)
// @UsePipes(new UuidValidationPipe())
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
  async getAll(): Promise<AccessCodePresenter[]> {
    const accessCodes = await this.findAllAccessCodeUseCase.execute({
      organizationId: '3631315f-02f1-42c9-a418-8bff2e15fb2d', // TODO: replace with organization from @User request
    });

    return accessCodes.map((accessCode) => new AccessCodePresenter(accessCode));
  }

  @ApiParam({ name: 'accessCodeId', type: 'string' })
  @Get(':accessCodeId')
  async getOne(
    @Param('accessCodeId', UuidValidationPipe) accessCodeId: string,
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
  ): Promise<AccessCodePresenter> {
    const accessCodeModel = await this.createAccessCodeUseCase.execute({
      code,
      startDate,
      endDate,
      organizationId: '3631315f-02f1-42c9-a418-8bff2e15fb2d', // TODO: replace with organization from @User request
      createdById: '6e5ca126-2c04-4403-a641-53345da26ef8', // TODO: replace with user from @User request
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
  async delete(
    @Param('accessCodeId', UuidValidationPipe) accessCodeId: string,
  ): Promise<AccessCodePresenter> {
    const accessCodeModel = await this.deleteAccessCodeUseCase.execute(
      accessCodeId,
    );
    return new AccessCodePresenter(accessCodeModel);
  }
}
