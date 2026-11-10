import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { eraseRegularUser } from './personal-data-erasure';

// A volunteer deletes their VIC account (M8, GDPR): everything about them goes in one transaction
// (see personal-data-erasure.ts for what is deleted and what is anonymized); the files in S3 are
// deleted after the commit, best effort.
@Injectable()
export class DeleteAccountRegularUserUsecase implements IUseCaseService<void> {
  private readonly logger = new Logger(DeleteAccountRegularUserUsecase.name);

  constructor(
    private readonly userService: UserFacadeService,
    private readonly exceptionService: ExceptionsService,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
  ) {}

  async execute(userId: string): Promise<void> {
    // A0. a volunteer with no profile has no id; never run the deletion without one
    if (!userId) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    // A1. check if user exists
    const user = await this.userService.findRegularUser({ id: userId });
    if (!user) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    let files: string[];
    try {
      ({ files } = await this.dataSource.transaction((manager) =>
        eraseRegularUser(manager, userId),
      ));
    } catch (error) {
      this.logger.error({
        ...UserExceptionMessages.USER_007,
        error: JSONStringifyError(error),
      });
      this.exceptionService.internalServerErrorException(
        UserExceptionMessages.USER_007,
      );
    }

    await Promise.all(
      files.map((path) =>
        this.s3Service
          .deleteFile(path)
          .catch((error) =>
            this.logger.error(
              `Could not delete ${path} of a deleted account`,
              JSONStringifyError(error),
            ),
          ),
      ),
    );
  }
}
