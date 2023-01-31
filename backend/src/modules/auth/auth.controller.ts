import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AllJwtAuthGuard } from './guards/jwt-all.guard';
import { MobileJwtAuthGuard } from './guards/jwt-mobile.guard';
import { WebJwtAuthGuard } from './guards/jwt-web.guard';

// @UseGuards(WebJwtAuthGuard)
// @UseGuards(MobileJwtAuthGuard)
@UseGuards(AllJwtAuthGuard)
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor() {}

  @Get('imloggedin')
  async imloggedin(@Request() req) {
    return 'OK';
  }
}
