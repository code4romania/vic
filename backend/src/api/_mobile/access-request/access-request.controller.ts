import { Body } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AccessRequestPresenter } from 'src/api/access-request/presenters/access-request.presenter';
import { CreateAccessRequestUseCase } from 'src/usecases/access-request/create-access-request.usecase';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';

// @UseGuards(WebJwtAuthGuard, AccessRequestGuard)
// TODO: add MobileJwtAuthGuard
@ApiBearerAuth()
@Controller('mobile/access-request')
export class MobileAccessRequestController {
  constructor(
    private readonly createAccessRequestUseCase: CreateAccessRequestUseCase,
  ) {}

  @ApiBody({ type: CreateAccessRequestDto })
  @Post()
  async createRequest(
    // TODO: add ExtractUser
    @Body() { answers, organizationId, userId }: CreateAccessRequestDto,
  ): Promise<AccessRequestPresenter> {
    const accessRequest = await this.createAccessRequestUseCase.execute({
      answers: answers,
      organizationId: organizationId,
      requestedById: userId,
    });

    return new AccessRequestPresenter(accessRequest);
  }
}
