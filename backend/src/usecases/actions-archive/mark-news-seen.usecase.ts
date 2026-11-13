import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';

// The volunteer opened "Noutăți": everything up to now is read.
@Injectable()
export class MarkNewsSeenUsecase implements IUseCaseService<void> {
  constructor(private readonly userFacade: UserFacadeService) {}

  public async execute(userId: string): Promise<void> {
    await this.userFacade.markNewsSeen(userId);
  }
}
