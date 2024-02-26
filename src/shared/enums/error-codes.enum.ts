export enum ErrorCodesEnum {
  // ===== common =====
  InvalidForm = 'errors.invalid-form',
  UniqueField = 'errors.invalid-form.field-must-be-unique: ',
  NotFound = 'errors.not-found: ',

  // ===== auth =====
  UserAlreadyExists = 'errors.invalid-form.user-already-exists',
  UserNotExists = 'errors.invalid-token.user-does-not-exist',
  UserNotActive = 'errors.invalid-token.user-is-not-active',
  TokenExpired = 'errors.invalid-token.token-expired',
  WrongPayload = 'errors.invalid-token.wrong-payload',
  PayloadOutdated = 'errors.invalid-token.payload-is-outdated',

  // ===== permissions =====
  NotEnoughPermissions = 'errors.invalid-token.do-not-have-the-necessary-permissions: ',
}
