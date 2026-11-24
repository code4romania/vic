import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Language } from 'src/modules/user/enums/user.enum';

// The language stored on the account after PATCH …/language.
export class LanguagePresenter {
  constructor(language: Language) {
    this.language = language;
  }

  @Expose()
  @ApiProperty({ enum: Language })
  language: Language;
}
