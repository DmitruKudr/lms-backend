export enum ErrorCodesEnum {
  // ===== common =====
  InvalidForm = 'errors.invalid-form',
  UniqueField = 'errors.invalid-form.field-must-be-unique: ',
  NotFound = 'errors.not-found: ',

  // ===== auth =====
  UserAlreadyExists = 'errors.invalid-form.user-already-exists',
  UserNotExists = 'errors.authorization.user-does-not-exist',
  UserNotActive = 'errors.authorization.user-is-not-active',
  NotAuthorized = 'errors.authorization.not-authorized-request',
  InvalidPassword = 'errors.authorization.invalid-password',
  InvalidRefresh = 'errors.authorization.invalid-refresh-token',

  // ===== forbidden =====
  NotEnoughPermissions = 'errors.forbidden.user-does-not-have-necessary-permissions: ',
  NotCurrentUser = 'errors.forbidden.not-current-user',

  // ===== special =====
  InvalidRole = 'errors.invalid-form.role-must-be-not-admin: ',
}
