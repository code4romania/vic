import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { Language } from 'src/modules/user/enums/user.enum';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { UserLanguageService } from 'src/modules/user/services/user-language.service';

// The language of a person's apps, push notifications and emails.
// explicit = the person picked it in the app: it replaces what was stored, on every device.
// Otherwise the app reports the language it detected, which only fills an account that has none.
@Injectable()
export class SetUserLanguageUseCase implements IUseCaseService<Language> {
  constructor(
    private readonly userLanguageService: UserLanguageService,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute(
    userId: string,
    language: Language,
    explicit = false,
  ): Promise<Language> {
    // A volunteer with no profile has no id; TypeORM drops an undefined where key and would update every user.
    if (!userId) {
      this.exceptionService.notFoundException(UserExceptionMessages.USER_001);
    }

    return explicit
      ? this.userLanguageService.set(userId, language)
      : this.userLanguageService.fillIfEmpty(userId, language);
  }
}
