import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDevicePushTokenDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsEmail()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
