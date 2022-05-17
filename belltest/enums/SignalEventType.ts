/**
 * session.signal()のイベントタイプ
 */
export const SignalEventTypeEnum = {
  /**
   * 入室許可
   */
  ALLOW_ENTER: 'allowEnter',

  /**
   * 顧客のみ強制退出
   */
  FORCE_CUSTOMER_LEAVING: 'forceCustomerLeaving',

  /**
   * ホスト含む全員強制退出
   */
  FORCE_ALL_LEAVING: 'forceAllLeaving',

  /**
   * 画面共有含むビデオストリーム入室
   */
  ENTERED_ROOM: 'enteredRoom',

  /**
   * 入室リクエスト（顧客用）
   */
  REQUEST_ENTER: 'requestEnter',

  /**
   * ホストネット接続切断Cookie情報取得時
   */
  HOST_DISCONNECTED_COOKIE_INFO: 'hostDisconnectedCookie',

  /**
   * 顧客ビデオ非表示時
   */
  CUSTOMER_VIDEO_DISABLED: 'CustomerVideoDisabled',

  /**
   * ホストビデオ非表示時
   */
  HOST_VIDEO_DISABLED: 'HostVideoDisabled',
} as const

export type SignalEventType = keyof typeof SignalEventTypeEnum

export const ALLOW_ENTER = SignalEventTypeEnum.ALLOW_ENTER
export const FORCE_CUSTOMER_LEAVING = SignalEventTypeEnum.FORCE_CUSTOMER_LEAVING
export const FORCE_ALL_LEAVING = SignalEventTypeEnum.FORCE_ALL_LEAVING
export const ENTERED_ROOM = SignalEventTypeEnum.ENTERED_ROOM
export const REQUEST_ENTER = SignalEventTypeEnum.REQUEST_ENTER
export const HOST_DISCONNECTED_COOKIE_INFO =
  SignalEventTypeEnum.HOST_DISCONNECTED_COOKIE_INFO
export const CUSTOMER_VIDEO_DISABLED =
  SignalEventTypeEnum.CUSTOMER_VIDEO_DISABLED
export const HOST_VIDEO_DISABLED = SignalEventTypeEnum.HOST_VIDEO_DISABLED
