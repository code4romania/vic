import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// List it after WebJwtAuthGuard: @UseGuards(WebJwtAuthGuard, SuperAdminGuard). The global RolesGuard runs
// before the controller JWT guards and never sees request.user, so @Roles cannot do this (decisions R28).
// Returning false answers 403.
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    return user?.superAdmin === true;
  }
}
