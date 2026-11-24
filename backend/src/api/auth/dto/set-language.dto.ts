import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Language } from 'src/modules/user/enums/user.enum';

export class SetLanguageDto {
  @ApiProperty({ enum: Language, example: Language.EN })
  @IsEnum(Language)
  language: Language;

  // True when the person picked the language in the app. Without it the app only reports the language
  // it detected, which is kept only if the account has none yet.
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  explicit?: boolean;
}
