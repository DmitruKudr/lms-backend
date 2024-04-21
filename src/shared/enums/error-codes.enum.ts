export enum ErrorCodesEnum {
  // ===== common =====
  InvalidForm = 'errors.invalid-form',
  UniqueField = 'errors.invalid-form.field-must-be-unique: ',
  NotFound = 'errors.not-found: ',
  InvalidQueryValue = 'errors.query-parameter.invalid-value-of-parameter: ',
  UserAlreadyExists = 'errors.invalid-form.user-already-exists-with-this-field: ',

  // ===== auth =====
  UserDoesNotExist = 'errors.authorization.user-does-not-exist',
  UserIsNotActive = 'errors.authorization.user-is-not-active',
  NotAuthorized = 'errors.authorization.not-authorized-request',
  InvalidPassword = 'errors.authorization.invalid-password',
  InvalidRefresh = 'errors.authorization.invalid-refresh-token',

  // ===== forbidden =====
  NotEnoughPermissions = 'errors.forbidden.user-does-not-have-necessary-permissions: ',
  NotEnoughAdminPermissions = 'errors.forbidden.admin-does-not-have-necessary-permissions: ',
  NotRequiredRole = 'errors.forbidden.user-role-must-be-one-of-the-following-roles: ',
  NotCurrentUser = 'errors.forbidden.not-current-user',

  // ===== special =====
  NotAdminRole = 'errors.invalid-form.user-role-must-be-not-admin: ',
  InvalidRole = 'errors.invalid-form.user-role-must-be: ',
  NotIdParameter = 'errors.parameter.parameter-must-be-in-id-format: ',
  InvalidOldPassword = 'errors.invalid-form.old-password-is-invalid: ',
  InvalidJSON = 'errors.invalid-form.invalid-json: ',

  // ===== file validation =====
  // InvalidFileSize = 'errors.invalid-form.file-size-must-be-less-than: ',
  InvalidFileSize = 'errors.invalid-form.invalid-file-size: ',
  InvalidFileFormat = 'errors.invalid-form.invalid-file-format: ',
  UnknownFileFormat = 'errors.invalid-form.unknown-file-format: ',
  FileIsNotProvided = 'errors.invalid-form.file-is-not-provided: ',
  SameFileFormat = 'errors.invalid-form.all-files-must-be-same-format: ',

  // ===== connections =====
  ConnectionAlreadyExists = 'errors.invalid-form.connection-already-exists: ',

  // ===== tests =====
  InvalidTestItemAnswer = 'errors.invalid-form.invalid-test-item-answer: ',
  TestItemOptionsAreNotProvided = 'errors.invalid-form.test-item-options-are-not-provided: ',
  TestItemOptionFilesAreNotProvided = 'errors.invalid-form.test-item-option-files-are-not-provided: ',
  UnknownTestItemOptionType = 'errors.invalid-form.unknown-test-item-option-type: ',
}
