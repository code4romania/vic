import { Body, Delete, Param, UseGuards } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AccessRequestPresenter } from 'src/api/access-request/presenters/access-request.presenter';
import { CreateAccessRequestUseCase } from 'src/usecases/access-request/create-access-request.usecase';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { CancelAccessRequestUsecase } from 'src/usecases/access-request/cancel-access-request.usecase';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('mobile/access-request')
export class MobileAccessRequestController {
  constructor(
    private readonly createAccessRequestUseCase: CreateAccessRequestUseCase,
    private readonly cancelAccessRequestUsecase: CancelAccessRequestUsecase,
  ) {}

  @ApiBody({ type: CreateAccessRequestDto })
  @Post()
  async createRequest(
    @Body() { answers, organizationId }: CreateAccessRequestDto,
    @ExtractUser() user: IRegularUserModel,
  ): Promise<AccessRequestPresenter> {
    const accessRequest = await this.createAccessRequestUseCase.execute({
      answers: answers,
      organizationId: organizationId,
      requestedById: user.id,
    });

    return new AccessRequestPresenter(accessRequest);
  }

  @ApiBody({ type: CreateAccessRequestDto })
  @Delete(':id/cancel')
  async cancelAccessRequest(
    @Param('id', UuidValidationPipe) organizationId: string,
    @ExtractUser() user: IRegularUserModel,
  ): Promise<string> {
    return this.cancelAccessRequestUsecase.execute(organizationId, user.id);
  }
}
