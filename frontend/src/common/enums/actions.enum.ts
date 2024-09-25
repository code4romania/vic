export enum TrackedEventName {
  // Organization Profile
  UPDATE_ORGANIZATION_PROFILE = 'UPDATE_ORGANIZATION_PROFILE',

  // Organization Structure
  CREATE_ORGANIZATION_STRUCTURE = 'CREATE_ORGANIZATION_STRUCTURE',
  UPDATE_ORGANIZATION_STRUCTURE = 'UPDATE_ORGANIZATION_STRUCTURE',
  DELETE_ORGANIZATION_STRUCTURE = 'DELETE_ORGANIZATION_STRUCTURE',

  // Access Request
  APPROVE_ACCESS_REQUEST = 'APPROVE_ACCESS_REQUEST',
  REJECT_ACCESS_REQUEST = 'REJECT_ACCESS_REQUEST',
  DELETE_ACCESS_REQUEST = 'DELETE_ACCESS_REQUEST',

  // Volunteers
  CHANGE_VOLUNTEER_STATUS = 'CHANGE_VOLUNTEER_STATUS',
  UPDATE_VOLUNTEER_PROFILE = 'UPDATE_VOLUNTEER_PROFILE',

  // Activity Log
  REGISTER_ACTIVITY_LOG = 'REGISTER_ACTIVITY_LOG',
  CHANGE_ACTIVITY_LOG_STATUS = 'CHANGE_ACTIVITY_LOG_STATUS',

  // Activity Categories/Types
  CREATE_ACTIVITY_TYPE = 'CREATE_ACTIVITY_TYPE',
  UPDATE_ACTIVITY_TYPE = 'UPDATE_ACTIVITY_TYPE',
  CHANGE_ACTIVITY_TYPE_STATUS = 'CHANGE_ACTIVITY_TYPE_STATUS',

  // Events
  CREATE_EVENT = 'CREATE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  CHANGE_EVENT_STATUS = 'CHANGE_EVENT_STATUS',

  // Announcements
  CREATE_ANNOUNCEMENT = 'CREATE_ANNOUNCEMENT',
  DELETE_ANNOUNCEMENT = 'DELETE_ANNOUNCEMENT',
  PUBLISH_ANNOUNCEMENT = 'PUBLISH_ANNOUNCEMENT',

  // Documents
  CREATE_CONTRACT = 'CREATE_CONTRACT',
  APPROVE_CONTRACT = 'APPROVE_CONTRACT',
  REJECT_CONTRACT = 'REJECT_CONTRACT',

  // New Documents
  CREATE_DOCUMENT_CONTRACT = 'CREATE_DOCUMENT_CONTRACT', // done
  VALIDATE_DOCUMENT_CONTRACT = 'VALIDATE_DOCUMENT_CONTRACT', // done
  SIGN_DOCUMENT_CONTRACT_BY_NGO = 'SIGN_DOCUMENT_CONTRACT_BY_NGO',
  SIGN_DOCUMENT_CONTRACT_BY_VOLUNTEER = 'SIGN_DOCUMENT_CONTRACT_BY_VOLUNTEER', // cannot do it
  REJECT_DOCUMENT_CONTRACT_BY_NGO = 'REJECT_DOCUMENT_CONTRACT_BY_NGO', // done
  REJECT_DOCUMENT_CONTRACT_BY_VOLUNTEER = 'REJECT_DOCUMENT_CONTRACT_BY_VOLUNTEER', // cannot do it
  DELETE_DOCUMENT_CONTRACT = 'DELETE_DOCUMENT_CONTRACT',
}
