import { NotFoundException } from '@nestjs/common';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { Language } from 'src/modules/user/enums/user.enum';
import { UserLanguageService } from 'src/modules/user/services/user-language.service';
import { SetUserLanguageUseCase } from './set-user-language.usecase';

describe('SetUserLanguageUseCase', () => {
  let languages: { set: jest.Mock; fillIfEmpty: jest.Mock };
  let useCase: SetUserLanguageUseCase;

  beforeEach(() => {
    languages = {
      set: jest.fn(async (_id: string, language: Language) => language),
      fillIfEmpty: jest.fn().mockResolvedValue(Language.RO),
    };
    useCase = new SetUserLanguageUseCase(
      languages as unknown as UserLanguageService,
      new ExceptionsService(),
    );
  });

  it('a language the person picked replaces the stored one', async () => {
    await expect(useCase.execute('user-id', Language.EN, true)).resolves.toBe(
      Language.EN,
    );
    expect(languages.set).toHaveBeenCalledWith('user-id', Language.EN);
    expect(languages.fillIfEmpty).not.toHaveBeenCalled();
  });

  it('a detected language only fills an empty account, and the stored one comes back', async () => {
    // the account already says Romanian: the phone is in English, the answer stays Romanian
    await expect(useCase.execute('user-id', Language.EN)).resolves.toBe(
      Language.RO,
    );
    expect(languages.fillIfEmpty).toHaveBeenCalledWith('user-id', Language.EN);
    expect(languages.set).not.toHaveBeenCalled();
  });

  it('a volunteer with no profile yet (no id) changes nobody', async () => {
    await expect(
      useCase.execute(undefined, Language.EN, true),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(languages.set).not.toHaveBeenCalled();
    expect(languages.fillIfEmpty).not.toHaveBeenCalled();
  });
});
