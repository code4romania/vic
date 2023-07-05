import { IsNotEmpty } from 'class-validator';

export class UnregisterPushTokenDto {
  @IsNotEmpty()
  token: string;
}
