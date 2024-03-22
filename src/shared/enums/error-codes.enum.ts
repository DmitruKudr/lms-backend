export enum ErrorCodesEnum {
  // ===== common =====
  InvalidForm = 'errors.invalid-form',
  UniqueField = 'errors.invalid-form.field-must-be-unique: ',
  NotFound = 'errors.not-found: ',
  InvalidQueryValue = 'errors.query-parameter.invalid-value-of-parameter: ',

  // ===== auth =====
  UserAlreadyExists = 'errors.invalid-form.user-already-exists',
  UserNotExists = 'errors.authorization.user-does-not-exist',
  UserNotActive = 'errors.authorization.user-is-not-active',
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
}
