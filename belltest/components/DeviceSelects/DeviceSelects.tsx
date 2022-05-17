import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import styles from './DeviceSelects.module.scss'

import mic from '../../images/mic.png'
import camera from '../../images/video.png'
import speaker from '../../images/sound.png'
import { Device } from 'opentok-react/types/opentok'
import {
  displayVideoSelect,
  isDesktopChrome,
  isMobilePhone,
  isInnerCameraName,
  getAndroidVersion,
} from '../../libs'
import {
  tmpMicDeviceIdState,
  tmpVideoDeviceIdState,
  tmpSpeakerDeviceIdState,
  isInnerCameraState,
  speakerDevicesState,
  videoDevicesState,
  micDevicesState,
} from '../../states/atoms'

type Props = {
  isSettingAfterEnter?: boolean | undefined
}

export default function DeviceSelects({ isSettingAfterEnter }: Props) {
  const micDevices = useRecoilValue(micDevicesState)
  const videoDevices = useRecoilValue(videoDevicesState)
  const speakerDevices = useRecoilValue(speakerDevicesState)
  const [tmpMicDeviceId, setTmpMicDeviceId] =
    useRecoilState(tmpMicDeviceIdState)
  const [tmpVideoDeviceId, setTmpVideoDeviceId] = useRecoilState(
    tmpVideoDeviceIdState
  )
  const [tmpSpeakerDeviceId, setTmpSpeakerDeviceId] = useRecoilState(
    tmpSpeakerDeviceIdState
  )
  const setIsInnerCamera = useSetRecoilState(isInnerCameraState)

  function createDeviceOptions(devices: Device[] | MediaDeviceInfo[]) {
    // デバイスの種類によって選択済みか判定
    const matchedDeviceId = (device: Device | MediaDeviceInfo) => {
      switch (device.kind) {
        case 'videoInput':
          return device.deviceId === tmpVideoDeviceId
        case 'audioInput':
          return device.deviceId === tmpMicDeviceId
        case 'audiooutput':
          return device.deviceId === tmpSpeakerDeviceId
        default:
          return false
      }
    }

    return devices.map((_device, i: number) => (
      <option
        key={i}
        value={_device.deviceId}
        selected={matchedDeviceId(_device)}
      >
        {_device.label}
      </option>
    ))
  }

  // カメラが切り替わったタイミングでそれが内カメか判定(スマホのみ)
  const handleIsInnerCamera = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isMobilePhone()) {
      return
    }

    const videoDeviceId = e.target.value
    const selectedOptionElm = e.target.querySelector(
      `option[value="${videoDeviceId}"]`
    )

    if (!selectedOptionElm) {
      return
    }

    setIsInnerCamera(isInnerCameraName(selectedOptionElm.innerHTML))
  }

  return (
    <div
      className={`${styles.deviceSettings} ${
        isSettingAfterEnter && 'ml-0' // 入室後の設定モーダルでの不要なマージンを消す
      }`}
    >
      <div className={`${styles.selectWrap}`}>
        <img src={mic} alt="マイク" className={`${styles.icon} mx-12`} />
        <select
          className={styles.select}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setTmpMicDeviceId(e.target.value)
          }
        >
          {/* マイク設定(PC, Android9以上のみ設定可能) */}
          {!isMobilePhone() || getAndroidVersion() >= 9 ? (
            createDeviceOptions(micDevices)
          ) : (
            <option value="">デフォルトのマイク</option>
          )}
        </select>
        <i
          className={`fa fa-caret-down ${styles.selectMark}`}
          aria-hidden="true"
        ></i>
      </div>

      {displayVideoSelect(videoDevices) && (
        <div className={`${styles.selectWrap}`}>
          <img src={camera} alt="カメラ" className={`${styles.icon} mx-12`} />
          <select
            className={styles.select}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setTmpVideoDeviceId(e.target.value)
              handleIsInnerCamera(e)
            }}
          >
            {createDeviceOptions(videoDevices)}
          </select>
          <i
            className={`fa fa-caret-down ${styles.selectMark}`}
            aria-hidden="true"
          ></i>
        </div>
      )}

      <div className={`${styles.selectWrap}`}>
        <img
          src={speaker}
          alt="スピーカー"
          className={`${styles.icon} mx-12`}
        />
        <select
          className={styles.select}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setTmpSpeakerDeviceId(e.target.value)
          }
        >
          {/* PC版Chromeのみ選択可能 */}
          {isDesktopChrome() ? (
            createDeviceOptions(speakerDevices)
          ) : (
            <option value="">デフォルトのスピーカー</option>
          )}
        </select>
        <i
          className={`fa fa-caret-down ${styles.selectMark}`}
          aria-hidden="true"
        ></i>
      </div>
    </div>
  )
}
