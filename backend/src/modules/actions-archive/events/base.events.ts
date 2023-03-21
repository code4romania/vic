import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

abstract class BaseAdminActionEvent {
  createdBy: IAdminUserModel;

  constructor(createdBy: IAdminUserModel) {
    this.createdBy = createdBy;
  }
}

export class CreateResourceEvent extends BaseAdminActionEvent {
  id: string;

  constructor(id: string, createdBy: IAdminUserModel) {
    super(createdBy);
    this.id = id;
  }
}

export class UpdateResourceEvent extends BaseAdminActionEvent {
  id: string;
  diff: unknown;

  constructor(id: string, createdBy: IAdminUserModel, diff: unknown) {
    super(createdBy);
    this.id = id;
    this.diff = diff;
  }
}

export class DeleteResourceEvent extends BaseAdminActionEvent {
  id: string;
  diff: unknown;

  constructor(id: string, createdBy: IAdminUserModel, diff: unknown) {
    super(createdBy);
    this.id = id;
    this.diff = diff;
  }
}
