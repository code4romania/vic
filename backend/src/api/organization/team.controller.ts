import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IWebRequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { AddAdminUseCase } from 'src/usecases/team/add-admin.usecase';
import { ListTeamUseCase } from 'src/usecases/team/list-team.usecase';
import { SendInviteUseCase } from 'src/usecases/team/send-invite.usecase';
import { SetAdminStatusUseCase } from 'src/usecases/team/set-admin-status.usecase';
import { AddAdminDto } from './dto/add-admin.dto';
import { MaskedEmailPresenter } from './presenters/masked-email.presenter';
import { TeamMemberPresenter } from './presenters/team-member.presenter';

// The admins of the caller's own organization.
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('organization/team')
export class TeamController {
  constructor(
    private readonly listTeamUseCase: ListTeamUseCase,
    private readonly addAdminUseCase: AddAdminUseCase,
    private readonly sendInviteUseCase: SendInviteUseCase,
    private readonly setAdminStatusUseCase: SetAdminStatusUseCase,
  ) {}

  @ApiOkResponse({ type: TeamMemberPresenter, isArray: true })
  @Get()
  async list(
    @ExtractUser() admin: IWebRequestUser,
  ): Promise<TeamMemberPresenter[]> {
    const members = await this.listTeamUseCase.execute(admin.organizationId);
    return members.map((member) => new TeamMemberPresenter(member));
  }

  @ApiCreatedResponse({ type: MaskedEmailPresenter })
  @Post()
  async add(
    @ExtractUser() admin: IWebRequestUser,
    @Body() dto: AddAdminDto,
  ): Promise<MaskedEmailPresenter> {
    const { maskedEmail } = await this.addAdminUseCase.execute(admin, dto);
    return new MaskedEmailPresenter(maskedEmail);
  }

  @ApiOkResponse({ type: MaskedEmailPresenter })
  @HttpCode(HttpStatus.OK)
  @Post(':userId/invite')
  async invite(
    @ExtractUser() admin: IWebRequestUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<MaskedEmailPresenter> {
    const { maskedEmail } = await this.sendInviteUseCase.execute(admin, userId);
    return new MaskedEmailPresenter(maskedEmail);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':userId/disable')
  async disable(
    @ExtractUser() admin: IWebRequestUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.setAdminStatusUseCase.execute(admin, userId, false);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':userId/enable')
  async enable(
    @ExtractUser() admin: IWebRequestUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.setAdminStatusUseCase.execute(admin, userId, true);
  }
}
