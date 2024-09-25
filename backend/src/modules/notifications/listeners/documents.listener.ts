import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import { NOTIFICATIONS } from 'src/common/constants/notifications';
import { PushNotificationsFacade } from '../notifications.facade';
import { MailService } from 'src/modules/mail/services/mail.service';
import GenerateContractEvent from '../events/documents/generate-contract.event';
import RejectContractEvent from '../events/documents/reject-contract.event';
import SignContractEvent from '../events/documents/sign-contract.event';

@Injectable()
export class DocumentsListener {
  constructor(
    private readonly mailService: MailService,
    private readonly pushNotificationsFacade: PushNotificationsFacade,
  ) {}

  @OnEvent(EVENTS.DOCUMENTS.GENERATE_CONTRACT)
  async onGenerateContractEvent(payload: GenerateContractEvent): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaPush,
      organizationName,
      contractId,
      userEmail,
      notificationsViaEmail,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.DOCUMENTS.GENERATE_CONTRACT,
        payload: {
          contractId,
          organizationId,
        },
      };
      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: NOTIFICATIONS.NEW_CONTRACT.PUSH.title,
        body: NOTIFICATIONS.NEW_CONTRACT.PUSH.body(organizationName),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.mailService.sendEmail({
        to: userEmail,
        subject: NOTIFICATIONS.NEW_CONTRACT.EMAIL.subject(organizationName),
        context: {
          title: NOTIFICATIONS.NEW_CONTRACT.EMAIL.subject(organizationName),
          subtitle: NOTIFICATIONS.NEW_CONTRACT.EMAIL.body,
        },
      });
    }
  }

  @OnEvent(EVENTS.DOCUMENTS.SIGN_CONTRACT_BY_NGO)
  async onSignContractEvent(payload: SignContractEvent): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaPush,
      organizationName,
      contractId,
      userEmail,
      notificationsViaEmail,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.DOCUMENTS.SIGN_CONTRACT_BY_NGO,
        payload: {
          contractId,
          organizationId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: NOTIFICATIONS.SIGN_CONTRACT_BY_NGO.PUSH.title,
        body: NOTIFICATIONS.SIGN_CONTRACT_BY_NGO.PUSH.body(organizationName),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.mailService.sendEmail({
        to: userEmail,
        subject:
          NOTIFICATIONS.SIGN_CONTRACT_BY_NGO.EMAIL.subject(organizationName),
        context: {
          title:
            NOTIFICATIONS.SIGN_CONTRACT_BY_NGO.EMAIL.subject(organizationName),
          subtitle: NOTIFICATIONS.SIGN_CONTRACT_BY_NGO.EMAIL.body,
        },
      });
    }
  }

  @OnEvent(EVENTS.DOCUMENTS.REJECT_CONTRACT_BY_NGO)
  async onRejectContractEvent(payload: RejectContractEvent): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaPush,
      organizationName,
      contractId,
      userEmail,
      notificationsViaEmail,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.DOCUMENTS.REJECT_CONTRACT_BY_NGO,
        payload: {
          contractId,
          organizationId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: NOTIFICATIONS.REJECT_CONTRACT.PUSH.title,
        body: NOTIFICATIONS.REJECT_CONTRACT.PUSH.body(organizationName),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.mailService.sendEmail({
        to: userEmail,
        subject: NOTIFICATIONS.REJECT_CONTRACT.EMAIL.subject(organizationName),
        context: {
          title: NOTIFICATIONS.REJECT_CONTRACT.EMAIL.subject(organizationName),
          subtitle: NOTIFICATIONS.REJECT_CONTRACT.EMAIL.body,
        },
      });
    }
  }
}
