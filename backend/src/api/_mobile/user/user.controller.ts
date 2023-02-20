import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateRegularUsereUseCaseService } from 'src/usecases/user/create-regular-user.usecase';
import { CreateRegularUserDto } from './dto/create-regular-user.dto';

@ApiBearerAuth()
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
}
