/**
 * Cookie名タイプ
 */
export const CookieNameTypeEnum = {
  /**
   * ホストネット切断
   */
  HOST_DISCONNECTED: 'hostDisconnected',
} as const

export type SignalEventType = keyof typeof CookieNameTypeEnum

export const HOST_DISCONNECTED = CookieNameTypeEnum.HOST_DISCONNECTED
