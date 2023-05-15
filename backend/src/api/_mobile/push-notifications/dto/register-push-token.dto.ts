import { IsNotEmpty } from 'class-validator';

export class RegisterPushTokenDto {
  @IsNotEmpty()
  token: string;
}
