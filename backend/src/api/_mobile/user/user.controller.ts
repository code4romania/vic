import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateRegularUsereUseCaseService } from 'src/usecases/user/create-regular-user.usecase';
import { CreateRegularUserDto } from './dto/create-regular-user.dto';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';

@ApiBearerAuth()
@UseGuards(MobileJwtAuthGuard)
@Controller('/mobile/user')
export class MobileRegularUserController {
  constructor(
    private createRegularUsereUseCaseService: CreateRegularUsereUseCaseService,
  ) {}

  @ApiBody({ type: CreateRegularUserDto })
  @Post()
  async create(@Body() newUser: CreateRegularUserDto): Promise<unknown> {
    return this.createRegularUsereUseCaseService.execute(newUser);
  }

  @Get()
  async getTestValue(): Promise<string> {
    return 'It works';
  }
}
