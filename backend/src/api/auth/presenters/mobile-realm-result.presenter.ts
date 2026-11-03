import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';

// The mobile-realm answer of set-password and confirm-email: no session, the page shows "Open the app"
// with vic://login?email= (decisions R17).
export class MobileRealmResultPresenter {
  constructor(email: string) {
    this.realm = AuthRealm.MOBILE;
    this.email = email;
  }

  @Expose()
  @ApiProperty({ enum: [AuthRealm.MOBILE] })
  realm: AuthRealm.MOBILE;

  @Expose()
  @ApiProperty({ example: 'elena@example.ro' })
  email: string;
}
