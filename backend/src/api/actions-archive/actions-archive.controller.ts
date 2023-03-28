import { UseGuards, Controller, Query, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetManyActionsArchiveUseCase } from 'src/usecases/actions-archive/get-many-actions-archive.usecase';
import { GetManyActionsArchiveDto } from './dto/get-actions-history.dto';
import { ActionArchiveListItemPresenter } from './presenters/action-history-list-item.presenter';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('actions-archive')
export class ActionsArchiveController {
  constructor(
    private readonly getManyActionsArchive: GetManyActionsArchiveUseCase,
  ) {}

  @Get()
  @ApiPaginatedResponse(ActionArchiveListItemPresenter)
  async getNew(
    @Query() filters: GetManyActionsArchiveDto,
    @ExtractUser() user: IAdminUserModel,
  ): Promise<PaginatedPresenter<ActionArchiveListItemPresenter>> {
    const actionsHistory = await this.getManyActionsArchive.execute({
      ...filters,
      organizationId: user.organizationId,
    });

    return new PaginatedPresenter({
      ...actionsHistory,
      items: actionsHistory.items.map(
        (accessRequest) => new ActionArchiveListItemPresenter(accessRequest),
      ),
    });
  }
}
