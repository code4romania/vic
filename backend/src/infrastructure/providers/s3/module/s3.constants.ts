export const FILE_URL_EXPIRATION_TIME = 60 * 60 * 24 * 1; //60sec * 60min * 24h * 1day
export enum FILE_TYPE {
  FILE = 'file',
  IMAGE = 'image',
}
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const VALID_FILE_TYPES = [
  'application/pdf', //.pdf
  'application/msword', //.doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', //.docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', //.excel
];
