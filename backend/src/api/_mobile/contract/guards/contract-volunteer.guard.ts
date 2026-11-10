import { isUUID } from 'class-validator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { MobileOwnershipService } from 'src/usecases/volunteer/mobile-ownership.service';

// Contracts carry presigned links to the signed PDFs: a volunteer reads only their own.
// :contractId must be a contract of the user's volunteers (404 CONTRACT_002) and ?volunteerId,
// when given, one of the user's volunteers (404 VOLUNTEER_001).
@Injectable()
export class ContractVolunteerGuard implements CanActivate {
  constructor(private readonly ownership: MobileOwnershipService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: IRegularUserModel = request.user;
    if (!user) return false;

    this.ownership.assertHasProfile(user);

    const contractId: string = request.params?.contractId;
    // A malformed id is left to the UuidValidationPipe (400)
    if (contractId && isUUID(contractId)) {
      await this.ownership.contract(user.id, contractId);
    }

    const volunteerId: string = request.query?.volunteerId;
    if (volunteerId) {
      await this.ownership.volunteer(user.id, volunteerId);
    }

    return true;
  }
}
