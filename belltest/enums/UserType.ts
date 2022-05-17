/**
 * 通話参加者のユーザータイプ
 */
export const UserTypeEnum = {
  /**
   * ホスト（接客員）
   */
  HOST: 'HOST',

  /**
   * スタッフ（査定員, 見学者）
   */
  STAFF: 'STAFF',

  /**
   * お客様
   */
  CUSTOMER: 'CUSTOMER',

  /**
   * 画面共有ビデオ
   */
  SCREEN: 'SCREEN',
} as const

export type UserType = keyof typeof UserTypeEnum

export const isHost = (userType: UserType): boolean =>
  userType === UserTypeEnum.HOST
export const isStaff = (userType: UserType): boolean =>
  userType === UserTypeEnum.STAFF
export const isCustomer = (userType: UserType): boolean =>
  userType === UserTypeEnum.CUSTOMER
export const isScreen = (userType: UserType): boolean =>
  userType === UserTypeEnum.SCREEN
