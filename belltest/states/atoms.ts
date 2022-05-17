import { Device } from 'opentok-react/types/opentok'
import { atom } from 'recoil'
import { ParticipantType } from '../types/Participants'
import { RoomInfo } from '../types/RoomInfo'
import { UserType } from '../enums/UserType'

export const isReadyForEnterState = atom<boolean>({
  key: 'isReadyToEnterState',
  default: false,
})

export const canEnterState = atom<boolean>({
  key: 'canEnterState',
  default: false,
})

export const roomInfoState = atom<RoomInfo | null>({
  key: 'roomInfoState',
  default: null,
})

export const participantsState = atom<ParticipantType[]>({
  key: 'participantsState',
  default: [],
})

export const showModalState = atom<boolean>({
  key: 'showModalState',
  default: false,
})

export const canGetRoomInfoState = atom<boolean>({
  key: 'canGetRoomInfoState',
  default: true,
})

// tmpデバイス設定
export const tmpAudioState = atom<boolean>({
  key: 'tmpAudioState',
  default: true,
})
export const tmpVideoState = atom<boolean>({
  key: 'tmpVideoState',
  default: true,
})
export const tmpMicDeviceIdState = atom<string>({
  key: 'tmpMicDeviceIdState',
  default: '',
})
export const tmpVideoDeviceIdState = atom<string>({
  key: 'tmpVideoDeviceIdState',
  default: '',
})
export const tmpSpeakerDeviceIdState = atom<string>({
  key: 'tmpSpeakerDeviceIdState',
  default: '',
})

// デバイス設定
export const audioState = atom<boolean>({
  key: 'audioState',
  default: true,
})
export const videoState = atom<boolean>({
  key: 'videoState',
  default: true,
})
export const speakerDeviceIdState = atom<string>({
  key: 'speakerDeviceIdState',
  default: '',
})

export const micDevicesState = atom<Device[]>({
  key: 'micDevicesState',
  default: [],
})
export const videoDevicesState = atom<Device[]>({
  key: 'videoDevicesState',
  default: [],
})
export const speakerDevicesState = atom<MediaDeviceInfo[]>({
  key: 'speakerDevicesState',
  default: [],
})

// プレビュー画面上において、内カメラか外カメラかを判断するためのステート
export const isInnerCameraState = atom<boolean>({
  key: 'isInnerCameraState',
  default: true,
})

// 入室前のプレビュービデオが読み込まれたか？
export const isPreviewLoadedState = atom<boolean>({
  key: 'isPreviewLoadedState',
  default: false,
})

// 顧客が入室してからの経過時間(秒)
export const passedSecondsState = atom<number>({
  key: 'passedSecondsState',
  default: 0,
})

// 顧客が入室してタイマーがスタートしているか？
export const timerIsStartedState = atom<boolean>({
  key: 'timerIsStartedState',
  default: false,
})

// エラー
export const errorState = atom<string>({
  key: 'errorState',
  default: '',
})

// サブビデオ表示の有無
export const displayingSubVideoState = atom<boolean>({
  key: 'displayingSubVideo',
  default: true,
})

// ホスト側のネット接続切断Cookie情報有無
export const hostDisconnectedCookieState = atom<boolean>({
  key: 'hostDisconnectedCookieState',
  default: false,
})

// ビデオ非表示のユーザータイプ検知
export const videoDisabledUserTypeState = atom<UserType | null>({
  key: 'videoDisabledUserTypeState',
  default: null,
})

// ホスト側のビデオ非表示
export const hostVideoDisabledState = atom<boolean>({
  key: 'hostVideoDisabled',
  default: false,
})

// 顧客側のビデオ非表示
export const customerVideoDisabledState = atom<boolean>({
  key: 'customerVideoDisabled',
  default: false,
})
