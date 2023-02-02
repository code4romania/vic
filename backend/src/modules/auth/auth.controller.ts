import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressReq } from 'express';
import { AllJwtAuthGuard } from './guards/jwt-all.guard';

// @UseGuards(WebJwtAuthGuard)
// @UseGuards(MobileJwtAuthGuard)
@UseGuards(AllJwtAuthGuard)
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  @Get('imloggedin')
  async imloggedin(@Request() req: ExpressReq): Promise<object> {
    return req?.user;
  }
}
