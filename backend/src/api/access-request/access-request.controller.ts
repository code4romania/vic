import { Body } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ApproveAccessRequestUseCase } from 'src/usecases/access-request/approve-access-request.usecase';
import { GetAccessRequestUseCase } from 'src/usecases/access-request/get-access-request.usecase';
import { RejectAccessRequestUseCase } from 'src/usecases/access-request/reject-access-request.usecase';
import { RejectAccessRequestDto } from './dto/reject-access-request.dto';
import { AccessRequestPresenter } from './presenters/access-request.presenter';

@UseGuards(WebJwtAuthGuard)
@Controller('access-code')
export class AccessCodeController {
  constructor(
    private readonly getAccessRequestUseCase: GetAccessRequestUseCase,
    private readonly approveAccessRequestUseCase: ApproveAccessRequestUseCase,
    private readonly rejectAccessRequestUseCase: RejectAccessRequestUseCase,
  ) {}

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(
    @Param('id', UuidValidationPipe) accessRequestId: string,
  ): Promise<AccessRequestPresenter> {
    const accessRequest = await this.getAccessRequestUseCase.execute(
      accessRequestId,
    );
    return new AccessRequestPresenter(accessRequest);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Post(':id/approve')
  async approve(
    @ExtractUser() user: IAdminUserModel,
    @Param('id', UuidValidationPipe) accessRequestId: string,
  ): Promise<AccessRequestPresenter> {
    const accessRequest = await this.approveAccessRequestUseCase.execute({
      id: accessRequestId,
      updatedById: user.id,
    });
    return new AccessRequestPresenter(accessRequest);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Post(':id/reject')
  async reject(
    @ExtractUser() user: IAdminUserModel,
    @Body() { rejectionReason }: RejectAccessRequestDto,
    @Param('id', UuidValidationPipe) accessRequestId: string,
  ): Promise<AccessRequestPresenter> {
    const accessRequest = await this.rejectAccessRequestUseCase.execute({
      id: accessRequestId,
      updatedById: user.id,
      rejectionReason: rejectionReason,
    });
    return new AccessRequestPresenter(accessRequest);
  }
}
